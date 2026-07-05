import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { GeoPosition, SafeZone } from "@/types";
import {
    haversineDistance,
    getGeofenceStatus,
    deriveGeofenceEvents,
} from "./geofence";

const positionArb: fc.Arbitrary<GeoPosition> = fc.record({
    latitude: fc.double({ min: -85, max: 85, noNaN: true }),
    longitude: fc.double({ min: -180, max: 180, noNaN: true }),
    timestamp: fc
        .integer({ min: 0, max: 1_000_000 })
        .map((n) => new Date(1_750_000_000_000 + n * 1000).toISOString()),
});

const safeZoneArb: fc.Arbitrary<SafeZone> = fc.record({
    center: fc.record({
        latitude: fc.double({ min: -85, max: 85, noNaN: true }),
        longitude: fc.double({ min: -180, max: 180, noNaN: true }),
    }),
    radius: fc.integer({ min: 1, max: 5000 }),
});

describe("haversineDistance", () => {
    it("is zero from a point to itself", () => {
        fc.assert(
            fc.property(positionArb, (p) => {
                expect(haversineDistance(p, p)).toBe(0);
            })
        );
    });

    it("is symmetric and non-negative", () => {
        fc.assert(
            fc.property(positionArb, positionArb, (a, b) => {
                const ab = haversineDistance(a, b);
                const ba = haversineDistance(b, a);
                expect(ab).toBeGreaterThanOrEqual(0);
                expect(ab).toBeCloseTo(ba, 6);
            })
        );
    });
});

describe("getGeofenceStatus", () => {
    it("classifies isOutside exactly as distance > radius", () => {
        fc.assert(
            fc.property(positionArb, safeZoneArb, (pos, zone) => {
                const status = getGeofenceStatus(pos, zone);
                expect(status.isOutside).toBe(status.distance > zone.radius);
                expect(status.distance).toBeGreaterThanOrEqual(0);
            })
        );
    });
});

describe("deriveGeofenceEvents", () => {
    it("emits at most one event fewer than the number of readings", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 40 }), safeZoneArb, (history, zone) => {
                const events = deriveGeofenceEvents(history, zone);
                expect(events.length).toBeLessThanOrEqual(Math.max(0, history.length - 1));
            })
        );
    });

    it("produces strictly alternating event types", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 40 }), safeZoneArb, (history, zone) => {
                const events = deriveGeofenceEvents(history, zone);
                for (let i = 1; i < events.length; i++) {
                    expect(events[i].type).not.toBe(events[i - 1].type);
                }
            })
        );
    });

    it("references only timestamps that exist in the history", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 40 }), safeZoneArb, (history, zone) => {
                const stamps = new Set(history.map((h) => h.timestamp));
                for (const e of deriveGeofenceEvents(history, zone)) {
                    expect(stamps.has(e.timestamp)).toBe(true);
                }
            })
        );
    });

    it("is deterministic for identical input", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 40 }), safeZoneArb, (history, zone) => {
                expect(deriveGeofenceEvents(history, zone)).toEqual(
                    deriveGeofenceEvents(history, zone)
                );
            })
        );
    });
});
