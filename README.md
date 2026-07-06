# 🐾 What's ON MeOW

A smart companion dashboard for cat owners. It turns raw signals from a cat's
smart collar — heart rate, body temperature, activity, and GPS — into something
you can actually understand: a plain-language daily diary, proactive health
early-warnings, and a reliable safe-zone (geofence) monitor.

> **Theme fit — positive impact for cats.** The whole product exists to help
> owners notice problems early and understand their cat's day. Health anomaly
> detection and safe-zone alerts are built to keep cats safe and healthy, not
> to surveil or harm.

---

## ✨ Features

### 1. Smart Cat Diary
Converts a day of health readings into a warm, narrative journal entry with:
- A natural-language summary of the day.
- A **mood** (derived from the dominant behaviour).
- **Highlights** — most active moment, calmest moment, peak temperature.
- A **health note** that plugs straight into the early-warning engine.

### 2. Health Early-Warning
A pure, deterministic engine that analyses a rolling window of recent metrics
and surfaces proactive alerts, ordered by severity:
- **Temperature** — fever / hypothermia.
- **Heart rate** — tachycardia (especially elevated *at rest*), bradycardia.
- **Behaviour** — prolonged lethargy.

Each alert carries a clear title, message, and an actionable recommendation.
It also computes a **Wellness Score** (0–100) with a per-category breakdown
(heart / temperature / activity).

### 3. Durable Geofence Monitor
A reliable safe-zone workflow:
- Accurate great-circle (Haversine) distance from the safe-zone centre.
- Derives **enter/exit events only on true boundary crossings** — no
  double-firing, no missed edges.
- Persists the event log to `localStorage`, so history **survives reloads**.
- Degrades gracefully if storage is unavailable, and validates persisted data
  as untrusted input.

### 4. Live Dashboard
Health metrics, activity/heart-rate/sleep charts, and a lightweight SVG map with
live position, trail, and safe-zone overlay.

---

## 🏗️ Architecture

The design separates **pure domain logic** from **React/UI** and **data
simulation**. Domain logic has no side effects, which makes it easy to reason
about and to cover with property-based tests.

```
                    ┌─────────────────────────┐
                    │      mock_data.json      │  seed data (collar readings)
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
   simulation ──▶   │  hooks/useSimulator      │  streams live metrics/position
                    │  hooks/useGeofenceMonitor │  durable enter/exit + storage
                    └────────────┬────────────┘
                                 │  (plain data in / out)
                    ┌────────────▼────────────┐
   pure domain ─▶   │  data/healthInsights.ts  │  analyzeHealth, wellness score
                    │  data/geofence.ts        │  distance, status, events
                    │  data/catDiary.ts        │  narrative diary
                    │  data/helpers.ts         │  behaviour + metric helpers
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
   presentation ─▶  │  pages/DashboardPage.tsx │  tabs: Home / Health / Location
                    │  components/*            │  charts, map, UI
                    └─────────────────────────┘
```

**Why this shape?** The engines (`healthInsights`, `geofence`, `catDiary`) are
pure functions: same input → same output, no I/O. The UI and the simulator are
the only places with state and side effects. This keeps the interesting logic
testable and deterministic.

### Project structure

```
src/
├── components/
│   ├── health/        HeartRateChart, WeeklyActivityChart, SleepPatternChart
│   ├── location/      MapView (pure SVG map)
│   └── ui/            shared UI primitives (card)
├── data/
│   ├── healthInsights.ts   early-warning engine + wellness score  (+ tests)
│   ├── geofence.ts         distance + safe-zone event pipeline     (+ tests)
│   ├── catDiary.ts         narrative diary generator
│   ├── helpers.ts          behaviour/metric helpers + generators
│   └── mockData.ts         typed loader for mock_data.json
├── hooks/
│   ├── useSimulator.ts        streams simulated live data
│   └── useGeofenceMonitor.ts  durable geofence event log
├── pages/
│   ├── DashboardPage.tsx   main dashboard (Home / Health / Location)
│   └── LoginPage.tsx
└── types/index.ts          shared domain types
```

---

## 🧰 Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Recharts** for charts
- **lucide-react** for icons
- **react-router-dom** for routing
- **Vitest** + **fast-check** for property-based testing

> **Note on data.** This build runs on simulated collar data (`mock_data.json`
> streamed via `useSimulator`) so the experience is fully demoable without
> hardware. All domain engines accept plain data, so swapping in a real collar
> feed is a matter of replacing the simulator source.

---

## 🚀 Getting started

Prerequisites: **Node.js 20+** (developed on Node 24) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# open the URL Vite prints (default http://localhost:5173)

# 3. Production build
npm run build

# 4. Preview the production build
npm run preview
```

The app opens on the Login page (`/`); the dashboard lives at `/dashboard`
(protected by a demo auth guard).

**Demo login:** username `admin`, password `meow123`. This is a client-side
demo auth only — see [SECURITY.md](./SECURITY.md) for details.

---

## 🧪 Testing

The domain engines are covered by **property-based tests** (fast-check), which
check invariants across thousands of generated inputs rather than a few
hand-picked cases.

```bash
npm run test
```

Examples of properties that are guaranteed:
- Wellness score is always within `[0, 100]`; its grade matches its score band.
- A fully feverish window always raises a **critical** temperature alert; a
  fully normal window raises **no** alerts.
- Health alerts are always ordered critical → warning → info.
- Geofence distance is zero to itself, symmetric, and non-negative.
- `isOutside` is exactly `distance > radius`.
- Geofence events strictly alternate enter/exit and reference only real
  timestamps; derivation is deterministic.

---

## 🔒 Security

See **[SECURITY.md](./SECURITY.md)** for the full report, including secure
coding practices, data handling, and the dependency-audit assessment.

Highlights:
- No secrets, credentials, or API keys in the codebase.
- Persisted `localStorage` data is validated as untrusted on read.
- No user data leaves the browser; there are no third-party network calls.
- An [Aikido security scan](./docs/aikido-scan-report.md) reports **0 issues**
  across dependencies, secrets, SAST, IaC, license, and malware checks.

---

## 📄 License / attribution

Original work created for the hackathon. Third-party libraries are used under
their respective licenses (see `package.json`).
