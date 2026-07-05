import type { GeoPosition, SafeZone } from "@/types";

interface MapViewProps {
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];
  safeZone?: SafeZone;
}

export default function MapView({ currentPosition, positionHistory, safeZone }: MapViewProps) {
  if (!currentPosition) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <p className="text-gray-400 text-sm">Waiting for location data...</p>
      </div>
    );
  }

  // Convert geo coordinates to pixel positions relative to safe zone center
  const center = safeZone?.center ?? { latitude: currentPosition.latitude, longitude: currentPosition.longitude };
  const scale = 3000; // pixels per degree controls zoom level

  const toPixel = (pos: GeoPosition) => ({
    x: 50 + (pos.longitude - center.longitude) * scale,
    y: 50 - (pos.latitude - center.latitude) * scale,
  });

  const catPos = toPixel(currentPosition);
  const trail = positionHistory.slice(-20).map(toPixel);

  // Safe zone radius in pixels
  const radiusInDegrees = safeZone ? safeZone.radius / 111320 : 0;
  const radiusPx = radiusInDegrees * scale;

  return (
    <div className="h-full w-full bg-[#1e1e2e] rounded-2xl relative overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Main roads */}
        <rect x="0" y="20%" width="100%" height="3%" fill="#2a2a3e" />
        <rect x="0" y="80%" width="100%" height="3%" fill="#2a2a3e" />
        <rect x="10%" y="0" width="3%" height="100%" fill="#2a2a3e" />
        <rect x="87%" y="0" width="3%" height="100%" fill="#2a2a3e" />

        {/* Road labels */}
        <text x="14%" y="19%" fill="#444" fontSize="7" fontFamily="monospace">JL. CEMPAKA</text>
        <text x="14%" y="79%" fill="#444" fontSize="7" fontFamily="monospace">JL. MELATI</text>

        {/* Park area — large green zone in center */}
        <rect x="15%" y="25%" width="70%" height="53%" rx="12" fill="#1a3a1a" opacity="0.4" />
        <text x="44%" y="95%" fill="#3a6a3a" fontSize="9" fontFamily="monospace">TAMAN CEMPAKA</text>

        {/* Trees scattered in park */}
        <circle cx="25%" cy="35%" r="4" fill="#2d5a2d" opacity="0.7" />
        <circle cx="35%" cy="40%" r="5" fill="#2d5a2d" opacity="0.6" />
        <circle cx="20%" cy="55%" r="4" fill="#2d5a2d" opacity="0.7" />
        <circle cx="30%" cy="60%" r="3" fill="#2d5a2d" opacity="0.6" />
        <circle cx="40%" cy="30%" r="4" fill="#2d5a2d" opacity="0.5" />
        <circle cx="60%" cy="35%" r="5" fill="#2d5a2d" opacity="0.6" />
        <circle cx="70%" cy="45%" r="4" fill="#2d5a2d" opacity="0.7" />
        <circle cx="75%" cy="60%" r="3" fill="#2d5a2d" opacity="0.6" />
        <circle cx="65%" cy="65%" r="5" fill="#2d5a2d" opacity="0.5" />
        <circle cx="55%" cy="70%" r="4" fill="#2d5a2d" opacity="0.7" />
        <circle cx="25%" cy="70%" r="4" fill="#2d5a2d" opacity="0.6" />
        <circle cx="80%" cy="35%" r="3" fill="#2d5a2d" opacity="0.5" />
        <circle cx="45%" cy="55%" r="4" fill="#2d5a2d" opacity="0.6" />

        {/* Park paths (walking paths inside park) */}
        <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="25%" x2="50%" y2="78%" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />

        {/* Benches */}
        <rect x="45%" y="35%" width="3%" height="1.5%" rx="1" fill="#4a4a6a" />
        <rect x="55%" y="55%" width="3%" height="1.5%" rx="1" fill="#4a4a6a" />
        <rect x="30%" y="48%" width="3%" height="1.5%" rx="1" fill="#4a4a6a" />

        {/* Houses on edges (outside park) */}
        <rect x="2%" y="30%" width="6%" height="4%" rx="1" fill="#2d2d45" />
        <rect x="2%" y="40%" width="6%" height="4%" rx="1" fill="#2d2d45" />
        <rect x="2%" y="55%" width="6%" height="4%" rx="1" fill="#2d2d45" />
        <rect x="92%" y="30%" width="6%" height="4%" rx="1" fill="#2d2d45" />
        <rect x="92%" y="45%" width="6%" height="4%" rx="1" fill="#2d2d45" />
        <rect x="92%" y="60%" width="6%" height="4%" rx="1" fill="#2d2d45" />

        {/* Safe zone circle — positioned over housing block */}
        {safeZone && (
          <circle
            cx="50%"
            cy="50%"
            r="18%"
            fill="none"
            stroke="#FF8200"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.7"
          />
        )}

        {/* Path trail */}
        {trail.length > 1 && (
          <polyline
            points={trail.map((p) => `${p.x}%,${p.y}%`).join(" ")}
            fill="none"
            stroke="#FFC929"
            strokeWidth="2"
            opacity="0.5"
          />
        )}

        {/* Home marker center of safe zone */}
        <circle cx="50%" cy="50%" r="6" fill="#22c55e" stroke="#fff" strokeWidth="2" />

        {/* Cat marker pulsing orange dot */}
        <circle cx={`${catPos.x}%`} cy={`${catPos.y}%`} r="10" fill="#FF8200" opacity="0.3">
          <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={`${catPos.x}%`} cy={`${catPos.y}%`} r="8" fill="#FF8200" stroke="#fff" strokeWidth="2" />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[9px] text-gray-400">Home</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#FF8200]" />
          <span className="text-[9px] text-gray-400">Cat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border border-dashed border-[#FF8200]" />
          <span className="text-[9px] text-gray-400">Safe Zone</span>
        </div>
      </div>
    </div>
  );
}
