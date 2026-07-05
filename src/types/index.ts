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
}

// Geofence monitoring

export type GeofenceEventType = "exit" | "enter";

export interface GeofenceEvent {
    id: string;
    type: GeofenceEventType;
    distance: number; // meters from safe-zone center at the moment of the event
    timestamp: string;
}

export interface GeofenceStatus {
    distance: number; // meters from safe-zone center
    isOutside: boolean;
    marginPct: number; // 0 at center, 100 exactly on the boundary, >100 outside
}

// Health insights & early-warning

export type AlertSeverity = "info" | "warning" | "critical";

export interface HealthAlert {
    id: string;
    severity: AlertSeverity;
    metric: MetricType | "behavior";
    title: string;
    message: string;
    recommendation: string;
    value: number;
    timestamp: string;
}

export interface WellnessScore {
    score: number; // 0-100
    grade: "excellent" | "good" | "fair" | "poor";
    breakdown: {
        heart: number; // 0-100
        temperature: number; // 0-100
        activity: number; // 0-100
    };
}

// Smart diary

export interface DiaryMood {
    emoji: string;
    label: string;
}

export interface CatDiary {
    narrative: string;
    mood: DiaryMood;
    highlights: string[];
    healthNote: string;
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