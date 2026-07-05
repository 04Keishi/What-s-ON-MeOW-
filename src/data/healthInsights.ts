import type { HealthMetric, HealthAlert, WellnessScore } from "@/types";

/**
 * Health early-warning engine.
 *
 * Analyses a window of recent health metrics and surfaces proactive alerts
 * plus a composite wellness score. All functions are pure and deterministic
 * so they can be validated with property-based tests.
 *
 * Clinical reference ranges (adult cat, at-rest to active):
 *   heartRate       normal 100–180 bpm   (warning <100 or >180, critical <80 or >220)
 *   bodyTemperature normal 38.0–39.5 °C  (warning <38.0 or >39.5, critical <37.5 or >40.0)
 *   activityLevel   0–100 scale
 */

// --- Thresholds -------------------------------------------------------------

export const HR = { critLow: 80, warnLow: 100, warnHigh: 180, critHigh: 220 };
export const TEMP = { critLow: 37.5, warnLow: 38.0, warnHigh: 39.5, critHigh: 40.0 };
export const RESTING_ACTIVITY = 33; // at or below == resting
export const LETHARGY_ACTIVITY = 20; // very low activity
export const LETHARGY_RATIO = 0.6; // 60%+ of window lethargic triggers alert
export const DEFAULT_WINDOW = 10;

// --- Helpers ----------------------------------------------------------------

function avg(nums: number[]): number {
    if (nums.length === 0) return 0;
    return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function round(n: number, digits = 1): number {
    const f = 10 ** digits;
    return Math.round(n * f) / f;
}

/** Take the most recent `window` samples. */
export function recentWindow(history: HealthMetric[], window = DEFAULT_WINDOW): HealthMetric[] {
    if (window <= 0) return [];
    return history.slice(-window);
}

// --- Early-warning ----------------------------------------------------------

/**
 * Analyse recent metrics and return zero or more health alerts, ordered by
 * severity (critical first). Returns an empty array when everything is normal
 * or when there is no data.
 */
export function analyzeHealth(
    history: HealthMetric[],
    catName: string,
    window = DEFAULT_WINDOW
): HealthAlert[] {
    const w = recentWindow(history, window);
    if (w.length === 0) return [];

    const alerts: HealthAlert[] = [];
    const last = w[w.length - 1];
    const ts = last.timestamp;

    const avgHR = round(avg(w.map((m) => m.heartRate)));
    const avgTemp = round(avg(w.map((m) => m.bodyTemperature)));
    const avgActivity = round(avg(w.map((m) => m.activityLevel)), 0);

    // Temperature — fever / hypothermia
    if (avgTemp > TEMP.critHigh) {
        alerts.push({
            id: "temp-fever-critical",
            severity: "critical",
            metric: "bodyTemperature",
            title: "High fever detected",
            message: `${catName}'s temperature is averaging ${avgTemp}°C, well above the safe range.`,
            recommendation: "Contact a veterinarian immediately — this may be an emergency.",
            value: avgTemp,
            timestamp: ts,
        });
    } else if (avgTemp > TEMP.warnHigh) {
        alerts.push({
            id: "temp-fever-warning",
            severity: "warning",
            metric: "bodyTemperature",
            title: "Slightly elevated temperature",
            message: `${catName}'s temperature is running warm at ${avgTemp}°C.`,
            recommendation: "Keep them cool and hydrated, and monitor closely for the next hour.",
            value: avgTemp,
            timestamp: ts,
        });
    } else if (avgTemp < TEMP.critLow) {
        alerts.push({
            id: "temp-hypothermia-critical",
            severity: "critical",
            metric: "bodyTemperature",
            title: "Low body temperature",
            message: `${catName}'s temperature has dropped to ${avgTemp}°C.`,
            recommendation: "Warm them gently and seek veterinary advice right away.",
            value: avgTemp,
            timestamp: ts,
        });
    } else if (avgTemp < TEMP.warnLow) {
        alerts.push({
            id: "temp-cool-warning",
            severity: "warning",
            metric: "bodyTemperature",
            title: "Temperature slightly low",
            message: `${catName}'s temperature is a little cool at ${avgTemp}°C.`,
            recommendation: "Offer a warm, draft-free resting spot and keep watching.",
            value: avgTemp,
            timestamp: ts,
        });
    }

    // Heart rate — tachycardia / bradycardia
    if (avgHR > HR.critHigh) {
        alerts.push({
            id: "hr-high-critical",
            severity: "critical",
            metric: "heartRate",
            title: "Dangerously high heart rate",
            message: `${catName}'s heart rate is averaging ${avgHR} bpm.`,
            recommendation: "Seek veterinary care immediately.",
            value: avgHR,
            timestamp: ts,
        });
    } else if (avgHR > HR.warnHigh && avgActivity <= RESTING_ACTIVITY) {
        // High HR while resting is the meaningful signal (pain / stress).
        alerts.push({
            id: "hr-high-at-rest",
            severity: "warning",
            metric: "heartRate",
            title: "Elevated heart rate at rest",
            message: `${catName}'s heart rate is ${avgHR} bpm even though activity is low.`,
            recommendation: "This can signal stress or discomfort — check their environment.",
            value: avgHR,
            timestamp: ts,
        });
    } else if (avgHR < HR.critLow) {
        alerts.push({
            id: "hr-low-critical",
            severity: "critical",
            metric: "heartRate",
            title: "Very low heart rate",
            message: `${catName}'s heart rate has fallen to ${avgHR} bpm.`,
            recommendation: "Contact a veterinarian without delay.",
            value: avgHR,
            timestamp: ts,
        });
    } else if (avgHR < HR.warnLow) {
        alerts.push({
            id: "hr-low-warning",
            severity: "warning",
            metric: "heartRate",
            title: "Heart rate below normal",
            message: `${catName}'s heart rate is averaging ${avgHR} bpm.`,
            recommendation: "Monitor for lethargy and re-check in a little while.",
            value: avgHR,
            timestamp: ts,
        });
    }

    // Behaviour — prolonged lethargy
    const lethargic = w.filter(
        (m) => m.activityLevel <= LETHARGY_ACTIVITY && m.heartRate < HR.warnLow
    ).length;
    if (lethargic / w.length >= LETHARGY_RATIO) {
        alerts.push({
            id: "behavior-lethargy",
            severity: "warning",
            metric: "behavior",
            title: "Prolonged low activity",
            message: `${catName} has been unusually still and quiet for a while.`,
            recommendation: "Encourage gentle play and watch appetite — persistent lethargy needs a vet.",
            value: round((lethargic / w.length) * 100, 0),
            timestamp: ts,
        });
    }

    const order = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

// --- Wellness score ---------------------------------------------------------

/** Penalty (0..1) for how far `value` sits outside a normal band. */
function bandPenalty(value: number, warnLow: number, warnHigh: number, span: number): number {
    let dist = 0;
    if (value < warnLow) dist = warnLow - value;
    else if (value > warnHigh) dist = value - warnHigh;
    if (dist <= 0) return 0;
    return Math.min(1, dist / span);
}

/**
 * Composite wellness score (0–100) from recent metrics, with a per-category
 * breakdown. Returns a perfect score when there is no data (nothing wrong yet).
 */
export function computeWellnessScore(
    history: HealthMetric[],
    window = DEFAULT_WINDOW
): WellnessScore {
    const w = recentWindow(history, window);
    if (w.length === 0) {
        return { score: 100, grade: "excellent", breakdown: { heart: 100, temperature: 100, activity: 100 } };
    }

    const avgHR = avg(w.map((m) => m.heartRate));
    const avgTemp = avg(w.map((m) => m.bodyTemperature));
    const avgActivity = avg(w.map((m) => m.activityLevel));

    const heart = Math.round((1 - bandPenalty(avgHR, HR.warnLow, HR.warnHigh, 60)) * 100);
    const temperature = Math.round((1 - bandPenalty(avgTemp, TEMP.warnLow, TEMP.warnHigh, 2)) * 100);
    // Activity: reward a healthy middle range; both extremes are penalised.
    const activity = Math.round((1 - bandPenalty(avgActivity, 25, 85, 40)) * 100);

    const score = Math.round(heart * 0.4 + temperature * 0.4 + activity * 0.2);
    const clamped = Math.max(0, Math.min(100, score));

    const grade: WellnessScore["grade"] =
        clamped >= 85 ? "excellent" : clamped >= 70 ? "good" : clamped >= 50 ? "fair" : "poor";

    return {
        score: clamped,
        grade,
        breakdown: {
            heart: Math.max(0, Math.min(100, heart)),
            temperature: Math.max(0, Math.min(100, temperature)),
            activity: Math.max(0, Math.min(100, activity)),
        },
    };
}
