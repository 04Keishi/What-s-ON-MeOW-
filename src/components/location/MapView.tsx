import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPosition } from "@/types";

interface MapViewProps {
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];
}

export default function MapView({ currentPosition, positionHistory }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      [currentPosition?.latitude ?? -6.2088, currentPosition?.longitude ?? 106.8456],
      16
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker + path
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    const latLng: L.LatLngExpression = [currentPosition.latitude, currentPosition.longitude];

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.marker(latLng).addTo(mapRef.current);
      markerRef.current.bindPopup("🐱 Here!");
    }

    // Update path trail
    const pathCoords: L.LatLngExpression[] = positionHistory.map((p) => [p.latitude, p.longitude]);
    if (pathRef.current) {
      pathRef.current.setLatLngs(pathCoords);
    } else {
      pathRef.current = L.polyline(pathCoords, { color: "#FF8200", weight: 3 }).addTo(mapRef.current);
    }

    // Pan map to current position
    mapRef.current.panTo(latLng);
  }, [currentPosition, positionHistory]);

  return <div ref={containerRef} className="h-full w-full rounded-2xl" />;
}
