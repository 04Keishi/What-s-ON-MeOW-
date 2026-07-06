import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, PawPrint, Activity, Home, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import SettingsModal from "@/components/SettingsModal";
import { useSimulator } from "@/hooks/useSimulator";
import { mockData } from "@/data/mockData";
import MapView from "@/components/location/MapView";
import HeartRateChart from "@/components/health/HeartRateChart";
import WeeklyActivityChart from "@/components/health/WeeklyActivityChart";
import SleepPatternChart from "@/components/health/SleepPatternChart";
import { generateCatDiary } from "@/data/catDiary";
import { analyzeHealth, computeWellnessScore } from "@/data/healthInsights";
import { getBehaviorResult, getActivityLabel, getHealthStatus, formatTimestamp } from "@/data/helpers";
import { distanceFromSafeZone, getGeofenceStatus } from "@/data/geofence";
import {
  totalDistanceMeters,
  trackedDurationMs,
  formatDuration,
  maxDistanceFromZone,
  restingShare,
  averageActivity,
  recentBehaviorEvents,
  behaviorDisplay,
} from "@/data/journey";
import { useGeofenceMonitor } from "@/hooks/useGeofenceMonitor";
import { AlertTriangle, ShieldCheck, LogOut, LogIn, Trash2 } from "lucide-react";

type Tab = "home" | "health" | "location";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sim = useSimulator(mockData);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const { settings } = useSettings();
  const catName = settings.catName;
  const safeZone = useMemo(
    () => ({ center: mockData.location.safeZone.center, radius: settings.safeZoneRadius }),
    [settings.safeZoneRadius]
  );

  const behavior = getBehaviorResult(sim.currentMetrics, catName);
  const diary = generateCatDiary(sim.metricsHistory, catName);
  const alerts = settings.healthAlerts ? analyzeHealth(sim.metricsHistory, catName) : [];
  const wellness = computeWellnessScore(sim.metricsHistory);
  const geo = useGeofenceMonitor(sim.currentPosition, safeZone);

  // Derived, real journey/activity stats from live simulator data.
  const distanceKm = (totalDistanceMeters(sim.positionHistory) / 1000).toFixed(2);
  const avgActivity = averageActivity(sim.metricsHistory);
  const restPct = restingShare(sim.metricsHistory);
  const trackedDuration = formatDuration(trackedDurationMs(sim.positionHistory));
  const farthest = Math.round(maxDistanceFromZone(sim.positionHistory, safeZone));
  const behaviorEvents = recentBehaviorEvents(sim.metricsHistory, catName, 4);
  const recentPositions = sim.positionHistory.slice(-6).reverse();

  // Map a metric health status to a label + colour for consistent UI feedback.
  const statusStyle = (s: "normal" | "warning" | "critical") =>
    s === "critical"
      ? { label: "Needs attention", color: "text-red-500" }
      : s === "warning"
      ? { label: "Slightly off range", color: "text-amber-500" }
      : { label: "Normal range", color: "text-green-500" };
  const hrStatus = statusStyle(getHealthStatus("heartRate", sim.currentMetrics.heartRate));
  const tempStatus = statusStyle(getHealthStatus("bodyTemperature", sim.currentMetrics.bodyTemperature));

  const navItems = [
    { id: "home" as Tab, icon: Home, label: "Dashboard" },
    { id: "health" as Tab, icon: Heart, label: "Health" },
    { id: "location" as Tab, icon: MapPin, label: "Location" },
  ];

  return (
    <div className="flex h-screen bg-meow-cream">
      {/* Left Sidebar — collapsible */}
      <aside className={`hidden md:flex flex-col items-center rounded-[30px] bg-white/80 py-6 shadow-sm backdrop-blur-sm m-5 mr-0 transition-all duration-300 ${sidebarOpen ? "w-[200px]" : "w-[80px]"}`}>
        {/* Logo */}
        <div className="flex justify-center mb-5 px-4">
          <img src="/images/logo.png" alt="Logo" className="h-15 w-20 flex-shrink-0" />
        </div>

        {/* Cat Profile */}
        {sidebarOpen && (
          <div className="mx-3 mb-4 flex items-center gap-2 rounded-xl bg-meow-cream px-3 py-2">
            <img src={mockData.catProfile.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            <div>
              <p className="text-xs font-medium text-meow-dark">{catName}</p>
              <div className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${sim.connectionStatus === "connected" ? "bg-green-400" : "bg-red-400"}`} />
                <span className="text-[9px] text-gray-400">{sim.connectionStatus === "connected" ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex flex-col items-center gap-3 flex-1 w-full px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full rounded-full transition-all ${
                sidebarOpen ? "px-4 py-2.5" : "justify-center h-11 w-11 mx-auto"
              } ${
                activeTab === item.id
                  ? "bg-meow-orange text-white shadow-md"
                  : "text-gray-400 hover:text-meow-orange border-2 border-transparent hover:border-meow-orange"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2 w-full px-3">
          {sidebarOpen && (
            <div className="mb-1 w-full rounded-xl bg-meow-cream px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide text-gray-400">Meowner</p>
              <p className="truncate text-xs font-medium text-meow-dark">{settings.ownerName}</p>
            </div>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-3 w-full rounded-full text-gray-400 hover:text-meow-orange transition-all ${sidebarOpen ? "px-4 py-2.5" : "justify-center h-11 w-11 mx-auto"}`}
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-full text-gray-400 hover:text-red-500 transition-all ${sidebarOpen ? "px-4 py-2.5" : "justify-center h-11 w-11 mx-auto"}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-3 w-full rounded-full text-gray-400 hover:text-meow-orange transition-all ${sidebarOpen ? "px-4 py-2.5" : "justify-center h-11 w-11 mx-auto"}`}
          >
            {sidebarOpen ? <X size={18} className="flex-shrink-0" /> : <Menu size={18} className="flex-shrink-0" />}
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
        <div key={activeTab} className="animate-fade-in space-y-5">

        {/* ═══ HOME TAB ═══ */}
        {activeTab === "home" && (
          <>
            <div>
              <h2 className="text-xl font-bold text-meow-dark">Dashboard</h2>
              <p className="text-sm text-gray-400">Here's how {catName} is doing today.</p>
            </div>

            {/* Top row: profile card (left) + live location (right) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Profile Card */}
              <div className="col-span-1 rounded-[24px] bg-white p-4 shadow-sm">
                <div className="relative h-[200px] overflow-hidden rounded-[18px]">
                  <img src={mockData.catProfile.photoUrl} alt={catName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-medium text-gray-600">Online</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h1 className="text-2xl font-bold text-white">{catName}</h1>
                    <p className="text-xs text-white/80">{settings.catBreed} · {settings.catAge} yrs</p>
                  </div>
                </div>

                {/* Mini stats — derived from live data */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { emoji: "📍", value: `${distanceKm} km`, label: "Distance" },
                    { emoji: "🐾", value: `${avgActivity}%`, label: "Activity" },
                    { emoji: "🌙", value: `${restPct}%`, label: "Rest" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-[18px] bg-meow-cream px-2 py-3 text-center">
                      <p className="text-base">{s.emoji}</p>
                      <p className="mt-1 text-sm font-bold text-meow-dark">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Location */}
              <div className="md:col-span-2 rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Live Location</p>
                    <p className="text-sm font-semibold text-gray-700">
                      Lat {sim.currentPosition.latitude.toFixed(4)}, Lng {sim.currentPosition.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div className="h-[320px] rounded-2xl overflow-hidden">
                  <MapView
                    currentPosition={sim.currentPosition}
                    positionHistory={sim.positionHistory}
                    safeZone={safeZone}
                  />
                </div>
              </div>
            </div>

            {/* Bottom row: 3 metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-red-400" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Heart Rate</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark">{sim.currentMetrics.heartRate}<span className="text-sm font-normal text-gray-400 ml-1">bpm</span></p>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-meow-orange" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Temperature</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark">{sim.currentMetrics.bodyTemperature}<span className="text-sm font-normal text-gray-400 ml-1">°C</span></p>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-green-400" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Activity</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark">{sim.currentMetrics.activityLevel}<span className="text-sm font-normal text-gray-400 ml-1">%</span></p>
              </div>
            </div>

            {/* Heart Rate chart + Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Heart Rate Today */}
              <div className="md:col-span-2 rounded-[24px] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Today Heart Rate</h3>
                <div className="h-48">
                  <HeartRateChart data={sim.metricsHistory} />
                </div>
              </div>

              {/* Recent Activity — real behaviour transitions */}
              <div className="col-span-1 rounded-[24px] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
                {behaviorEvents.length === 0 ? (
                  <p className="text-xs text-gray-400">Gathering activity data…</p>
                ) : (
                  <div className="space-y-4">
                    {behaviorEvents.map((ev, i) => {
                      const d = behaviorDisplay(ev.category);
                      return (
                        <div key={`${ev.timestamp}-${i}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-meow-cream text-base">
                              {d.emoji}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-meow-dark">{d.action}</p>
                              <p className="text-xs text-gray-400">{formatTimestamp(ev.timestamp)}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${d.color}`}>{d.mood}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Smart Diary + Health Early-Warning */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Smart Cat Diary */}
              <div className="md:col-span-2 rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📖</span>
                  <h3 className="text-sm font-semibold text-gray-700">Smart Diary</h3>
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-meow-cream px-2.5 py-1 text-xs">
                    <span>{diary.mood.emoji}</span>
                    <span className="text-gray-500">{diary.mood.label}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{diary.narrative}</p>

                {diary.highlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {diary.highlights.map((h, i) => (
                      <span key={i} className="rounded-full bg-meow-cream px-3 py-1.5 text-xs text-gray-600">
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-meow-cream/60 px-4 py-3">
                  <p className="text-xs text-gray-600">{diary.healthNote}</p>
                </div>
              </div>

              {/* Health Early-Warning */}
              <div className="col-span-1 rounded-[24px] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Health Early-Warning</h3>

                {/* Wellness score */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0ece4" strokeWidth="4" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke={wellness.score >= 85 ? "#22c55e" : wellness.score >= 70 ? "#84cc16" : wellness.score >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${(wellness.score / 100) * 97.4} 97.4`}
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-meow-dark">{wellness.score}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize text-meow-dark">{wellness.grade}</p>
                    <p className="text-xs text-gray-400">Wellness score</p>
                  </div>
                </div>

                {/* Alerts */}
                {!settings.healthAlerts ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3">
                    <ShieldCheck size={16} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500">Health alerts are turned off in Settings.</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
                    <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-xs text-green-600">All clear - no health concerns detected.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        className={`rounded-2xl px-4 py-3 ${
                          a.severity === "critical"
                            ? "bg-red-50"
                            : a.severity === "warning"
                            ? "bg-amber-50"
                            : "bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={14}
                            className={`flex-shrink-0 ${
                              a.severity === "critical" ? "text-red-500" : a.severity === "warning" ? "text-amber-500" : "text-blue-500"
                            }`}
                          />
                          <p className={`text-xs font-semibold ${
                            a.severity === "critical" ? "text-red-700" : a.severity === "warning" ? "text-amber-700" : "text-blue-700"
                          }`}>{a.title}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">{a.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ HEALTH TAB ═══ */}
        {activeTab === "health" && (
          <>
            <div>
              <h2 className="text-xl font-bold text-meow-dark">Health Monitor</h2>
              <p className="text-sm text-gray-400">Live vitals and behaviour for {catName}.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className="text-red-400" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Heart Rate</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark mt-2">{sim.currentMetrics.heartRate}<span className="text-sm font-normal text-gray-400 ml-1">bpm</span></p>
                <p className={`text-xs mt-1 ${hrStatus.color}`}>{hrStatus.label}</p>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="text-meow-orange" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Temperature</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark mt-2">{sim.currentMetrics.bodyTemperature}<span className="text-sm font-normal text-gray-400 ml-1">°C</span></p>
                <p className={`text-xs mt-1 ${tempStatus.color}`}>{tempStatus.label}</p>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <PawPrint size={14} className="text-meow-orange" />
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Activity</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-meow-dark mt-2">{sim.currentMetrics.activityLevel}<span className="text-sm font-normal text-gray-400 ml-1">%</span></p>
                <p className="text-xs text-gray-400 mt-1">{getActivityLabel(sim.currentMetrics.activityLevel)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Today Heart Rate</h3>
                  <span className="text-xs text-meow-orange font-medium">{sim.currentMetrics.heartRate} bpm avg</span>
                </div>
                <div className="h-48">
                  <HeartRateChart data={sim.metricsHistory} />
                </div>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Weekly Activity</h3>
                </div>
                <div className="h-48">
                  <WeeklyActivityChart />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Behavior Analysis</h3>
              <div className="flex items-center gap-4">
                <p className="text-4xl">{behavior.category === "resting" ? "😴" : behavior.category === "active" ? "🏃" : behavior.category === "walking" ? "🐾" : behavior.category === "stressed" ? "⚠️" : behavior.category === "lethargic" ? "🚨" : "🔍"}</p>
                <div>
                  <p className="text-lg font-bold text-meow-dark">{behavior.label}</p>
                  <p className="text-xs text-gray-400 mt-1">Last updated: {formatTimestamp(sim.lastHealthUpdate)}</p>
                </div>
              </div>
            </div>

            <SleepPatternChart />
          </>
        )}

        {/* ═══ LOCATION TAB ═══ */}
        {activeTab === "location" && (
          <>
            <div>
              <h2 className="text-xl font-bold text-meow-dark">Live Location</h2>
              <p className="text-sm text-gray-400">Real-time position and safe-zone monitoring.</p>
            </div>

            {/* Geofence Alert */}
            {settings.geofenceAlerts && (geo.status.isOutside ? (
              <div className="rounded-[24px] bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="text-sm font-bold text-red-700">{catName} left the safe zone!</p>
                  <p className="text-xs text-red-500">{Math.round(geo.status.distance)}m from park, Safe zone radius: {safeZone.radius}m</p>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-bold text-green-700">{catName} is in the safe zone</p>
                  <p className="text-xs text-green-500">{Math.round(geo.status.distance)}m from park, Safe zone radius: {safeZone.radius}m</p>
                </div>
              </div>
            ))}

            <div className="rounded-[24px] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Tracking active</span>
                </div>
                <span className="text-xs text-gray-400">
                  Lat: {sim.currentPosition.latitude.toFixed(4)}, Lng: {sim.currentPosition.longitude.toFixed(4)}
                </span>
              </div>
              <div className="h-[320px] md:h-[500px] rounded-2xl overflow-hidden">
                <MapView
                  currentPosition={sim.currentPosition}
                  positionHistory={sim.positionHistory}
                  safeZone={safeZone}
                />
              </div>
            </div>

            {/* Geofence Events — durable enter/exit log */}
            <div className="rounded-[24px] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Geofence Events</h3>
                  <p className="text-xs text-gray-400">Safe-zone crossings, saved across sessions</p>
                </div>
                {geo.events.length > 0 && (
                  <button
                    onClick={geo.clearEvents}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Clear
                  </button>
                )}
              </div>

              {geo.events.length === 0 ? (
                <div className="flex items-center gap-2 rounded-2xl bg-meow-cream/60 px-4 py-4">
                  <span className="text-lg">🛰️</span>
                  <p className="text-xs text-gray-500">
                    No crossings yet. Events appear here the moment {catName} enters or leaves the safe zone.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {geo.events.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-2xl bg-meow-cream/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                            e.type === "exit" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"
                          }`}
                        >
                          {e.type === "exit" ? <LogOut size={16} /> : <LogIn size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-meow-dark">
                            {e.type === "exit" ? "Left safe zone" : "Returned to safe zone"}
                          </p>
                          <p className="text-xs text-gray-400">{e.distance}m from park</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(e.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today Journey + Location History — 2 column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Today Journey — derived from GPS trail */}
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Today's Journey</h3>
                <div className="divide-y divide-gray-100">
                  {[
                    { emoji: "🗺️", label: "Distance", value: `${distanceKm} km` },
                    { emoji: "⏱️", label: "Tracked", value: trackedDuration },
                    { emoji: "📍", label: "Farthest", value: `${farthest} m` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-base text-gray-500">{item.label}</span>
                      </div>
                      <span className="text-base font-bold text-meow-dark">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location History — recent GPS readings */}
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-meow-orange" />
                  <h3 className="text-sm font-semibold text-gray-700">Location History</h3>
                </div>
                {recentPositions.length === 0 ? (
                  <p className="text-xs text-gray-400">Waiting for location data…</p>
                ) : (
                  <div className="space-y-3">
                    {recentPositions.map((pos, i) => {
                      const dist = Math.round(distanceFromSafeZone(pos, safeZone));
                      const outside = getGeofenceStatus(pos, safeZone).isOutside;
                      return (
                        <div key={`${pos.timestamp}-${i}`} className="flex items-center justify-between rounded-2xl bg-meow-cream/60 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${outside ? "bg-red-500" : "bg-green-500"}`} />
                            <div>
                              <p className="text-sm font-medium text-meow-dark">{outside ? "Outside safe zone" : "Inside safe zone"}</p>
                              <p className="text-xs text-gray-400">{dist} m from park</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatTimestamp(pos.timestamp)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex md:hidden items-center justify-around border-t border-black/5 bg-white/95 px-2 py-1.5 backdrop-blur-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors ${
              activeTab === item.id ? "text-meow-orange" : "text-gray-400"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-gray-400"
        >
          <Settings size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-gray-400 hover:text-red-500"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetLocation={geo.clearEvents}
      />
    </div>
  );
}
