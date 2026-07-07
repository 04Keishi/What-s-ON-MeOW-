# Implementation Plan: What's ON MeOW

## Overview

Implementasi dilakukan secara bertahap — dari setup proyek, data layer, custom hooks, hingga komponen UI. Setiap task dirancang cukup kecil untuk dikerjakan dalam satu sesi coding. Gunakan task ini satu per satu dari atas ke bawah.

Implementasi dilakukan secara bertahap — dari setup proyek, data layer, custom hooks, hingga komponen UI. Setiap task dirancang cukup kecil untuk dikerjakan dalam satu sesi coding. Gunakan task ini satu per satu dari atas ke bawah.

---

## Tasks

- [ ] 1. Setup proyek Next.js dan konfigurasi awal
  - [ ] 1.1 Inisialisasi proyek Next.js dengan TypeScript dan Pages Router
    - Jalankan `npx create-next-app@latest whats-on-meow --typescript --no-app --no-src-dir` (atau dengan `src/` jika lebih nyaman)
    - Pastikan struktur folder `src/pages/`, `src/components/`, `src/hooks/`, `src/types/`, `src/data/`, `src/lib/` dibuat
    - _Requirements: 1.4, 7.3_

  - [ ] 1.2 Install dan konfigurasi Tailwind CSS + shadcn/ui
    - Install Tailwind CSS mengikuti panduan resmi untuk Next.js
    - Jalankan `npx shadcn@latest init` untuk setup shadcn/ui
    - Tambahkan komponen shadcn yang dibutuhkan: `card`, `badge`
    - _Requirements: 7.2, 7.3_

  - [ ] 1.3 Install dependensi library utama
    - Install Mapbox GL JS: `npm install mapbox-gl`
    - Install Recharts: `npm install recharts`
    - Install type definitions: `npm install -D @types/mapbox-gl`
    - _Requirements: 3.1, 4.3_

  - [ ] 1.4 Install dan konfigurasi testing framework
    - Install Vitest, fast-check, dan testing-library: `npm install -D vitest @testing-library/react @testing-library/user-event fast-check @vitejs/plugin-react jsdom`
    - Buat file `vitest.config.ts` dengan konfigurasi environment jsdom
    - Tambahkan script `"test": "vitest --run"` di `package.json`
    - _Requirements: (testing infrastructure)_

- [ ] 2. Definisi TypeScript types dan struktur data
  - [ ] 2.1 Buat file `src/types/index.ts` dengan semua TypeScript interfaces
    - Definisikan `ConnectionStatus`, `CatProfile`, `GeoPosition`, `SafeZone`, `LocationData`
    - Definisikan `HealthMetric`, `HealthStatus`, `MetricType`
    - Definisikan `BehaviorCategory`, `BehaviorResult`
    - Definisikan `HeartRateThresholds`, `BodyTemperatureThresholds`, `ActivityLevel`
    - Definisikan `MockData` sebagai tipe agregat keseluruhan
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 3. Isi mock data dan buat data layer
  - [ ] 3.1 Isi file `mock_data.json` dengan data lengkap kucing "Mochi"
    - Isi `catProfile` dengan data Mochi (Scottish Fold, 3 tahun, connectionStatus: "connected")
    - Isi `location.current` dengan koordinat Jakarta (`latitude: -6.2088, longitude: 106.8456`)
    - Isi `location.safeZone` dengan center dan radius 200 meter
    - Isi `health.current` dengan nilai awal realistis (heartRate: 140, bodyTemperature: 38.5, activityLevel: 45)
    - Isi `locationHistory` dengan minimal 10 titik `GeoPosition` berurutan
    - Isi `health.history` dengan minimal 10 titik `HealthMetric` berurutan
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 3.2 Buat file `src/data/mockData.ts` yang mengimpor mock_data.json
    - Import JSON dan cast ke tipe `MockData`
    - Export sebagai `mockData` dengan tipe eksplisit
    - _Requirements: 6.7_

  - [ ] 3.3 Buat file `src/lib/utils.ts` dengan utility functions
    - Implementasikan fungsi `cn()` menggunakan `clsx` atau `tailwind-merge`
    - Implementasikan `positionToLngLat(pos: GeoPosition): [number, number]`
    - Implementasikan `positionsToGeoJSON(positions: GeoPosition[]): GeoJSON.LineString`
    - _Requirements: 3.1, 3.4_

  - [ ] 3.4 Buat file `src/data/helpers.ts` dengan pure helper functions
    - Implementasikan `generateNextPosition(prev: GeoPosition): GeoPosition` — pergeseran acak maksimal ±0.0005°
    - Implementasikan `generateNextHealthMetric(prev: HealthMetric): HealthMetric` — variasi acak dalam rentang realistis
    - Implementasikan `getHealthStatus(type: MetricType, value: number): HealthStatus` — threshold sesuai requirements 4.4
    - Implementasikan `getActivityLabel(level: number)` — konversi 0–100 ke label teks
    - Implementasikan `getBehaviorResult(metrics: HealthMetric, catName: string): BehaviorResult` — 6 rules kombinasi metrik
    - Implementasikan `trimHistory<T>(history: T[], maxLength: number): T[]`
    - Implementasikan `formatTimestamp(isoString: string): string` — output format `HH:mm:ss`
    - _Requirements: 5.2, 5.3, 4.4, 4.6, 8.2, 8.5_

- [ ] 4. Checkpoint pertama — validasi data layer
  - Pastikan semua types ter-compile tanpa error TypeScript
  - Pastikan semua pure functions di `helpers.ts` bisa diimpor dan dipanggil tanpa error
  - Pastikan mock data JSON valid dan bisa diimpor
  - Tanyakan jika ada pertanyaan sebelum lanjut ke testing.

- [ ] 5. Property tests dan unit tests untuk data layer
  - [ ] 5.1 Buat `tests/property/helpers.property.test.ts` untuk helpers generator
    - **Property 12: Generator Health_Metric selalu menghasilkan nilai dalam rentang realistis**
    - **Validates: Requirements 5.2**
    - **Property 13: Generator posisi selalu menghasilkan pergeseran maksimal ±0.0005°**
    - **Validates: Requirements 5.3**
    - Konfigurasi `numRuns: 100` untuk setiap property
    - _Requirements: 5.2, 5.3_

  - [ ]* 5.2 Buat `tests/property/getHealthStatus.property.test.ts`
    - **Property 10 (logika): Fungsi getHealthStatus konsisten dengan threshold**
    - **Validates: Requirements 4.4, 4.5**
    - Test semua range threshold untuk heartRate, bodyTemperature, dan activityLevel
    - _Requirements: 4.4_

  - [ ]* 5.3 Buat `tests/property/formatTimestamp.property.test.ts`
    - **Property 11: Format timestamp selalu menghasilkan string HH:mm:ss**
    - **Validates: Requirements 4.6**
    - _Requirements: 4.6_

  - [ ]* 5.4 Buat `tests/property/getBehaviorResult.property.test.ts`
    - **Property 14: Fungsi getBehaviorResult selalu menghasilkan kategori sesuai aturan kombinasi metrik**
    - **Validates: Requirements 8.2, 8.5**
    - Test semua 6 kategori behavior beserta edge cases
    - _Requirements: 8.2, 8.5_

- [ ] 6. Implementasi custom hooks
  - [ ] 6.1 Buat `src/hooks/useHealthData.ts`
    - Terima parameter `initialMetric: HealthMetric` dan `historyData: HealthMetric[]`
    - Kelola state `currentMetrics` dan `metricsHistory` dengan `useState`
    - Expose fungsi `getMetricStatus` yang memanggil `getHealthStatus` dari helpers
    - Return `{ currentMetrics, metricsHistory, getMetricStatus, isLoading, error }`
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 6.2 Buat `src/hooks/useLocationData.ts`
    - Terima parameter `initialData: LocationData` dan `historyData: GeoPosition[]`
    - Kelola state `currentPosition` dan `positionHistory` dengan `useState`
    - Return `{ currentPosition, positionHistory, isLoading, error }`
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 6.3 Buat `src/hooks/useSimulator.ts`
    - Terima parameter `mockData: MockData`
    - Gunakan `useEffect` dengan dua `setInterval`: lokasi setiap 3 detik, kesehatan setiap 5 detik
    - Setiap tick lokasi: panggil `generateNextPosition()` → update `positionHistory` (max 20 item via `trimHistory`)
    - Setiap tick kesehatan: panggil `generateNextHealthMetric()` → update `metricsHistory` (max 50 item via `trimHistory`)
    - Implementasikan cycling array: ketika array posisi habis, kembali ke indeks 0
    - Cleanup: `clearInterval` di return function `useEffect`
    - Return `UseSimulatorReturn` (position, history, metrics, connectionStatus, isActive, timestamps)
    - _Requirements: 3.3, 3.8, 4.2, 5.1, 5.4, 5.5_

  - [ ]* 6.4 Buat `tests/unit/hooks/useSimulator.test.ts`
    - Test bahwa `clearInterval` dipanggil saat component unmount
    - Test bahwa lokasi diupdate setiap 3 detik dan kesehatan setiap 5 detik (gunakan `vi.useFakeTimers()`)
    - **Property 8: Simulator cycling kembali ke awal setelah array habis**
    - **Validates: Requirements 3.8**
    - _Requirements: 5.4, 5.5, 3.8_

- [ ] 7. Checkpoint kedua — validasi hooks
  - Pastikan semua hooks ter-compile tanpa error TypeScript
  - Pastikan `useSimulator` bisa di-import ke halaman index tanpa crash
  - Tanyakan jika ada pertanyaan sebelum lanjut ke komponen UI.

- [ ] 8. Komponen dasar dan layout
  - [ ] 8.1 Buat `src/components/dashboard/ErrorState.tsx`
    - Terima props `message: string` dan `onRetry: () => void`
    - Tampilkan pesan error dan tombol retry
    - _Requirements: 1.5_

  - [ ] 8.2 Buat `src/components/dashboard/DashboardHeader.tsx`
    - Tampilkan judul "What's ON MeOW" di header halaman
    - _Requirements: 7.5_

  - [ ] 8.3 Buat `src/components/dashboard/DashboardLayout.tsx`
    - Buat grid layout 2 kolom (kiri: peta, kanan: data kesehatan) dengan Tailwind CSS
    - Pastikan tidak ada horizontal overflow di lebar ≥ 1024px
    - _Requirements: 1.3, 7.1_

- [ ] 9. Komponen CatProfile
  - [ ] 9.1 Buat `src/components/dashboard/CatProfile.tsx`
    - Terima props `profile: CatProfile` dan `connectionStatus: ConnectionStatus`
    - Tampilkan foto kucing dari `photoUrl`; implementasikan `onError` pada `<img>` untuk fallback ke `cat-placeholder.png`
    - Tampilkan nama, ras, dan usia — gunakan optional chaining + nullish coalescing untuk placeholder
    - Tampilkan indikator warna status koneksi: hijau untuk "connected", merah/abu-abu untuk "disconnected"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 1.6_

  - [ ]* 9.2 Buat `tests/property/components/CatProfile.property.test.tsx`
    - **Property 1: Rendering field CatProfile bersifat lengkap**
    - **Validates: Requirements 1.1, 2.1, 2.3**
    - **Property 3: Placeholder selalu ditampilkan untuk field kosong atau null**
    - **Validates: Requirements 1.6, 2.2**
    - **Property 4: Indikator connectionStatus selalu mencerminkan nilai yang benar**
    - **Validates: Requirements 2.4**
    - _Requirements: 1.1, 1.6, 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Komponen HealthMonitor dan sub-komponen
  - [ ] 10.1 Buat `src/components/health/StatusBadge.tsx`
    - Terima props `status: HealthStatus` dan opsional `label?: string`
    - Render badge dengan warna berbeda: hijau (normal), kuning (warning), merah (critical)
    - _Requirements: 4.4, 4.5_

  - [ ] 10.2 Buat `src/components/health/MetricCard.tsx`
    - Terima props `label`, `value`, `unit`, `status`, `lastUpdated`
    - Tampilkan nilai metrik, unit, badge status, dan timestamp `lastUpdated`
    - Tampilkan latar merah + ikon ⚠ jika status adalah "critical"
    - _Requirements: 4.4, 4.5, 4.6_

  - [ ]* 10.3 Buat `tests/property/components/MetricCard.property.test.tsx`
    - **Property 10 (rendering): MetricCard selalu menampilkan tampilan sesuai status threshold**
    - **Validates: Requirements 4.4, 4.5**
    - _Requirements: 4.4, 4.5_

  - [ ] 10.4 Buat `src/components/health/HeartRateChart.tsx`
    - Terima props `data: Array<{ time: string; heartRate: number }>` dan `thresholds: HeartRateThresholds`
    - Render LineChart dari Recharts dengan data yang diberikan
    - Tampilkan pesan "Belum ada data riwayat" jika array kosong
    - _Requirements: 4.3_

  - [ ]* 10.5 Buat `tests/property/components/HeartRateChart.property.test.tsx`
    - **Property 9: HeartRateChart selalu menerima tepat 10 titik data terakhir**
    - **Validates: Requirements 4.3**
    - _Requirements: 4.3_

  - [ ] 10.6 Buat `src/components/health/HealthMonitor.tsx`
    - Terima props `currentMetrics: HealthMetric`, `metricsHistory: HealthMetric[]`, `lastUpdated: string`
    - Susun tiga `MetricCard` (heartRate, bodyTemperature, activityLevel) dan satu `HeartRateChart`
    - Slice 10 data terakhir dari `metricsHistory` untuk dikirim ke `HeartRateChart`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 10.7 Buat `src/components/dashboard/HealthSummaryCards.tsx`
    - Terima props `metrics: HealthMetric`
    - Tampilkan ringkasan 3 metrik (heartRate, bodyTemperature, activityLevel) dalam kartu ringkasan
    - _Requirements: 1.2_

  - [ ]* 10.8 Buat `tests/property/components/HealthSummaryCards.property.test.tsx`
    - **Property 2: Rendering HealthSummaryCards mencakup semua metrik**
    - **Validates: Requirements 1.2, 4.1**
    - _Requirements: 1.2, 4.1_

- [ ] 11. Komponen BehaviorDecoder
  - [ ] 11.1 Buat `src/components/dashboard/BehaviorDecoder.tsx`
    - Terima props `currentMetrics: HealthMetric` dan `catName: string`
    - Panggil `getBehaviorResult(currentMetrics, catName)` dari helpers
    - Tampilkan `BehaviorResult.label` dan `BehaviorResult.emoji` dalam kartu tersendiri
    - Tampilkan label "unknown" (`"Memantau kondisi {name}... 🔍"`) jika tidak ada kategori yang cocok
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Komponen LocationTracker dan MapView
  - [ ] 12.1 Buat `src/components/location/LiveIndicator.tsx`
    - Render animasi pulsing dot (CSS animation atau Tailwind `animate-ping`)
    - _Requirements: 3.6_

  - [ ] 12.2 Buat `src/components/location/MapView.tsx`
    - Terima props `center`, `currentPosition`, `positionHistory`, `safeZone`, `mapboxToken`
    - Inisialisasi Mapbox GL JS map dalam `useEffect` — target `<div ref={mapContainer}>`
    - Tambahkan marker untuk posisi terkini kucing
    - Tambahkan layer LineString sebagai path trail dari `positionHistory`
    - Tambahkan circle layer untuk `safeZone` jika tersedia
    - Implementasikan fallback UI (koordinat teks saja) jika token Mapbox tidak valid atau error
    - _Requirements: 3.1, 3.2, 3.4, 3.7_

  - [ ] 12.3 Buat `src/components/location/LocationTracker.tsx`
    - Terima props `currentPosition`, `positionHistory`, `safeZone`, `isSimulatorActive`
    - Render `MapView` dengan data yang diterima
    - Tampilkan koordinat latitude dan longitude sebagai teks di bawah peta
    - Tampilkan `LiveIndicator` saat `isSimulatorActive` bernilai true
    - Tampilkan `<p>Lokasi tidak tersedia</p>` jika `currentPosition` adalah null
    - _Requirements: 3.2, 3.5, 3.6_

  - [ ]* 12.4 Buat `tests/property/components/LocationTracker.property.test.tsx`
    - **Property 5: LocationTracker selalu menangani kondisi posisi ada/tidak**
    - **Validates: Requirements 3.2**
    - **Property 6: Path trail selalu dibatasi antara 0 dan 20 posisi**
    - **Validates: Requirements 3.4**
    - **Property 7: Koordinat posisi selalu ditampilkan sebagai teks numerik**
    - **Validates: Requirements 3.5**
    - _Requirements: 3.2, 3.4, 3.5_

- [ ] 13. Komponen loading state
  - [ ] 13.1 Buat skeleton loading untuk tiga area utama
    - Buat komponen skeleton untuk `CatProfile` (gambar + teks placeholder animasi)
    - Buat komponen skeleton untuk `LocationTracker` (placeholder area peta)
    - Buat komponen skeleton untuk `HealthMonitor` (placeholder kartu metrik)
    - _Requirements: 7.4_

- [ ] 14. Wiring semua komponen di halaman utama
  - [ ] 14.1 Buat `src/pages/_app.tsx` dengan global styles
    - Import global CSS Tailwind
    - Tambahkan CSS import Mapbox GL: `import 'mapbox-gl/dist/mapbox-gl.css'`
    - _Requirements: 7.3_

  - [ ] 14.2 Buat `src/pages/index.tsx` sebagai Dashboard utama
    - Import `mockData` dari data layer
    - Panggil `useSimulator(mockData)` untuk mendapatkan semua data simulasi
    - Tampilkan skeleton loading saat data belum siap (gunakan `isLoading` state)
    - Tampilkan `ErrorState` jika mock data gagal diimpor (cek dengan try/catch di `useEffect`)
    - Compose semua komponen: `DashboardHeader`, `CatProfile`, `LocationTracker`, `HealthMonitor`, `BehaviorDecoder`, `HealthSummaryCards`
    - Gunakan `DashboardLayout` untuk mengatur posisi komponen
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 5.1, 8.3, 8.4_

- [ ] 15. Checkpoint akhir — validasi keseluruhan
  - Pastikan semua tests pass dengan menjalankan `npm test`
  - Pastikan aplikasi bisa dijalankan dengan `npm run dev` tanpa error di console
  - Pastikan layout bekerja baik di lebar ≥ 1024px (desktop) dan ≥ 768px (tablet)
  - Tanyakan jika ada pertanyaan sebelum dianggap selesai.

---

## Notes

- Task bertanda `*` bersifat opsional dan bisa dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements untuk traceability
- Checkpoint memastikan validasi bertahap — jangan lewati checkpoint
- Property tests memvalidasi kebenaran universal; unit tests memvalidasi skenario spesifik
- Gunakan `npm test` (Vitest `--run`) untuk menjalankan semua test sekaligus tanpa watch mode
- Token Mapbox perlu disimpan di `.env.local` sebagai `NEXT_PUBLIC_MAPBOX_TOKEN`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["3.1", "3.3"] },
    { "id": 4, "tasks": ["3.2", "3.4"] },
    { "id": 5, "tasks": ["6.1", "6.2", "8.1", "8.2", "8.3"] },
    { "id": 6, "tasks": ["6.3", "9.1", "10.1", "11.1", "12.1", "13.1"] },
    { "id": 7, "tasks": ["5.1", "6.4", "9.2", "10.2", "10.4", "10.7", "12.2"] },
    { "id": 8, "tasks": ["5.2", "5.3", "5.4", "10.3", "10.5", "10.6", "10.8", "12.3"] },
    { "id": 9, "tasks": ["12.4", "14.1"] },
    { "id": 10, "tasks": ["14.2"] }
  ]
}
```
