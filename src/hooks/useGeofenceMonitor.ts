import { useEffect, useRef, useState } from "react";
import type { GeoPosition, SafeZone, GeofenceEvent, GeofenceStatus } from "@/types";
import { getGeofenceStatus } from "@/data/geofence";

const STORAGE_KEY = "meow-geofence-events";
const MAX_EVENTS = 50;

/** Safely load a persisted event log. Storage is treated as untrusted. */
function loadEvents(): GeofenceEvent[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (e): e is GeofenceEvent =>
                e &&
                typeof e.id === "string" &&
                (e.type === "exit" || e.type === "enter") &&
                typeof e.distance === "number" &&
                typeof e.timestamp === "string"
        );
    } catch {
        return [];
    }
}

function saveEvents(events: GeofenceEvent[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
        // Storage unavailable (private mode / quota) — degrade gracefully.
    }
}

interface UseGeofenceMonitorReturn {
    status: GeofenceStatus;
    events: GeofenceEvent[];
    clearEvents: () => void;
}

/**
 * Durable geofence monitor.
 *
 * Watches a live position against a safe zone, emits an enter/exit event on
 * each boundary crossing, and persists the event log so it survives reloads.
 * Only true state transitions are recorded, so events never double-fire.
 */
export function useGeofenceMonitor(
    currentPosition: GeoPosition,
    safeZone: SafeZone
): UseGeofenceMonitorReturn {
    const [events, setEvents] = useState<GeofenceEvent[]>(loadEvents);
    const prevOutsideRef = useRef<boolean | null>(null);
    const lastTsRef = useRef<string | null>(null);

    const status = getGeofenceStatus(currentPosition, safeZone);

    useEffect(() => {
        // Ignore repeated readings with the same timestamp.
        if (lastTsRef.current === currentPosition.timestamp) return;
        lastTsRef.current = currentPosition.timestamp;

        const isOutside = getGeofenceStatus(currentPosition, safeZone).isOutside;

        // First reading only establishes the baseline — no event.
        if (prevOutsideRef.current === null) {
            prevOutsideRef.current = isOutside;
            return;
        }

        if (isOutside !== prevOutsideRef.current) {
            const event: GeofenceEvent = {
                id: `${currentPosition.timestamp}-${isOutside ? "exit" : "enter"}`,
                type: isOutside ? "exit" : "enter",
                distance: Math.round(status.distance),
                timestamp: currentPosition.timestamp,
            };
            prevOutsideRef.current = isOutside;
            setEvents((prev) => {
                if (prev.some((e) => e.id === event.id)) return prev;
                const next = [event, ...prev].slice(0, MAX_EVENTS);
                saveEvents(next);
                return next;
            });
        }
    }, [currentPosition, safeZone, status.distance]);

    const clearEvents = () => {
        setEvents([]);
        saveEvents([]);
    };

    return { status, events, clearEvents };
}
