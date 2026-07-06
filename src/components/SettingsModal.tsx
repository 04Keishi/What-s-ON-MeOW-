import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onResetLocation: () => void;
}

export default function SettingsModal({ open, onClose, onResetLocation }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const [draft, setDraft] = useState(settings);

  if (!open) return null;

  const save = () => {
    updateSettings({
      ...draft,
      catName: draft.catName.trim() || settings.catName,
      catAge: Number.isFinite(draft.catAge) && draft.catAge >= 0 ? draft.catAge : settings.catAge,
    });
    onClose();
  };

  const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-meow-dark outline-none transition-colors focus:border-meow-orange focus:ring-1 focus:ring-meow-orange";
  const label = "text-[11px] font-medium uppercase tracking-wide text-gray-400";

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-[24px] bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-meow-dark">Settings</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-meow-dark"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Cat profile */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">🐱 Cat Profile</h3>
            <div>
              <label className={label}>Name</label>
              <input
                className={field}
                value={draft.catName}
                onChange={(e) => setDraft({ ...draft, catName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Breed</label>
                <input
                  className={field}
                  value={draft.catBreed}
                  onChange={(e) => setDraft({ ...draft, catBreed: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Age (yrs)</label>
                <input
                  type="number"
                  min={0}
                  className={field}
                  value={draft.catAge}
                  onChange={(e) => setDraft({ ...draft, catAge: parseInt(e.target.value, 10) })}
                />
              </div>
            </div>
          </section>

          {/* Owner profile */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">👤 Meowner Profile</h3>
            <div>
              <label className={label}>Name</label>
              <input
                className={field}
                value={draft.ownerName}
                onChange={(e) => setDraft({ ...draft, ownerName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Email</label>
                <input
                  type="email"
                  className={field}
                  value={draft.ownerEmail}
                  onChange={(e) => setDraft({ ...draft, ownerEmail: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Phone</label>
                <input
                  className={field}
                  value={draft.ownerPhone}
                  onChange={(e) => setDraft({ ...draft, ownerPhone: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Safe zone */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">📍 Safe Zone</h3>
            <div>
              <div className="flex items-center justify-between">
                <label className={label}>Radius</label>
                <span className="text-sm font-semibold text-meow-orange">{draft.safeZoneRadius} m</span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={draft.safeZoneRadius}
                onChange={(e) => setDraft({ ...draft, safeZoneRadius: parseInt(e.target.value, 10) })}
                className="mt-2 w-full accent-meow-orange"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>50 m</span>
                <span>1000 m</span>
              </div>
            </div>
          </section>

          {/* Alerts */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">🔔 Alerts</h3>
            <Toggle
              label="Geofence alerts"
              checked={draft.geofenceAlerts}
              onChange={(v) => setDraft({ ...draft, geofenceAlerts: v })}
            />
            <Toggle
              label="Health early-warnings"
              checked={draft.healthAlerts}
              onChange={(v) => setDraft({ ...draft, healthAlerts: v })}
            />
          </section>

          {/* Data */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">🗂️ Data</h3>
            <button
              onClick={onResetLocation}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={14} />
              Clear saved geofence history
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-meow-orange px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-meow-orange-dark hover:shadow-md active:scale-[0.99]"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl bg-meow-cream/60 px-4 py-3"
    >
      <span className="text-sm text-meow-dark">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-meow-orange" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
