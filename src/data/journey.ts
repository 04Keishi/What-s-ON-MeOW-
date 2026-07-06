import type { GeoPosition, HealthMetric, SafeZone } from "@/types";
import { haversineDistance, getGeofenceStatus } from "./geofence";
import { getBehaviorResult } from "./helpers";

/**
 * Journey & activity summaries derived from live simulator data.
 * All functions are pure and deterministic.
 */

/** Total path length over a position history, in metres. */
export function totalDistanceMeters(history: GeoPosition[]): number {
    let sum = 0;
    for (let i = 1; i < history.length; i++) {
        sum += haversineDistance(history[i - 1], history[i]);
    }
    return sum;
}

/** Elapsed time between the first and last reading, in milliseconds. */
export function trackedDurationMs(history: GeoPosition[]): number {
    if (history.length < 2) return 0;
    const first = new Date(history[0].timestamp).getTime();
    const last = new Date(history[history.length - 1].timestamp).getTime();
    const diff = last - first;
    return diff > 0 ? diff : 0;
}

/** Human-friendly duration, e.g. "4h 22m" or "18m". */
export function formatDuration(ms: number): string {
    const totalMin = Math.round(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Farthest distance from the safe-zone centre reached in the history, in metres. */
export function maxDistanceFromZone(history: GeoPosition[], safeZone: SafeZone): number {
    let max = 0;
    for (const p of history) {
        const d = getGeofenceStatus(p, safeZone).distance;
        if (d > max) max = d;
    }
    return max;
}

/** Share of readings spent resting (activity ≤ 33), as a 0–100 percentage. */
export function restingShare(metrics: HealthMetric[]): number {
    if (metrics.length === 0) return 0;
    const resting = metrics.filter((m) => m.activityLevel <= 33).length;
    return Math.round((resting / metrics.length) * 100);
}

/** Average activity level (0–100) across the readings. */
export function averageActivity(metrics: HealthMetric[]): number {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((s, m) => s + m.activityLevel, 0) / metrics.length);
}

export interface BehaviorEvent {
    timestamp: string;
    category: string;
}

/**
 * Recent behaviour transitions (deduplicated) from a metrics history, newest
 * first. Only points where the behaviour category changes produce an entry.
 */
export function recentBehaviorEvents(
    metrics: HealthMetric[],
    catName: string,
    limit = 4
): BehaviorEvent[] {
    const events: BehaviorEvent[] = [];
    let prev: string | null = null;
    for (const m of metrics) {
        const category = getBehaviorResult(m, catName).category;
        if (category !== prev) {
            events.push({ timestamp: m.timestamp, category });
            prev = category;
        }
    }
    return events.slice(-limit).reverse();
}

/** Display metadata for a behaviour category. */
export function behaviorDisplay(category: string): {
    emoji: string;
    action: string;
    mood: string;
    color: string;
} {
    switch (category) {
        case "active":
            return { emoji: "🏃", action: "Playing & active", mood: "Energetic", color: "bg-green-50 text-green-500" };
        case "walking":
            return { emoji: "🐾", action: "Exploring around", mood: "Curious", color: "bg-blue-50 text-blue-500" };
        case "resting":
            return { emoji: "😴", action: "Resting", mood: "Calm", color: "bg-purple-50 text-purple-500" };
        case "stressed":
            return { emoji: "⚠️", action: "Seems restless", mood: "Stressed", color: "bg-amber-50 text-amber-500" };
        case "lethargic":
            return { emoji: "😿", action: "Very low energy", mood: "Lethargic", color: "bg-red-50 text-red-500" };
        default:
            return { emoji: "🐱", action: "Just chilling", mood: "Content", color: "bg-orange-50 text-orange-500" };
    }
}
