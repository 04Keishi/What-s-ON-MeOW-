# Design Document — What's ON MeOW

## Pendahuluan

Dokumen ini mendeskripsikan desain teknis aplikasi **What's ON MeOW**, sebuah dashboard web simulasi untuk memantau kondisi kucing melalui kalung pintar virtual. Proyek ini dibangun untuk hackathon **#HackTheKitty** oleh solo developer pemula dengan tujuan memberikan pengalaman monitoring kucing yang menarik dan informatif.

---

## Overview

**What's ON MeOW** adalah aplikasi Next.js single-page dashboard yang memvisualisasikan data kucing secara simulasi real-time. Tidak ada backend server sungguhan atau perangkat keras fisik — semua data berasal dari mock JSON yang dianimasikan di sisi frontend menggunakan `setInterval`.

### Tujuan Utama

| Tujuan | Deskripsi |
|--------|-----------|
| Simulasi Real-Time | Meniru pengalaman memantau kucing dengan smart collar tanpa hardware |
| Visualisasi Lokasi | Menampilkan posisi dan jalur pergerakan kucing di peta Mapbox |
| Visualisasi Kesehatan | Menampilkan metrik kesehatan (detak jantung, suhu, aktivitas) dengan grafik Recharts |
| Behavior Decoder | Menerjemahkan kombinasi metrik kesehatan menjadi label perilaku yang mudah dipahami |
| UX yang Menarik | UI warm/cat-themed dengan shadcn/ui + Tailwind CSS |

### Batasan Teknis

- Tidak ada autentikasi pengguna (single-user demo)
- Tidak ada persistensi database (state hidup di memory browser)
- Tidak ada API eksternal selain Mapbox tiles
- Data sepenuhnya statis dari file JSON lokal yang disimulasikan

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Next.js Pages Router                │  │
│  │                                                      │  │
│  │   src/pages/index.tsx  ←  Entry Point (Dashboard)   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│        ┌────────────┼────────────┐                         │
│        ▼            ▼            ▼                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐               │
│  │ CatProfile│ │ Location │ │   Health     │               │
│  │ Component │ │ Tracker  │ │   Monitor    │               │
│  └──────────┘ └──────────┘ └──────────────┘               │
│        │            │            │                          │
│        └────────────┼────────────┘                         │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Custom Hooks Layer                   │  │
│  │  useSimulator  │  useLocationData  │  useHealthData  │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼─────────────────────────────┐  │
│  │                   Data Layer                        │  │
│  │        src/data/mockData.ts + helpers              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │ Mapbox API (tile CDN)
         └──────────────────────→  api.mapbox.com
```

### Pola Arsitektur

Aplikasi menggunakan arsitektur **Unidirectional Data Flow** (aliran data satu arah):

```
Mock Data JSON  →  Simulator (setInterval)  →  Custom Hooks  →  Components  →  UI
```

1. **Data Layer** — file JSON statis sebagai "database" mock
2. **Simulator Layer** — custom hook `useSimulator` yang menghasilkan variasi data secara berkala
3. **State Layer** — custom hooks yang menyimpan state dan mengekspos data ke komponen
4. **Presentation Layer** — komponen React yang merender data ke UI

### Keputusan Arsitektur

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| Routing | Pages Router | Lebih sederhana untuk pemula, tidak perlu App Router |
| State Management | React useState + custom hooks | Cukup untuk skala hackathon, tidak perlu Redux/Zustand |
| Styling | Tailwind CSS + shadcn/ui | Cepat, konsisten, tidak perlu tulis CSS dari scratch |
| Peta | Mapbox GL JS | Peta interaktif berkualitas tinggi dengan token gratis |
| Grafik | Recharts | Integrasi React-native, tidak perlu konfigurasi kompleks |
| Data | Mock JSON + setInterval | Tidak perlu backend, sesuai scope hackathon |

---

## Components and Interfaces

### Diagram Komponen

```
src/pages/index.tsx (DashboardPage)
│
├── src/components/dashboard/
│   ├── DashboardHeader.tsx     — Judul app + metadata
│   └── DashboardLayout.tsx     — Grid layout utama
│
├── src/components/dashboard/CatProfile.tsx
│   └── Menampilkan foto, nama, ras, usia, status koneksi
│
├── src/components/dashboard/HealthSummaryCards.tsx
│   └── Kartu ringkasan 3 metrik (HR, Temp, Activity)
│
├── src/components/dashboard/BehaviorDecoder.tsx
│   └── Kartu Behavior_Label hasil analisis kombinasi metrik
│
├── src/components/location/
│   ├── LocationTracker.tsx     — Container + koordinat teks
│   ├── MapView.tsx             — Mapbox GL JS canvas
│   └── LiveIndicator.tsx       — Animasi dot "live"
│
└── src/components/health/
    ├── HealthMonitor.tsx       — Container layout kesehatan
    ├── MetricCard.tsx          — Satu kartu metrik + badge status
    ├── HeartRateChart.tsx      — Grafik riwayat detak jantung
    └── StatusBadge.tsx         — Badge Normal/Waspada/Kritis
```

### Interfaces Komponen Utama

#### `DashboardPage` (src/pages/index.tsx)

```typescript
// Tidak ada props — halaman root
// Menggunakan semua hooks dan meng-compose layout
```

#### `CatProfile`

```typescript
interface CatProfileProps {
  profile: CatProfile;               // data profil dari mock
  connectionStatus: ConnectionStatus; // "connected" | "disconnected"
}
```

#### `LocationTracker`

```typescript
interface LocationTrackerProps {
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];    // max 20 titik terakhir
  safeZone: SafeZone | null;
  isSimulatorActive: boolean;
}
```

#### `HealthMonitor`

```typescript
interface HealthMonitorProps {
  currentMetrics: HealthMetric;
  metricsHistory: HealthMetric[];    // min 10 titik untuk grafik
  lastUpdated: string;               // ISO timestamp
}
```

#### `MetricCard`

```typescript
interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  status: HealthStatus;              // "normal" | "warning" | "critical"
  lastUpdated: string;
}
```

#### `HeartRateChart`

```typescript
interface HeartRateChartProps {
  data: Array<{ time: string; heartRate: number }>;
  thresholds: HeartRateThresholds;
}
```

#### `MapView`

```typescript
interface MapViewProps {
  center: [number, number];          // [lng, lat] — Mapbox format
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];
  safeZone: SafeZone | null;
  mapboxToken: string;
}
```

#### `BehaviorDecoder`

```typescript
interface BehaviorDecoderProps {
  currentMetrics: HealthMetric;
  catName: string;               // dari Cat_Profile.name untuk label personal
}
```

#### `StatusBadge`

```typescript
interface StatusBadgeProps {
  status: HealthStatus;
  label?: string;                    // Override label default
}
```

### Custom Hooks Interfaces

#### `useSimulator`

```typescript
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

function useSimulator(mockData: MockData): UseSimulatorReturn
```

#### `useLocationData`

```typescript
interface UseLocationDataReturn {
  currentPosition: GeoPosition | null;
  positionHistory: GeoPosition[];
  isLoading: boolean;
  error: string | null;
}

function useLocationData(
  initialData: LocationData,
  historyData: GeoPosition[]
): UseLocationDataReturn
```

#### `useHealthData`

```typescript
interface UseHealthDataReturn {
  currentMetrics: HealthMetric | null;
  metricsHistory: HealthMetric[];
  getMetricStatus: (metricType: MetricType, value: number) => HealthStatus;
  isLoading: boolean;
  error: string | null;
}

function useHealthData(
  initialMetric: HealthMetric,
  historyData: HealthMetric[]
): UseHealthDataReturn
```

---

## Data Models

### TypeScript Type Definitions (src/types/index.ts)

```typescript
// ─── Profil Kucing ────────────────────────────────────────────────────────────

export type ConnectionStatus = "connected" | "disconnected";

export interface CatProfile {
  id: string;
  name: string;
  breed: string;
  age: number;          // dalam tahun
  photoUrl: string;     // URL gambar atau string kosong
  connectionStatus: ConnectionStatus;
}

// ─── Lokasi ──────────────────────────────────────────────────────────────────

export interface GeoPosition {
  latitude: number;
  longitude: number;
  timestamp: string;    // ISO 8601
}

export interface SafeZone {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;       // meter
}

export interface LocationData {
  current: GeoPosition;
  safeZone: SafeZone;
}

// ─── Kesehatan ───────────────────────────────────────────────────────────────

export interface HealthMetric {
  heartRate: number;          // bpm
  bodyTemperature: number;    // °C
  activityLevel: number;      // 0–100
  timestamp: string;          // ISO 8601
}

export type HealthStatus = "normal" | "warning" | "critical";
export type MetricType = "heartRate" | "bodyTemperature" | "activityLevel";

// ─── Behavior Decoder ─────────────────────────────────────────────────────────

export type BehaviorCategory =
  | "resting"
  | "walking"
  | "active"
  | "stressed"
  | "lethargic"
  | "unknown";

export interface BehaviorResult {
  category: BehaviorCategory;
  label: string;   // teks lengkap dengan nama kucing + emoji
  emoji: string;   // emoji representatif
}

export interface HeartRateThresholds {
  normalMin: number;    // 100
  normalMax: number;    // 180
  warningMin: number;   // 80
  warningMax: number;   // 220
  // di luar warningMin/warningMax = critical
}

export interface BodyTemperatureThresholds {
  normalMin: number;    // 38.0
  normalMax: number;    // 39.5
  warningMin: number;   // 37.5
  warningMax: number;   // 40.0
}

export interface ActivityLevel {
  value: number;        // 0–100
  label: "Istirahat" | "Berjalan" | "Berlari";
}

// ─── Mock Data (struktur file JSON) ──────────────────────────────────────────

export interface MockData {
  catProfile: CatProfile;
  location: LocationData;
  health: {
    current: HealthMetric;
    history: HealthMetric[];
  };
  locationHistory: GeoPosition[];
}
```

### Struktur Mock Data JSON (src/data/mockData.ts)

```typescript
import { MockData } from "@/types";

export const mockData: MockData = {
  catProfile: {
    id: "cat-001",
    name: "Mochi",
    breed: "Scottish Fold",
    age: 3,
    photoUrl: "/images/mochi.jpg",
    connectionStatus: "connected"
  },
  location: {
    current: {
      latitude: -6.2088,
      longitude: 106.8456,
      timestamp: "2025-01-01T08:00:00.000Z"
    },
    safeZone: {
      center: { latitude: -6.2088, longitude: 106.8456 },
      radius: 200
    }
  },
  health: {
    current: {
      heartRate: 140,
      bodyTemperature: 38.5,
      activityLevel: 45,
      timestamp: "2025-01-01T08:00:00.000Z"
    },
    history: [
      /* minimal 10 titik data HealthMetric */
    ]
  },
  locationHistory: [
    /* minimal 10 titik GeoPosition */
  ]
};
```

### Helper Functions (src/data/helpers.ts)

```typescript
import { GeoPosition, HealthMetric, HealthStatus, MetricType } from "@/types";

/**
 * Menghasilkan posisi baru dengan pergeseran acak maksimal ±0.0005°
 */
export function generateNextPosition(prev: GeoPosition): GeoPosition

/**
 * Menghasilkan metrik kesehatan baru dengan variasi acak realistis
 */
export function generateNextHealthMetric(prev: HealthMetric): HealthMetric

/**
 * Menentukan status kesehatan berdasarkan tipe metrik dan nilainya
 */
export function getHealthStatus(type: MetricType, value: number): HealthStatus

/**
 * Mengubah activityLevel (0–100) menjadi label teks
 */
export function getActivityLabel(level: number): "Istirahat" | "Berjalan" | "Berlari"

/**
 * Menganalisis kombinasi HealthMetric dan menghasilkan BehaviorResult
 * Rules (prioritas dari atas ke bawah):
 *   lethargic : activity ≤ 20 AND heartRate < 100 AND bodyTemp < 38.0
 *   stressed  : activity ≤ 33 AND (heartRate > 180 OR bodyTemp > 39.5)
 *   active    : activity ≥ 67 AND heartRate ≤ 220 AND bodyTemp ≤ 40.0
 *   walking   : activity 34–66 AND heartRate 100–180 AND bodyTemp 38.0–39.5
 *   resting   : activity ≤ 33 AND heartRate 100–180 AND bodyTemp 38.0–39.5
 *   unknown   : semua kondisi lain
 */
export function getBehaviorResult(metrics: HealthMetric, catName: string): BehaviorResult

/**
 * Memangkas array history agar tidak melebihi maxLength
 */
export function trimHistory<T>(history: T[], maxLength: number): T[]

/**
 * Memformat timestamp ISO ke format HH:mm:ss lokal
 */
export function formatTimestamp(isoString: string): string
```

### Utility Functions (src/lib/utils.ts)

```typescript
/**
 * Menggabungkan class names (re-export dari shadcn/ui cn utility)
 */
export function cn(...classes: (string | undefined | null | false)[]): string

/**
 * Mengkonversi GeoPosition ke format [lng, lat] untuk Mapbox
 */
export function positionToLngLat(pos: GeoPosition): [number, number]

/**
 * Mengubah array GeoPosition menjadi GeoJSON LineString untuk path trail
 */
export function positionsToGeoJSON(positions: GeoPosition[]): GeoJSON.LineString
```

---

## Struktur Folder

```
src/
├── pages/
│   ├── _app.tsx              — Next.js App wrapper, global styles
│   ├── _document.tsx         — Custom Document (opsional, untuk meta tags)
│   └── index.tsx             — Halaman Dashboard utama
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx        — Header dengan judul app
│   │   ├── DashboardLayout.tsx        — Grid layout 2-kolom (peta | kesehatan)
│   │   ├── CatProfile.tsx             — Profil kucing + status collar
│   │   ├── BehaviorDecoder.tsx        — Kartu perilaku kucing (Behavior_Label)
│   │   ├── HealthSummaryCards.tsx     — 3 kartu ringkasan metrik
│   │   └── ErrorState.tsx             — Tampilan error + tombol retry
│   │
│   ├── location/
│   │   ├── LocationTracker.tsx        — Container + koordinat teks
│   │   ├── MapView.tsx                — Mapbox GL JS wrapper
│   │   └── LiveIndicator.tsx          — Animasi pulsing dot "live"
│   │
│   └── health/
│       ├── HealthMonitor.tsx          — Container layout kesehatan
│       ├── MetricCard.tsx             — Kartu satu metrik + badge
│       ├── HeartRateChart.tsx         — Recharts line chart
│       └── StatusBadge.tsx            — Badge Normal/Waspada/Kritis
│
├── hooks/
│   ├── useSimulator.ts        — Orchestrator: jalankan dua setInterval
│   ├── useLocationData.ts     — State + logika untuk lokasi
│   └── useHealthData.ts       — State + logika untuk kesehatan
│
├── types/
│   └── index.ts               — Semua TypeScript interfaces & types
│
├── data/
│   ├── mockData.ts            — File mock data utama (import dari JSON)
│   └── helpers.ts             — Pure functions: generator + formatter
│
└── lib/
    └── utils.ts               — Utility functions (cn, positionToLngLat, dll)

public/
├── images/
│   ├── mochi.jpg              — Foto kucing default
│   └── cat-placeholder.png   — Placeholder jika foto gagal load
└── favicon.ico
```

---

## Data Flow

### Aliran Data Simulasi Lokasi (setiap 3 detik)

```
mockData.locationHistory (array awal)
        │
        ▼
useSimulator (setInterval, 3000ms)
        │  generateNextPosition(currentPos)
        ▼
positionHistory (state array, max 20 items)
        │
        ├──→ LocationTracker → koordinat teks (lat/lng)
        │
        └──→ MapView → Mapbox marker + LineString path
```

### Aliran Data Simulasi Kesehatan (setiap 5 detik)

```
mockData.health.history (array awal)
        │
        ▼
useSimulator (setInterval, 5000ms)
        │  generateNextHealthMetric(currentMetric)
        ▼
metricsHistory (state array, max 50 items)
        │
        ├──→ MetricCard (heartRate) → nilai + StatusBadge
        ├──→ MetricCard (bodyTemp)  → nilai + StatusBadge
        ├──→ MetricCard (activity)  → label + StatusBadge
        ├──→ HeartRateChart         → grafik 10 titik terakhir
        └──→ BehaviorDecoder        → getBehaviorResult() → Behavior_Label
```

### Lifecycle Simulator

```
Component Mount
      │
      ▼
useSimulator() dipanggil
      │
      ├── locationInterval = setInterval(updateLocation, 3000)
      └── healthInterval   = setInterval(updateHealth, 5000)

Component Unmount (useEffect cleanup)
      │
      ├── clearInterval(locationInterval)
      └── clearInterval(healthInterval)
```

---

## Correctness Properties

*A property adalah karakteristik atau perilaku yang harus berlaku di semua eksekusi valid sistem — pada dasarnya, pernyataan formal tentang apa yang harus dilakukan sistem. Properties berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi secara otomatis.*

### Property 1: Rendering field CatProfile bersifat lengkap

*Untuk setiap* objek `CatProfile` yang valid, komponen `CatProfile` harus merender semua field yang tersedia (name, breed, age, photoUrl) dalam outputnya tanpa ada field yang hilang dari tampilan.

**Validates: Requirements 1.1, 2.1, 2.3**

---

### Property 2: Rendering HealthSummaryCards mencakup semua metrik

*Untuk setiap* objek `HealthMetric` yang valid, komponen `HealthSummaryCards` harus menampilkan nilai `heartRate`, `bodyTemperature`, dan `activityLevel` — ketiganya harus muncul dalam output render secara bersamaan.

**Validates: Requirements 1.2, 4.1**

---

### Property 3: Placeholder selalu ditampilkan untuk field kosong atau null

*Untuk setiap* kombinasi field kosong atau null pada `CatProfile` (name, breed, age, photoUrl), komponen `CatProfile` harus menampilkan teks placeholder yang sesuai untuk field yang bersangkutan dan tidak pernah merender nilai `null`, `undefined`, atau string kosong tanpa pengganti.

**Validates: Requirements 1.6, 2.2**

---

### Property 4: Indikator connectionStatus selalu mencerminkan nilai yang benar

*Untuk setiap* nilai `connectionStatus` yang valid (`"connected"` atau `"disconnected"`), komponen `CatProfile` harus merender label teks dan kelas warna yang tepat (hijau untuk "connected", merah/abu-abu untuk "disconnected") — tidak pernah menampilkan label atau warna yang tidak sesuai dengan nilai statusnya.

**Validates: Requirements 2.4**

---

### Property 5: LocationTracker selalu menangani kondisi posisi ada/tidak

*Untuk setiap* nilai `currentPosition` (baik `GeoPosition` valid maupun `null`), komponen `LocationTracker` harus merender marker di peta jika posisi tersedia, atau pesan "Lokasi tidak tersedia" jika posisi adalah `null` — tidak pernah crash atau merender state yang ambigu.

**Validates: Requirements 3.2**

---

### Property 6: Path trail selalu dibatasi antara 0 dan 20 posisi

*Untuk setiap* array `positionHistory` berukuran N, komponen `LocationTracker` harus menampilkan jalur (*trail*) dengan jumlah titik `min(N, 20)` — tidak pernah menampilkan lebih dari 20 posisi, dan menampilkan semua posisi yang ada jika jumlahnya kurang dari 20.

**Validates: Requirements 3.4**

---

### Property 7: Koordinat posisi selalu ditampilkan sebagai teks numerik

*Untuk setiap* `GeoPosition` yang valid, komponen `LocationTracker` harus merender nilai `latitude` dan `longitude` sebagai teks yang dapat dibaca, dan teks tersebut harus mengandung nilai numerik yang identik dengan nilai pada objek posisi.

**Validates: Requirements 3.5**

---

### Property 8: Simulator cycling kembali ke awal setelah array habis

*Untuk setiap* array posisi berukuran N (N > 0), setelah simulator melakukan N langkah maju, langkah berikutnya harus menghasilkan posisi yang sama dengan posisi pada indeks 0 array tersebut — simulasi tidak pernah berhenti atau menghasilkan posisi di luar array.

**Validates: Requirements 3.8**

---

### Property 9: HeartRateChart selalu menerima tepat 10 titik data terakhir

*Untuk setiap* array `metricsHistory` dengan panjang ≥ 10, komponen `HeartRateChart` harus menerima data array dengan tepat 10 elemen yang merupakan 10 item paling baru (slice terakhir) dari history tersebut.

**Validates: Requirements 4.3**

---

### Property 10: Fungsi getHealthStatus dan MetricCard selalu menghasilkan status yang konsisten dengan threshold

*Untuk setiap* nilai metrik kesehatan (heartRate, bodyTemperature, activityLevel), fungsi `getHealthStatus()` harus mengembalikan `HealthStatus` yang tepat sesuai dengan aturan threshold yang terdefinisi, dan komponen `MetricCard` harus merender tampilan yang sesuai dengan status tersebut (background merah + ikon ⚠ untuk status "critical", warna kuning untuk "warning", warna normal untuk "normal") — tidak pernah ada ketidaksesuaian antara nilai metrik dan tampilannya.

Threshold yang harus dipenuhi:
- heartRate: normal [100–180], warning [80–99 | 181–220], critical [<80 | >220]
- bodyTemperature: normal [38.0–39.5], warning [37.5–37.9 | 39.6–40.0], critical [<37.5 | >40.0]
- activityLevel: Istirahat [0–33], Berjalan [34–66], Berlari [67–100]

**Validates: Requirements 4.4, 4.5**

---

### Property 11: Format timestamp selalu menghasilkan string HH:mm:ss

*Untuk setiap* string timestamp ISO 8601 yang valid, fungsi `formatTimestamp()` harus menghasilkan string yang tepat memenuhi pola `HH:mm:ss` (dua digit jam, dua digit menit, dua digit detik, dipisahkan tanda titik dua).

**Validates: Requirements 4.6**

---

### Property 12: Generator Health_Metric selalu menghasilkan nilai dalam rentang realistis

*Untuk setiap* `HealthMetric` input yang valid, fungsi `generateNextHealthMetric()` harus menghasilkan `HealthMetric` baru di mana:
- `heartRate` berada dalam rentang [60, 240] bpm
- `bodyTemperature` berada dalam rentang [36.0, 42.0] °C
- `activityLevel` berada dalam rentang [0, 100]

Tidak pernah menghasilkan nilai di luar rentang ini meskipun dijalankan berulang kali (100+ iterasi).

**Validates: Requirements 5.2**

---

### Property 13: Generator posisi selalu menghasilkan pergeseran maksimal ±0.0005°

*Untuk setiap* `GeoPosition` input yang valid, fungsi `generateNextPosition()` harus menghasilkan posisi baru di mana:
- `|newLatitude - prevLatitude| ≤ 0.0005`
- `|newLongitude - prevLongitude| ≤ 0.0005`

Tidak pernah menghasilkan lompatan posisi yang melebihi batas ini (berlaku untuk semua iterasi).

**Validates: Requirements 5.3**

---

### Property 14: Fungsi getBehaviorResult selalu menghasilkan kategori yang sesuai dengan aturan kombinasi metrik

*Untuk setiap* objek `HealthMetric` yang valid, fungsi `getBehaviorResult()` harus mengembalikan `BehaviorResult` dengan `category` yang tepat sesuai dengan aturan kombinasi berikut (prioritas dari atas ke bawah):

| Kondisi | category yang diharapkan |
|---------|--------------------------|
| activityLevel ≤ 20 AND heartRate < 100 AND bodyTemperature < 38.0 | `"lethargic"` |
| activityLevel ≤ 33 AND (heartRate > 180 OR bodyTemperature > 39.5) | `"stressed"` |
| activityLevel ≥ 67 AND heartRate ≤ 220 AND bodyTemperature ≤ 40.0 | `"active"` |
| activityLevel 34–66 AND heartRate 100–180 AND bodyTemperature 38.0–39.5 | `"walking"` |
| activityLevel ≤ 33 AND heartRate 100–180 AND bodyTemperature 38.0–39.5 | `"resting"` |
| semua kondisi lain | `"unknown"` |

Fungsi tidak pernah mengembalikan `category` yang tidak sesuai dengan nilai metrik input, dan label yang dihasilkan selalu mengandung `catName` yang diberikan sebagai parameter.

**Validates: Requirements 8.2, 8.5**

---

## Error Handling

### Strategi Penanganan Error

| Skenario Error | Komponen | Penanganan |
|---------------|----------|------------|
| Mock data gagal diimpor | `DashboardPage` | Tampilkan `ErrorState` dengan pesan + tombol retry |
| `photoUrl` tidak valid / 404 | `CatProfile` | `onError` pada `<img>` → ganti ke `cat-placeholder.png` |
| Mapbox token tidak valid | `MapView` | Catch error Mapbox, tampilkan fallback UI dengan koordinat teks saja |
| Field CatProfile kosong/null | `CatProfile` | Tampilkan string placeholder: `"Nama tidak tersedia"`, `"Ras tidak diketahui"`, dll |
| `currentPosition` null | `LocationTracker` | Tampilkan `<p>Lokasi tidak tersedia</p>` di area peta |
| Array history kosong | `HeartRateChart` | Render chart kosong atau pesan "Belum ada data riwayat" |
| Metrik tidak masuk kategori manapun | `BehaviorDecoder` | Tampilkan label `"unknown"`: "Memantau kondisi {name}... 🔍" |

### Error Boundary

```typescript
// src/components/dashboard/ErrorState.tsx
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

// Digunakan di DashboardPage untuk membungkus load data awal
```

### Defensive Rendering Pattern

Semua komponen menggunakan optional chaining dan nullish coalescing untuk menghindari crash:

```typescript
// Contoh di CatProfile.tsx
const displayName = profile?.name || "Nama tidak tersedia";
const displayBreed = profile?.breed || "Ras tidak diketahui";
const displayAge = profile?.age != null ? `${profile.age} tahun` : "Usia tidak tersedia";
```

---

## Testing Strategy

### Pendekatan Pengujian

Proyek ini menggunakan **dual testing approach** yang menggabungkan:
1. **Unit Tests** — untuk skenario spesifik, edge cases, dan kondisi error
2. **Property-Based Tests** — untuk properties universal yang harus berlaku di semua input

### Library yang Digunakan

| Library | Versi | Fungsi |
|---------|-------|--------|
| Vitest | latest | Test runner (kompatibel dengan Next.js/Vite) |
| fast-check | latest | Property-based testing library untuk TypeScript |
| @testing-library/react | latest | Render dan interaksi komponen React |
| @testing-library/user-event | latest | Simulasi interaksi user |

### Konfigurasi Property Tests

Setiap property test dikonfigurasi dengan **minimal 100 iterasi** untuk memaksimalkan coverage input acak:

```typescript
import fc from "fast-check";

// Contoh konfigurasi
fc.assert(
  fc.property(fc.record({ ... }), (input) => {
    // assertion
  }),
  { numRuns: 100 } // minimal 100 iterasi
);
```

### Tag Format

Setiap property test harus memiliki komentar referensi:

```typescript
// Feature: whats-on-meow, Property 10: getHealthStatus consistent with thresholds
```

### Mapping Property → Test

| Property | Test File | Fungsi yang Diuji |
|----------|-----------|-------------------|
| Property 1 | `CatProfile.test.tsx` | `CatProfile` render |
| Property 2 | `HealthSummaryCards.test.tsx` | `HealthSummaryCards` render |
| Property 3 | `CatProfile.test.tsx` | Placeholder rendering |
| Property 4 | `CatProfile.test.tsx` | connectionStatus indicator |
| Property 5 | `LocationTracker.test.tsx` | Null position handling |
| Property 6 | `LocationTracker.test.tsx` | Path trail length invariant |
| Property 7 | `LocationTracker.test.tsx` | Coordinate text rendering |
| Property 8 | `useSimulator.test.ts` | Cycling behavior |
| Property 9 | `HeartRateChart.test.tsx` | Data slicing (10 items) |
| Property 10 | `getHealthStatus.test.ts` + `MetricCard.test.tsx` | Threshold classification + rendering |
| Property 11 | `formatTimestamp.test.ts` | HH:mm:ss format |
| Property 12 | `helpers.test.ts` | `generateNextHealthMetric` range |
| Property 13 | `helpers.test.ts` | `generateNextPosition` delta |
| Property 14 | `getBehaviorResult.property.test.ts` | `getBehaviorResult` kategori vs metrik |

### Unit Tests (Example-Based)

Unit test difokuskan pada skenario spesifik yang tidak cocok untuk property-based testing:

```
tests/
├── unit/
│   ├── components/
│   │   ├── DashboardHeader.test.tsx    — "What's ON MeOW" teks muncul
│   │   ├── ErrorState.test.tsx         — Error message + retry button
│   │   └── SkeletonLoading.test.tsx    — Skeleton muncul saat loading
│   └── hooks/
│       ├── useSimulator.test.ts        — clearInterval saat unmount
│       │                               — Update lokasi @ 3s, kesehatan @ 5s
│       └── useHealthData.test.ts       — State update setelah simulasi
└── property/
    ├── helpers.property.test.ts        — Properties 12, 13
    ├── getHealthStatus.property.test.ts — Property 10 (logika murni)
    ├── formatTimestamp.property.test.ts — Property 11
    └── components/
        ├── CatProfile.property.test.tsx    — Properties 1, 3, 4
        ├── HealthSummaryCards.property.test.tsx — Property 2
        ├── LocationTracker.property.test.tsx — Properties 5, 6, 7
        ├── HeartRateChart.property.test.tsx  — Property 9
        └── MetricCard.property.test.tsx      — Property 10 (rendering)
```

### Prioritas Testing untuk Hackathon

Mengingat ini adalah proyek hackathon solo developer pemula, urutan prioritas testing:

1. **Prioritas Tinggi** — Pure functions yang mudah diuji tanpa rendering:
   - `getHealthStatus()` — Property 10
   - `generateNextHealthMetric()` — Property 12
   - `generateNextPosition()` — Property 13
   - `formatTimestamp()` — Property 11
   - `getBehaviorResult()` — Property 14

2. **Prioritas Menengah** — Component tests untuk logika kritis:
   - `CatProfile` placeholder behavior — Property 3
   - `MetricCard` critical state rendering — Property 10

3. **Prioritas Rendah** — Integration/smoke tests:
   - Layout responsif (manual/visual testing)
   - Mapbox initialization (mock)
   - clearInterval cleanup

