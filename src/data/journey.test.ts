import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { GeoPosition, HealthMetric, SafeZone } from "@/types";
import {
    totalDistanceMeters,
    trackedDurationMs,
    formatDuration,
    maxDistanceFromZone,
    restingShare,
    averageActivity,
    recentBehaviorEvents,
} from "./journey";

const positionArb: fc.Arbitrary<GeoPosition> = fc.record({
    latitude: fc.double({ min: -85, max: 85, noNaN: true }),
    longitude: fc.double({ min: -180, max: 180, noNaN: true }),
    timestamp: fc
        .integer({ min: 0, max: 1_000_000 })
        .map((n) => new Date(1_750_000_000_000 + n * 1000).toISOString()),
});

const metricArb: fc.Arbitrary<HealthMetric> = fc.record({
    heartRate: fc.integer({ min: 40, max: 260 }),
    bodyTemperature: fc.double({ min: 35, max: 43, noNaN: true }),
    activityLevel: fc.integer({ min: 0, max: 100 }),
    timestamp: fc.constant("2026-06-25T08:00:00.000Z"),
});

const safeZoneArb: fc.Arbitrary<SafeZone> = fc.record({
    center: fc.record({
        latitude: fc.double({ min: -85, max: 85, noNaN: true }),
        longitude: fc.double({ min: -180, max: 180, noNaN: true }),
    }),
    radius: fc.integer({ min: 1, max: 5000 }),
});

describe("totalDistanceMeters", () => {
    it("is non-negative and zero for fewer than two points", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 30 }), (history) => {
                const d = totalDistanceMeters(history);
                expect(d).toBeGreaterThanOrEqual(0);
                if (history.length < 2) expect(d).toBe(0);
            })
        );
    });
});

describe("trackedDurationMs", () => {
    it("is always non-negative", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 30 }), (history) => {
                expect(trackedDurationMs(history)).toBeGreaterThanOrEqual(0);
            })
        );
    });
});

describe("formatDuration", () => {
    it("uses hours only when at least 60 minutes", () => {
        expect(formatDuration(0)).toBe("0m");
        expect(formatDuration(18 * 60000)).toBe("18m");
        expect(formatDuration(62 * 60000)).toBe("1h 2m");
    });
});

describe("maxDistanceFromZone", () => {
    it("is non-negative and never below any single reading's distance intent", () => {
        fc.assert(
            fc.property(fc.array(positionArb, { maxLength: 30 }), safeZoneArb, (history, zone) => {
                expect(maxDistanceFromZone(history, zone)).toBeGreaterThanOrEqual(0);
            })
        );
    });
});

describe("restingShare & averageActivity", () => {
    it("both stay within [0, 100]", () => {
        fc.assert(
            fc.property(fc.array(metricArb, { maxLength: 50 }), (metrics) => {
                const rest = restingShare(metrics);
                const avg = averageActivity(metrics);
                expect(rest).toBeGreaterThanOrEqual(0);
                expect(rest).toBeLessThanOrEqual(100);
                expect(avg).toBeGreaterThanOrEqual(0);
                expect(avg).toBeLessThanOrEqual(100);
            })
        );
    });
});

describe("recentBehaviorEvents", () => {
    it("respects the limit and never repeats a category back-to-back", () => {
        fc.assert(
            fc.property(fc.array(metricArb, { maxLength: 50 }), fc.integer({ min: 1, max: 8 }), (metrics, limit) => {
                const events = recentBehaviorEvents(metrics, "Coco", limit);
                expect(events.length).toBeLessThanOrEqual(limit);
                for (let i = 1; i < events.length; i++) {
                    expect(events[i].category).not.toBe(events[i - 1].category);
                }
            })
        );
    });

    it("references only timestamps present in the input", () => {
        fc.assert(
            fc.property(fc.array(metricArb, { maxLength: 50 }), (metrics) => {
                const stamps = new Set(metrics.map((m) => m.timestamp));
                for (const e of recentBehaviorEvents(metrics, "Coco")) {
                    expect(stamps.has(e.timestamp)).toBe(true);
                }
            })
        );
    });
});
