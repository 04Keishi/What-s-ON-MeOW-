# Requirements Document

## Introduction

**What's ON MeOW** adalah aplikasi web dashboard yang mensimulasikan integrasi dengan kalung pintar kucing (*smart cat collar*). Aplikasi ini dibangun untuk hackathon **#HackTheKitty** dengan tema positif untuk kucing, pemilik kucing, dan komunitas kucing.

Aplikasi memberikan pengalaman memantau kondisi kucing secara real-time melalui dua fitur utama:
1. **Pelacakan Lokasi Kucing** — menampilkan posisi kucing di peta secara simulasi real-time
2. **Pemantauan Kesehatan Kucing** — menampilkan data kesehatan seperti detak jantung, aktivitas, dan suhu tubuh

Semua data bersumber dari mock data JSON yang disimulasikan tanpa perangkat keras fisik. Aplikasi dibangun dengan Next.js (Pages Router), TypeScript, Tailwind CSS, shadcn/ui, Mapbox, dan Recharts/Chart.js.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan ringkasan data lokasi dan kesehatan kucing.
- **Smart_Collar**: Representasi virtual kalung pintar kucing yang menjadi sumber data simulasi.
- **Location_Tracker**: Komponen sistem yang mengelola dan menampilkan data lokasi kucing di peta.
- **Health_Monitor**: Komponen sistem yang mengelola dan menampilkan data kesehatan kucing.
- **Mock_Data**: Data JSON statis yang disimulasikan sebagai sumber data dari Smart_Collar.
- **Simulator**: Mekanisme frontend (menggunakan `setInterval`) yang mensimulasikan pembaruan data real-time dari Mock_Data.
- **Cat_Profile**: Data identitas kucing yang mencakup nama, foto, ras, usia, dan status koneksi collar.
- **Health_Metric**: Satuan data kesehatan tunggal yang terdiri dari detak jantung, suhu tubuh, atau level aktivitas.
- **Status_Indicator**: Elemen visual yang menunjukkan kondisi kesehatan kucing (Normal, Waspada, Kritis).
- **Behavior_Decoder**: Fitur yang menganalisis kombinasi Health_Metric (detak jantung, suhu tubuh, level aktivitas) untuk menghasilkan label perilaku kucing yang mudah dipahami.
- **Behavior_Label**: Teks deskriptif hasil Behavior_Decoder yang menggambarkan kondisi atau perilaku kucing saat ini (contoh: "Sedang beristirahat", "Aktif bermain", "Mungkin stres").
- **Pemilik_Kucing**: Pengguna akhir aplikasi yang menggunakan dashboard untuk memantau kucing miliknya.

---

## Requirements

### Requirement 1: Tampilan Dashboard Utama

**User Story:** Sebagai Pemilik_Kucing, saya ingin melihat semua informasi penting kucing saya dalam satu halaman, agar saya dapat memantau kondisi kucing dengan cepat tanpa berpindah halaman.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan nama kucing, foto profil, ras, dan usia dari Cat_Profile di bagian atas halaman.
2. THE Dashboard SHALL menampilkan ringkasan Health_Metric terkini (detak jantung, suhu tubuh, level aktivitas) dalam kartu-kartu ringkasan yang terpisah.
3. WHEN halaman Dashboard dimuat pada viewport desktop (lebar ≥ 1024px), THE Dashboard SHALL menampilkan komponen Location_Tracker dan Health_Monitor secara bersamaan tanpa horizontal scrolling.
4. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan data awal dari Mock_Data dalam waktu kurang dari 3 detik.
5. IF Mock_Data gagal dimuat, THEN THE Dashboard SHALL menampilkan pesan kesalahan yang menyebutkan bahwa Mock_Data gagal dimuat dan menyediakan tombol retry kepada Pemilik_Kucing.
6. IF data Cat_Profile memiliki field name, breed, atau age yang kosong atau null, THEN THE Dashboard SHALL menampilkan teks placeholder (misalnya "Nama tidak tersedia") pada field yang bersangkutan.

---

### Requirement 2: Profil Kucing

**User Story:** Sebagai Pemilik_Kucing, saya ingin melihat identitas kucing saya, agar saya tahu profil kucing yang sedang dipantau.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan nama kucing dari field `name` pada Cat_Profile.
2. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan foto kucing dari field `photoUrl` pada Cat_Profile; IF `photoUrl` kosong, null, atau gagal dimuat, THEN THE Dashboard SHALL menampilkan gambar placeholder kucing.
3. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan ras dari field `breed` dan usia dalam satuan tahun dari field `age` pada Cat_Profile.
4. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan label teks dan indikator warna berbeda untuk status koneksi Smart_Collar berdasarkan field `connectionStatus` pada Mock_Data (Terhubung = warna hijau, Terputus = warna merah/abu-abu).
5. WHEN Simulator memperbarui data dan nilai `connectionStatus` berubah, THE Dashboard SHALL memperbarui tampilan status koneksi Smart_Collar secara real-time tanpa reload halaman.

---

### Requirement 3: Pelacakan Lokasi Kucing Real-Time (Simulasi)

**User Story:** Sebagai Pemilik_Kucing, saya ingin melihat posisi kucing saya di peta secara real-time, agar saya tahu keberadaan kucing saya saat ini.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Location_Tracker SHALL menampilkan peta interaktif menggunakan Mapbox yang terpusat pada posisi awal kucing dari Mock_Data.
2. WHEN halaman Dashboard dimuat dan data posisi tersedia, THE Location_Tracker SHALL menampilkan penanda (*marker*) di peta pada koordinat kucing terkini; IF data posisi tidak tersedia, THEN THE Location_Tracker SHALL menampilkan pesan "Lokasi tidak tersedia" di area peta.
3. WHEN Simulator aktif, THE Location_Tracker SHALL memperbarui posisi penanda di peta setiap 3 detik menggunakan data dari Mock_Data.
4. THE Location_Tracker SHALL menampilkan jalur pergerakan kucing (*path trail*) dari minimal 5 dan maksimal 20 posisi terakhir di peta.
5. THE Location_Tracker SHALL menampilkan koordinat lintang (*latitude*) dan bujur (*longitude*) kucing secara teks di bawah peta.
6. WHILE Simulator aktif, THE Location_Tracker SHALL menampilkan elemen animasi yang bergerak atau berdenyut sebagai indikator visual bahwa pembaruan lokasi sedang berjalan.
7. WHERE fitur *safe zone* diaktifkan, THE Location_Tracker SHALL menampilkan area radius aman yang bersumber dari field `safeZone.radius` dan `safeZone.center` pada Mock_Data di sekitar titik rumah pada peta.
8. WHEN array posisi pada Mock_Data telah habis, THE Simulator SHALL mengulang (*cycle*) dari posisi pertama pada array untuk menjaga simulasi tetap berjalan.

---

### Requirement 4: Pemantauan Kesehatan Kucing Real-Time (Simulasi)

**User Story:** Sebagai Pemilik_Kucing, saya ingin melihat data kesehatan kucing saya secara real-time, agar saya dapat mendeteksi kondisi abnormal dan segera mengambil tindakan.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Health_Monitor SHALL menampilkan nilai Health_Metric terkini (detak jantung dalam bpm, suhu tubuh dalam °C, level aktivitas) dari Mock_Data.
2. WHEN Simulator aktif, THE Health_Monitor SHALL memperbarui nilai setiap Health_Metric setiap 5 detik menggunakan data dari Mock_Data.
3. WHEN Simulator memperbarui data, THE Health_Monitor SHALL menampilkan grafik riwayat detak jantung dengan minimal 10 titik data terakhir menggunakan Recharts atau Chart.js.
4. THE Health_Monitor SHALL menampilkan Status_Indicator untuk setiap Health_Metric berdasarkan ambang batas berikut:
   - Detak jantung: Normal (100–180 bpm), Waspada (80–99 atau 181–220 bpm), Kritis (di bawah 80 atau di atas 220 bpm)
   - Suhu tubuh: Normal (38,0–39,5 °C), Waspada (37,5–37,9 atau 39,6–40,0 °C), Kritis (di bawah 37,5 atau di atas 40,0 °C)
   - Level aktivitas: `0–33` = Istirahat, `34–66` = Berjalan, `67–100` = Berlari
5. WHEN nilai Health_Metric memasuki status Kritis, THE Health_Monitor SHALL menampilkan latar belakang berwarna merah dan ikon peringatan (⚠) pada kartu metrik yang bersangkutan.
6. THE Health_Monitor SHALL menampilkan waktu terakhir data diperbarui dalam format `HH:mm:ss` pada setiap kartu Health_Metric.

---

### Requirement 5: Simulasi Data Real-Time

**User Story:** Sebagai Pemilik_Kucing, saya ingin data kucing terbarui secara otomatis, agar pengalaman memantau terasa seperti menggunakan perangkat nyata.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Simulator SHALL mulai berjalan secara otomatis tanpa memerlukan interaksi dari Pemilik_Kucing.
2. THE Simulator SHALL menghasilkan nilai Health_Metric baru dengan variasi acak dalam rentang realistis yang tidak melampaui batas threshold Kritis pada Requirement 4 kecuali disengaja untuk demo alert.
3. THE Simulator SHALL menghasilkan koordinat lokasi baru dengan pergeseran acak maksimal ±0.0005° pada latitude dan longitude dari posisi sebelumnya untuk mensimulasikan pergerakan kucing.
4. WHEN Pemilik_Kucing menutup atau meninggalkan halaman Dashboard, THE Simulator SHALL membersihkan semua interval (`clearInterval`) untuk mencegah kebocoran memori (*memory leak*).
5. THE Simulator SHALL memperbarui data lokasi setiap 3 detik dan data kesehatan setiap 5 detik secara independen satu sama lain.

---

### Requirement 6: Struktur Mock Data

**User Story:** Sebagai Developer, saya ingin mock data tersentralisasi dan terstruktur dengan baik, agar simulasi konsisten dan mudah dipelihara.

#### Acceptance Criteria

1. THE Mock_Data SHALL menyimpan data Cat_Profile yang mencakup: `id` (string), `name` (string), `breed` (string), `age` (number, dalam tahun), `photoUrl` (string URL atau string kosong), `connectionStatus` ("connected" | "disconnected").
2. THE Mock_Data SHALL menyimpan data lokasi awal yang mencakup: `latitude` (number), `longitude` (number), `timestamp` (string format ISO 8601).
3. THE Mock_Data SHALL menyimpan data Health_Metric awal yang mencakup: `heartRate` (number, bpm), `bodyTemperature` (number, °C), `activityLevel` (number, 0–100), `timestamp` (string format ISO 8601).
4. THE Mock_Data SHALL menyimpan array riwayat lokasi minimal 10 titik koordinat untuk inisialisasi jalur pergerakan awal.
5. THE Mock_Data SHALL menyimpan array riwayat Health_Metric minimal 10 titik data untuk inisialisasi grafik riwayat awal.
6. THE Mock_Data SHALL menyimpan data `safeZone` yang mencakup: `center` ({ latitude, longitude }) dan `radius` (number, dalam meter).
7. THE Mock_Data SHALL menggunakan format JSON yang valid dan dapat diimpor langsung sebagai modul TypeScript dengan tipe yang didefinisikan eksplisit.

---

### Requirement 8: Behavior Decoder

**User Story:** Sebagai Pemilik_Kucing, saya ingin sistem mendeteksi dan menampilkan perilaku kucing saya secara otomatis, agar saya dapat memahami kondisi kucing tanpa harus menginterpretasikan angka-angka sendiri.

#### Acceptance Criteria

1. WHEN Simulator memperbarui Health_Metric, THE Behavior_Decoder SHALL menganalisis kombinasi nilai `heartRate`, `bodyTemperature`, dan `activityLevel` terkini dan menghasilkan satu Behavior_Label.
2. THE Behavior_Decoder SHALL menghasilkan Behavior_Label berdasarkan aturan kombinasi berikut:
   - `activityLevel` 0–33 AND `heartRate` 100–180 AND `bodyTemperature` 38.0–39.5 → "Mochi sedang beristirahat dengan tenang 😴"
   - `activityLevel` 34–66 AND `heartRate` 100–180 AND `bodyTemperature` 38.0–39.5 → "Mochi sedang berjalan-jalan 🐾"
   - `activityLevel` 67–100 AND `heartRate` 100–220 AND `bodyTemperature` 38.0–40.0 → "Mochi sedang aktif bermain! 🏃"
   - `activityLevel` 0–33 AND (`heartRate` > 180 OR `bodyTemperature` > 39.5) → "Mochi mungkin sedang stres atau tidak nyaman ⚠️"
   - `activityLevel` 0–20 AND `heartRate` < 100 AND `bodyTemperature` < 38.0 → "Mochi sepertinya lemas, perlu perhatian! 🚨"
   - Kondisi lain yang tidak masuk kategori di atas → "Memantau kondisi Mochi... 🔍"
3. THE Dashboard SHALL menampilkan Behavior_Label terkini dalam kartu tersendiri yang terlihat jelas di halaman Dashboard.
4. WHEN Behavior_Label berubah dari satu pembaruan ke pembaruan berikutnya, THE Dashboard SHALL memperbarui tampilan Behavior_Label tanpa reload halaman.
5. THE Behavior_Decoder SHALL menggunakan nama kucing dari Cat_Profile (`name`) pada Behavior_Label sehingga label bersifat personal (bukan teks generik).

---

### Requirement 7: Antarmuka Pengguna yang Responsif

**User Story:** Sebagai Pemilik_Kucing, saya ingin tampilan dashboard yang menarik dan mudah digunakan, agar pengalaman memantau kucing terasa nyaman di berbagai perangkat.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan layout tanpa horizontal overflow pada layar berukuran desktop (lebar ≥ 1024px) dan tablet (lebar ≥ 768px).
2. THE Dashboard SHALL menggunakan palet warna warm/neutral yang konsisten (misalnya warna krem, oranye muda, atau coklat hangat) yang sesuai dengan tema kucing, menggunakan token warna dari sistem shadcn/ui.
3. THE Dashboard SHALL menggunakan komponen dari shadcn/ui dan Tailwind CSS sebagai dasar gaya antarmuka.
4. WHEN data sedang dimuat (*loading*), THE Dashboard SHALL menampilkan skeleton loading pada area Cat_Profile, Location_Tracker, dan Health_Monitor yang menunggu data.
5. THE Dashboard SHALL menampilkan nama proyek "What's ON MeOW" pada bagian header halaman.
