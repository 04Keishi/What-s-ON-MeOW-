import type { HealthMetric, CatDiary, DiaryMood } from "@/types";
import { getActivityLabel, getBehaviorResult, formatTimestamp } from "./helpers";
import { analyzeHealth, computeWellnessScore } from "./healthInsights";

/**
 * Legacy one-line summary. Kept for backward compatibility with existing UI.
 */
export function generateDailySummary(
    history: HealthMetric[],
    catName: string
): string {
    return generateCatDiary(history, catName).narrative;
}

function dominantBehavior(history: HealthMetric[], catName: string): string {
    const counts: Record<string, number> = {};
    history.forEach((m) => {
        const b = getBehaviorResult(m, catName);
        counts[b.category] = (counts[b.category] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "unknown";
}

function moodFor(behavior: string): DiaryMood {
    switch (behavior) {
        case "active":
            return { emoji: "😸", label: "energetic and playful" };
        case "walking":
            return { emoji: "🐾", label: "curious and explorative" };
        case "resting":
            return { emoji: "😽", label: "calm and cozy" };
        case "stressed":
            return { emoji: "🙀", label: "a bit restless" };
        case "lethargic":
            return { emoji: "😿", label: "unusually low-energy" };
        default:
            return { emoji: "🐱", label: "quietly content" };
    }
}

/**
 * Build a structured, narrative diary entry from a day's health history,
 * enriched with mood, notable moments, and a health note derived from the
 * early-warning engine.
 */
export function generateCatDiary(
    history: HealthMetric[],
    catName: string
): CatDiary {
    if (history.length === 0) {
        return {
            narrative: `No data available for ${catName} today.`,
            mood: { emoji: "😺", label: "waiting for data" },
            highlights: [],
            healthNote: "No readings yet today.",
        };
    }

    const avgHR = Math.round(history.reduce((s, m) => s + m.heartRate, 0) / history.length);
    const avgTemp = (history.reduce((s, m) => s + m.bodyTemperature, 0) / history.length).toFixed(1);
    const avgActivity = Math.round(history.reduce((s, m) => s + m.activityLevel, 0) / history.length);

    const behavior = dominantBehavior(history, catName);
    const mood = moodFor(behavior);
    const activityLabel = getActivityLabel(avgActivity);
    const healthStatus = avgHR >= 100 && avgHR <= 180 ? "healthy" : "elevated";

    const narrative =
        `Today ${catName} kept a ${healthStatus} heart rate averaging ${avgHR} bpm, ` +
        `with temperature holding at ${avgTemp}°C. Activity was mostly ${activityLabel} ` +
        `(${avgActivity}%). All in all, a ${mood.label} day! ${mood.emoji}`;

    // Notable moments
    const highlights: string[] = [];
    const peak = history.reduce((a, b) => (b.activityLevel > a.activityLevel ? b : a));
    const calmest = history.reduce((a, b) => (b.activityLevel < a.activityLevel ? b : a));
    if (peak.activityLevel >= 50) {
        highlights.push(`🏃 Most active around ${formatTimestamp(peak.timestamp)} (${peak.activityLevel}%)`);
    }
    highlights.push(`😴 Calmest around ${formatTimestamp(calmest.timestamp)} (${calmest.activityLevel}%)`);
    const warmest = history.reduce((a, b) => (b.bodyTemperature > a.bodyTemperature ? b : a));
    highlights.push(`🌡️ Peak temperature ${warmest.bodyTemperature}°C`);

    // Health note from the early-warning engine
    const alerts = analyzeHealth(history, catName);
    const wellness = computeWellnessScore(history);
    const healthNote =
        alerts.length === 0
            ? `Wellness score ${wellness.score}/100 (${wellness.grade}) — no concerns detected. 💚`
            : `Wellness score ${wellness.score}/100 — ${alerts[0].title.toLowerCase()}. ${alerts[0].recommendation}`;

    return { narrative, mood, highlights, healthNote };
}
