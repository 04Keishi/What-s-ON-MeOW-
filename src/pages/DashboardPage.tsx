import { useState } from "react";
import { Heart, MapPin, PawPrint, Activity, Home, Settings, LogOutIcon } from "lucide-react";
import { useSimulator } from "@/hooks/useSimulator";
import { mockData } from "@/data/mockData";
import MapView from "@/components/location/MapView";
import { getBehaviorResult, getActivityLabel, formatTimestamp } from "@/data/helpers";

type Tab = "home" | "health" | "location";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const sim = useSimulator(mockData);
  const behavior = getBehaviorResult(sim.currentMetrics, mockData.catProfile.name);

  return (
    <div className="flex h-screen bg-meow-cream p-5 gap-5">
      {/* Left Sidebar */}
      <aside className="flex w-[80px] flex-col items-center rounded-[30px] bg-white/80 py-6 shadow-sm backdrop-blur-sm">
        {/* Logo */}
        <img src="/images/logo.png" alt="Logo" className="h-14 w-15 mb-5" />

        {/* Nav Icons */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
              activeTab === "home"
                ? "border-meow-orange bg-meow-orange text-white shadow-md"
                : "border-gray-300 text-gray-400 hover:border-meow-orange"
            }`}
          >
            <Home size={18} />
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
              activeTab === "health"
                ? "border-meow-orange bg-meow-orange text-white shadow-md"
                : "border-gray-300 text-gray-400 hover:border-meow-orange"
            }`}
          >
            <Heart size={18} />
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
              activeTab === "location"
                ? "border-meow-orange bg-meow-orange text-white shadow-md"
                : "border-gray-300 text-gray-400 hover:border-meow-orange"
            }`}
          >
            <MapPin size={18} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 hover:border-meow-orange transition-all">
            <PawPrint size={18} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-300 text-red-400 hover:border-meow-orange transition-all">
            <LogOutIcon size={18} />
          </button>
        </div>

        {/* Profile pic at bottom */}
        <div className="mt-auto">
          <img
            src={mockData.catProfile.photoUrl}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
          />
        </div>
      </aside>

      {/* Center Content */}
      <div className="flex flex-1 flex-col gap-5">
        {/* Hero Image — large */}
        <div className="relative flex-1 min-h-[280px] overflow-hidden rounded-[30px] shadow-sm">
          <img
            src={mockData.catProfile.photoUrl}
            alt={mockData.catProfile.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Live badge */}
          <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">Live</span>
          </div>

          {/* Name + behavior overlay bottom */}
          <div className="absolute bottom-5 left-5">
            <h1 className="text-2xl font-bold text-white">{mockData.catProfile.name}</h1>
            <p className="text-sm text-white/80">{behavior.label}</p>
          </div>
        </div>

        {/* Bottom Cards Row — 3 cards */}
        <div className="grid grid-cols-3 gap-5">
          {/* Card 1 — Heart Rate */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Heart Rate</h3>
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <p className="text-3xl font-bold text-meow-dark">{sim.currentMetrics.heartRate}</p>
            <p className="text-xs text-gray-400 mt-1">bpm</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-full bg-meow-cream px-2 py-0.5 text-[10px] font-medium text-meow-orange">
                Normal
              </div>
            </div>
          </div>

          {/* Card 2 — Temperature */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-meow-orange-dark">Temperature</h3>
              <div className="h-2.5 w-2.5 rounded-full bg-meow-gold" />
            </div>
            <p className="text-3xl font-bold text-meow-dark">{sim.currentMetrics.bodyTemperature}</p>
            <p className="text-xs text-meow-orange-dark/60 mt-1">°C</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-full bg-meow-gold/30 px-2 py-0.5 text-[10px] font-medium text-meow-orange-dark">
                {formatTimestamp(sim.lastHealthUpdate)}
              </div>
            </div>
          </div>

          {/* Card 3 — Activity */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
              <div className="h-2.5 w-2.5 rounded-full bg-meow-orange" />
            </div>
            <p className="text-3xl font-bold text-meow-dark">
              {getActivityLabel(sim.currentMetrics.activityLevel)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{sim.currentMetrics.activityLevel}%</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-full bg-meow-cream px-2 py-0.5 text-[10px] font-medium text-meow-orange">
                {formatTimestamp(sim.lastHealthUpdate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-[260px] flex flex-col gap-5">
        {/* Profile Card */}
        <div className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Profile</h3>
            <Settings size={14} className="text-gray-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <PawPrint size={16} className="text-meow-orange" />
              <div>
                <p className="text-sm font-medium text-gray-700">{mockData.catProfile.name}</p>
                <p className="text-[10px] text-gray-400">{mockData.catProfile.breed}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">&gt;</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <Heart size={16} className="text-meow-orange" />
              <div>
                <p className="text-sm font-medium text-gray-700">Age</p>
                <p className="text-[10px] text-gray-400">{mockData.catProfile.age} years old</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">&gt;</span>
            </div>

            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              sim.connectionStatus === "connected" ? "bg-green-50" : "bg-red-50"
            }`}>
              <Activity size={16} className={sim.connectionStatus === "connected" ? "text-green-500" : "text-red-400"} />
              <div>
                <p className="text-sm font-medium text-gray-700">Collar</p>
                <p className="text-[10px] text-gray-400">{sim.connectionStatus === "connected" ? "Connected" : "Disconnected"}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">&gt;</span>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="rounded-[30px] bg-white p-5 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
          <div className="h-80 W-120 rounded-2xl overflow-hidden">
            <MapView
              currentPosition={sim.currentPosition}
              positionHistory={sim.positionHistory}
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            Lat: {sim.currentPosition.latitude.toFixed(4)}, Lng: {sim.currentPosition.longitude.toFixed(4)}
          </p>
        </div>
      </aside>
    </div>
  );
}
