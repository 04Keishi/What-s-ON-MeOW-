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

// Health Status

export function getHealthStatus(type: MetricType, value: number): HealthStatus {
    if (type === "heartRate") {
        if (value < 80 || value > 220) return "critical";
        if (value < 100 || value > 180) return "warning";
        return "normal";
    }
    
    if (type === "bodyTemperature") {
        if (value < 37.5 || value > 40.0) return "critical";
        if (value < 38.0 || value > 39.5) return "warning";
        return "normal";
    }
// no critical situation
return "normal";
}

export function getActivityLabel(level: number): "resting" | "walking" | "running" {
    if (level <= 33) return "resting";
    if (level <= 66) return "walking";
    return "running";
}

// behavior decoderrrr
export function getBehaviorResult(metrics: HealthMetric, catName: string): BehaviorResult{
    const {heartRate, bodyTemperature, activityLevel} = metrics;

    if (activityLevel <= 20 && heartRate < 100 && bodyTemperature < 38.0) {
        return { category: "lethargic", label: `${catName} seems lethargic, needs attention!` };
    }
    if (activityLevel <= 33 && (heartRate > 180 || bodyTemperature >39.5)) {
        return { category: "stressed", label: `${catName} might be stressed or uncomfortable` };
    }
    if (activityLevel >=67 && heartRate <= 220 && bodyTemperature <= 40.0) {
        return { category: "active", label: `${catName} is actively playing!` };
    }
    if(activityLevel >=34 && activityLevel <= 66 && heartRate >= 100 && heartRate <= 180 && bodyTemperature >=38.0 && bodyTemperature <= 39.5) {
        return { category: "walking", label: `${catName} is walking around` };
    }
    if (activityLevel <= 33 && heartRate >= 100 && heartRate <= 180 && bodyTemperature >=38.0 && bodyTemperature <= 39.5) {
        return { category: "resting", label: `${catName} is resting peacefully, shhhh!` };
    }
    return { category: "unknown", label: `Hmm, what is ${catName} doing right now?` };
}

export function trimHistory<T>(history: T[], maxLength: number): T[] {
    return history.slice(-maxLength);
}

export function formatTimestamp(isoString: string): string {
    return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}