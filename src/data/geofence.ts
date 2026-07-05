import type { GeoPosition, SafeZone, GeofenceEvent, GeofenceStatus } from "@/types";

/**
 * Geofence monitoring pipeline.
 *
 * A small, reliable workflow: measure distance from the safe-zone centre,
 * classify in/out, and derive a deduplicated stream of enter/exit events from
 * a position history. All functions are pure and deterministic, so the same
 * history always yields the same events — no double-firing, no missed edges.
 */

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two coordinates, in metres (Haversine).
 * Symmetric and zero for identical points.
 */
export function haversineDistance(a: GeoPosition, b: GeoPosition): number {
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distance from a position to the centre of a safe zone, in metres. */
export function distanceFromSafeZone(position: GeoPosition, safeZone: SafeZone): number {
    return haversineDistance(position, {
        latitude: safeZone.center.latitude,
        longitude: safeZone.center.longitude,
        timestamp: position.timestamp,
    });
}

/**
 * Current geofence status for a position. A position exactly on the boundary
 * is considered inside (marginPct === 100).
 */
export function getGeofenceStatus(position: GeoPosition, safeZone: SafeZone): GeofenceStatus {
    const distance = distanceFromSafeZone(position, safeZone);
    const marginPct = safeZone.radius > 0 ? (distance / safeZone.radius) * 100 : Infinity;
    return {
        distance,
        isOutside: distance > safeZone.radius,
        marginPct,
    };
}

/**
 * Derive enter/exit events from a chronological position history.
 *
 * Only boundary crossings produce events, so consecutive readings on the same
 * side are collapsed. The first reading establishes the initial state and does
 * not emit an event. Event types therefore strictly alternate.
 */
export function deriveGeofenceEvents(
    history: GeoPosition[],
    safeZone: SafeZone
): GeofenceEvent[] {
    if (history.length === 0) return [];

    const events: GeofenceEvent[] = [];
    let prevOutside = getGeofenceStatus(history[0], safeZone).isOutside;

    for (let i = 1; i < history.length; i++) {
        const pos = history[i];
        const status = getGeofenceStatus(pos, safeZone);
        if (status.isOutside !== prevOutside) {
            events.push({
                id: `${pos.timestamp}-${status.isOutside ? "exit" : "enter"}-${i}`,
                type: status.isOutside ? "exit" : "enter",
                distance: Math.round(status.distance),
                timestamp: pos.timestamp,
            });
            prevOutside = status.isOutside;
        }
    }

    return events;
}
