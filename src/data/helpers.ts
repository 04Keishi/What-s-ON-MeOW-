import type { GeoPosition, HealthMetric, HealthStatus, MetricType, BehaviorResult } from "@/types";

// for position generator

export function generateNextPosition(prev: GeoPosition): GeoPosition {
    const delta = () => (Math.random()-0.5) * 0.001;
    return {
        latitude: prev.latitude + delta(),
        longitude: prev.longitude + delta(),
        timestamp: new Date().toISOString(),
    };
}

// Health metrics genearot

export function generateNextHealthMetric(prev: HealthMetric): HealthMetric {
    const vary = (val: number, max: number) =>
        Math.round((val + (Math.random()-0.5)* max)* 10) /10;

    return {
        heartRate: Math.min(220, Math.max(60, vary(prev.heartRate, 10))),
        bodyTemperature: Math.min(42, Math.max(36, vary(prev.bodyTemperature, 0.4))),
        activityLevel: Math.min(100, Math.max(0, Math.round(vary(prev.activityLevel,10)))),
        timestamp: new Date().toISOString(),
    };
}