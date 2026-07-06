import { createContext, useContext, useState, type ReactNode } from "react";
import { mockData } from "@/data/mockData";

/**
 * App settings (client-side, persisted to localStorage).
 *
 * These drive real behaviour: the safe-zone radius feeds the geofence engine,
 * the cat name flows through the whole UI, and the alert toggles gate the
 * geofence/health warnings.
 */
export interface Settings {
    catName: string;
    catBreed: string;
    catAge: number;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    safeZoneRadius: number;
    geofenceAlerts: boolean;
    healthAlerts: boolean;
}

const STORAGE_KEY = "meow-settings";

const DEFAULTS: Settings = {
    catName: mockData.catProfile.name,
    catBreed: mockData.catProfile.breed,
    catAge: mockData.catProfile.age,
    ownerName: "Cat Owner",
    ownerEmail: "owner@example.com",
    ownerPhone: "+62 812-0000-0000",
    safeZoneRadius: mockData.location.safeZone.radius,
    geofenceAlerts: true,
    healthAlerts: true,
};

interface SettingsContextValue {
    settings: Settings;
    updateSettings: (patch: Partial<Settings>) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/** Load persisted settings, treating storage as untrusted and filling gaps with defaults. */
function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULTS;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return DEFAULTS;
        return {
            catName: typeof parsed.catName === "string" ? parsed.catName : DEFAULTS.catName,
            catBreed: typeof parsed.catBreed === "string" ? parsed.catBreed : DEFAULTS.catBreed,
            catAge: typeof parsed.catAge === "number" ? parsed.catAge : DEFAULTS.catAge,
            ownerName: typeof parsed.ownerName === "string" ? parsed.ownerName : DEFAULTS.ownerName,
            ownerEmail: typeof parsed.ownerEmail === "string" ? parsed.ownerEmail : DEFAULTS.ownerEmail,
            ownerPhone: typeof parsed.ownerPhone === "string" ? parsed.ownerPhone : DEFAULTS.ownerPhone,
            safeZoneRadius:
                typeof parsed.safeZoneRadius === "number" && parsed.safeZoneRadius > 0
                    ? parsed.safeZoneRadius
                    : DEFAULTS.safeZoneRadius,
            geofenceAlerts:
                typeof parsed.geofenceAlerts === "boolean" ? parsed.geofenceAlerts : DEFAULTS.geofenceAlerts,
            healthAlerts:
                typeof parsed.healthAlerts === "boolean" ? parsed.healthAlerts : DEFAULTS.healthAlerts,
        };
    } catch {
        return DEFAULTS;
    }
}

function persist(settings: Settings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Storage unavailable — settings simply won't persist across reloads.
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(loadSettings);

    const updateSettings = (patch: Partial<Settings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...patch };
            persist(next);
            return next;
        });
    };

    const resetSettings = () => {
        setSettings(DEFAULTS);
        persist(DEFAULTS);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
    return ctx;
}
