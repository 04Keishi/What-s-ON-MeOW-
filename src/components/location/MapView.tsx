import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPosition, SafeZone } from "@/types";

interface MapViewProps {
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];
  safeZone?: SafeZone;
}

// Custom markers as pure DOM (avoids Leaflet's broken default-icon asset paths).
const catIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#FF8200;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,130,0,0.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#22c55e;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** Keeps the map centred on the cat as its position updates. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ currentPosition, positionHistory, safeZone }: MapViewProps) {
  if (!currentPosition) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-100">
        <p className="text-sm text-gray-400">Waiting for location data...</p>
      </div>
    );
  }

  const catPos: [number, number] = [currentPosition.latitude, currentPosition.longitude];
  const trail: [number, number][] = positionHistory
    .slice(-20)
    .map((p) => [p.latitude, p.longitude]);
  const homePos: [number, number] | null = safeZone
    ? [safeZone.center.latitude, safeZone.center.longitude]
    : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={catPos}
        zoom={16}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e8eef2" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Safe zone */}
        {safeZone && homePos && (
          <Circle
            center={homePos}
            radius={safeZone.radius}
            pathOptions={{
              color: "#FF8200",
              weight: 2,
              dashArray: "6 6",
              fillColor: "#FF8200",
              fillOpacity: 0.08,
            }}
          />
        )}

        {/* Movement trail */}
        {trail.length > 1 && (
          <Polyline positions={trail} pathOptions={{ color: "#FFC929", weight: 3, opacity: 0.7 }} />
        )}

        {/* Home marker */}
        {homePos && <Marker position={homePos} icon={homeIcon} />}

        {/* Cat marker */}
        <Marker position={catPos} icon={catIcon} />

        <Recenter lat={currentPosition.latitude} lng={currentPosition.longitude} />
      </MapContainer>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex items-center gap-4 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[9px] text-gray-500">Home</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#FF8200]" />
          <span className="text-[9px] text-gray-500">Cat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border border-dashed border-[#FF8200]" />
          <span className="text-[9px] text-gray-500">Safe Zone</span>
        </div>
      </div>
    </div>
  );
}
