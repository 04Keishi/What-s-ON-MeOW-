// Cat profile

export type ConnectionStatus = "connected" | "disconnected";
export interface CatProfile {
    id: string;
    name: string;
    breed: string;
    age: number;
    photoUrl: string;
    connectionStatus: ConnectionStatus;
}

// Locationm

export interface GeoPosition {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface SafeZone {
    center: {
        latitude: number;
        longitude: number;
    };
    radius: number; // in meter
}

export interface LocationData{
    current: GeoPosition;
    safeZone: SafeZone;
}

// Meow healthh

export interface HealthMetric {
    heartRate: number; // dis is the cat heartbeat in BPM
    bodyTemperature: number; // the cat body temperature in Celcius
    activityLevel: number; // activity level in 0-100 scale for de meow
    timestamp: string;
}

export type HealthStatus = "normal" | "warning" | "critical";
export type MetricType = "heartRate" | "bodyTemperature" | "activityLevel";

// Behavioorrr meowcoderrr

export type BehaviorCategory = 
| "resting"
| "walking"
| "active"
| "stressed"
| "lethargic"
| "unknown";

export interface BehaviorResult {
    category: BehaviorCategory;
    label: string;
    emoji: string;
}

// for the mock data

export interface MockData {
    catProfile: CatProfile;
    location: LocationData;
    health: {
        current: HealthMetric;
        history: HealthMetric[];
    };
    locationHistory: GeoPosition[];
}