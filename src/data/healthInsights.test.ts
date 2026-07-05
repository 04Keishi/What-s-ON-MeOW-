import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { HealthMetric } from "@/types";
import {
    analyzeHealth,
    computeWellnessScore,
    recentWindow,
    HR,
    TEMP,
    DEFAULT_WINDOW,
} from "./healthInsights";

// Arbitrary health metric across the full plausible sensor range.
const metricArb: fc.Arbitrary<HealthMetric> = fc.record({
    heartRate: fc.integer({ min: 40, max: 260 }),
    bodyTemperature: fc.double({ min: 35, max: 43, noNaN: true }),
    activityLevel: fc.integer({ min: 0, max: 100 }),
    timestamp: fc.constant("2026-06-25T08:00:00.000Z"),
});

const historyArb = fc.array(metricArb, { minLength: 1, maxLength: 50 });

const severityRank = { critical: 0, warning: 1, info: 2 } as const;

describe("computeWellnessScore", () => {
    it("always returns a score and breakdown within [0, 100]", () => {
        fc.assert(
            fc.property(fc.array(metricArb, { maxLength: 50 }), (history) => {
                const w = computeWellnessScore(history);
                expect(w.score).toBeGreaterThanOrEqual(0);
                expect(w.score).toBeLessThanOrEqual(100);
                for (const v of Object.values(w.breakdown)) {
                    expect(v).toBeGreaterThanOrEqual(0);
                    expect(v).toBeLessThanOrEqual(100);
                }
            })
        );
    });

    it("returns a perfect score for empty history", () => {
        const w = computeWellnessScore([]);
        expect(w.score).toBe(100);
        expect(w.grade).toBe("excellent");
    });

    it("grade is consistent with score thresholds", () => {
        fc.assert(
            fc.property(historyArb, (history) => {
                const { score, grade } = computeWellnessScore(history);
                if (score >= 85) expect(grade).toBe("excellent");
                else if (score >= 70) expect(grade).toBe("good");
                else if (score >= 50) expect(grade).toBe("fair");
                else expect(grade).toBe("poor");
            })
        );
    });
});

describe("analyzeHealth", () => {
    it("never throws and always returns an array", () => {
        fc.assert(
            fc.property(fc.array(metricArb, { maxLength: 50 }), fc.string(), (history, name) => {
                const alerts = analyzeHealth(history, name);
                expect(Array.isArray(alerts)).toBe(true);
            })
        );
    });

    it("returns no alerts for empty history", () => {
        expect(analyzeHealth([], "Coco")).toEqual([]);
    });

    it("orders alerts by severity (critical first)", () => {
        fc.assert(
            fc.property(historyArb, (history) => {
                const alerts = analyzeHealth(history, "Coco");
                for (let i = 1; i < alerts.length; i++) {
                    expect(severityRank[alerts[i].severity]).toBeGreaterThanOrEqual(
                        severityRank[alerts[i - 1].severity]
                    );
                }
            })
        );
    });

    it("always flags a critical alert when the whole window is feverish", () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        heartRate: fc.integer({ min: 100, max: 180 }),
                        bodyTemperature: fc.double({ min: TEMP.critHigh + 0.1, max: 43, noNaN: true }),
                        activityLevel: fc.integer({ min: 0, max: 100 }),
                        timestamp: fc.constant("2026-06-25T08:00:00.000Z"),
                    }),
                    { minLength: 1, maxLength: DEFAULT_WINDOW }
                ),
                (history) => {
                    const alerts = analyzeHealth(history, "Coco");
                    const critical = alerts.find(
                        (a) => a.metric === "bodyTemperature" && a.severity === "critical"
                    );
                    expect(critical).toBeDefined();
                }
            )
        );
    });

    it("reports no alerts when every reading is in the normal range", () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        heartRate: fc.integer({ min: HR.warnLow, max: HR.warnHigh }),
                        bodyTemperature: fc.double({ min: TEMP.warnLow, max: TEMP.warnHigh, noNaN: true }),
                        activityLevel: fc.integer({ min: 34, max: 66 }),
                        timestamp: fc.constant("2026-06-25T08:00:00.000Z"),
                    }),
                    { minLength: 1, maxLength: DEFAULT_WINDOW }
                ),
                (history) => {
                    expect(analyzeHealth(history, "Coco")).toEqual([]);
                }
            )
        );
    });
});

describe("recentWindow", () => {
    it("returns at most `window` items, preserving the tail", () => {
        fc.assert(
            fc.property(historyArb, fc.integer({ min: 0, max: 60 }), (history, window) => {
                const w = recentWindow(history, window);
                expect(w.length).toBeLessThanOrEqual(Math.max(0, window));
                expect(w.length).toBeLessThanOrEqual(history.length);
                if (window > 0 && history.length > 0) {
                    expect(w[w.length - 1]).toEqual(history[history.length - 1]);
                }
            })
        );
    });
});
