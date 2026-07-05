import {useState, useEffect} from "react";
import type {MockData, GeoPosition, HealthMetric, ConnectionStatus} from "@/types";
import {
    generateNextPosition,
    generateNextHealthMetric,
    trimHistory,
} from "@/data/helpers";

interface UseSimulatorReturn {
    currentPosition: GeoPosition;
    positionHistory: GeoPosition[];
    currentMetrics: HealthMetric;
    metricsHistory: HealthMetric[];
    connectionStatus: ConnectionStatus;
    isActive: boolean;
    lastLocationUpdate: string;
    lastHealthUpdate: string;
}

export function useSimulator(mockData: MockData): UseSimulatorReturn {
    const [currentPosition, setCurrentPosition] = useState<GeoPosition>(
        mockData.location.current
    );
    const [positionHistory, setPositionHistory] = useState<GeoPosition[]>(
        mockData.locationHistory
    );
    const [currentMetrics, setCurrentMetrics] = useState<HealthMetric>(
        mockData.health.current
    );
    const [metricsHistory, setMetricsHistory] = useState<HealthMetric[]>(
        mockData.health.history
    );
    const [connectionStatus] = useState<ConnectionStatus>(
        mockData.catProfile.connectionStatus
    );

    useEffect(() => {
        // update location every 3 second
        const locationInterval = setInterval(() => {
            setCurrentPosition((prev) => {
                const next = generateNextPosition(prev);
                setPositionHistory((history) => trimHistory([...history, next], 20));
                return next;
            });
        }, 3000);

        const healthInterval = setInterval(() => {
            setCurrentMetrics((prev) => {
                const next = generateNextHealthMetric(prev);
                setMetricsHistory((history) => trimHistory([...history, next], 50));
                return next;
            });
        }, 5000);

        return() => {
            clearInterval(locationInterval);
            clearInterval(healthInterval);
        };
    }, []);

    return {
        currentPosition,
        positionHistory,
        currentMetrics,
        metricsHistory,
        connectionStatus,
        isActive: true,
        lastLocationUpdate: currentPosition.timestamp,
        lastHealthUpdate: currentMetrics.timestamp,
    };
}