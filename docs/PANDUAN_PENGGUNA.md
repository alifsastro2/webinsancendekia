# PANDUAN PENGGUNA WEBSISWA INSAN CENDEKIA NUSANTARA
## Panduan Lengkap untuk Siswa & Guru

---

# A. LOGIN

## Langkah Login

1. Buka link websiswa
2. Masukkan Username + Password
3. Klik tombol "Masuk"
4. Lihat dashboard sesuai role

---

# B. FITUR UNTUK SISWA

## B1. Dashboard

Di dashboard siswa, Anda melihat:
- Jumlah mata pelajaran
- Total materi
- Kuis aktif & selesai
- Deadline mendekat

## B2. Mata Pelajaran

### Akses Materi
1. Klik menu "Mata Pelajaran"
2. Pilih kelas/mapel yang tersedia
3. Tab **Materi**: Lihat & download file
4. Tab **Kuis**: Lihat daftar kuis

### Download Materi
- Klik "Buka Materi"
- File tersimpan otomatis

## B3. Mengerjakankuis

### Langkah Mengerjakankuis

1. **Buka kuis** dari daftar

2. **Baca soal** dengan teliti

3. **Jawab pertanyaan:**
   - **Pilihan Ganda:** Pilih A/B/C/D
   - **Essay:** Ketik di kolom teks

4. **Navigasi soal:**
   - Klik "Simpan & Berikutnya" untuk lanjut
   - Klik nomor soal di sidebar untuk lompat

5. **Submit kuis:**
   - Klik "Kirim" di soal TERAKHIR
   - Konfirmasi jika ada soalbelum dijawab

### B4. Timer (Waktu)

| Status | Warna | Artinya |
|--------|-------|---------|
| Normal | Abu-abu | Waktu cukup |
| <60 detik | Kuning + pulse | Percepat! |
| <10 detik | Merah + pulse cepat | Hampir habis! |
| 0:00 | Auto-submit | Sistem otomatis mengirim |

### B5. Auto-Save (Penyimpanan Otomatis)

- Jawaban tersimpan setiap **5 detik**
- Refresh browser = jawaban **tetap ada**
- Timer lanjut dari posisi terakhir

### B6. Retry Kuis (Coba Lagi)

#### Kapan boleh retry?

| Tipe Kuis | Aturan |
|------------|--------|
| Pilihan Ganda | Boleh kapan saja (selama ada attempt tersisa) |
| Essay | Boleh SELAMA guru BELUM menilai attempt sebelumnya |

#### Lihat Info Attempt

Di halaman hasil, Anda melihat:
- Percobaan ke-X dari Y
- Sisa attempt
- Nilai tertinggi

#### Tombol Retry

| Kondisi | Tampilan |
|----------|---------|
| Boleh retry | Tombol hijau "Kerjakan Ulang (X tersisa) |
| Semua terpakai | "Semua Attempt Sudah Digunakan" |
| Deadline lewat | "Batas Waktu Sudah Habis" |

---

# C. FITUR UNTUK GURU

## C1. Dashboard

Di dashboard guru, statistik:
- Total siswa
- Mata pelajaran aktif
- Kuis perlu dinilai
- Deadline mendekat

## C2. Kelola Siswa

### Aksi Siswa

| Aksi | Langkah |
|------|---------|
| Tambah | Menu Siswa → Tambah Siswa |
| Edit | Klik nama siswa → Edit |
| Reset Password | Klik icon 🔑 |
| Nonaktifkan | Toggle aktif/nonaktif |

### Catatan
- Siswa nonaktif **tidak bisa login**
- Password reset = password default

## C3. Mata Pelajaran

### Buat Mapel Baru

1. Menu Mata Pelajaran
2. "Tambah Mapel"
3. Isi nama & pilih kelas
4. Simpan

## C4. Upload Materi

### Langkah Upload

1. Buka mapel terkait
2. Tab **Materi**
3. "Tambah Materi"
4. Pilih tipe:

| Tipe | Input |
|------|--------|
| Upload File | Pilih file dari komputer |
| Link URL | Masukkan link eksternal |

### Format Didukung
- PDF, Word, Excel
- YouTube, Google Drive

### Fitur Tracking
- Sistem otomatis track siapa yang sudah buka materi

## C5. Buat Kuis

### Langkah Buat Kuis

1. Buka **mapel** → Tab **Kuis**
2. Klik **Buat Kuis Baru**
3. Isi informasi kuis

### Pengaturan Kuis

| Field | Wajib? | Keterangan |
|-------|---------|------------|
| Judul | Ya | Nama kuis |
| Tipe | Ya | Pilihan Ganda / Essay |
| Waktu | Tidak | Menit |
| Deadline | Tidak | Batas akhir |
| Attempt Limits | Tidak | 1/2/3/unlimited |

### Tambah Pertanyaan

**HANYA SEBELUM publish kuis:**
- Klik "Tambah Pertanyaan"
- Isi pertanyaan + jawaban benar
- Simpan

### Publish Kuis

**Klik "Terbitkan" saat siap:**
- Setelah publish, soal **tidak bisa diubah**
- Notifikasi otomatis ke siswa di kelas

## C6. Nilai Essay

### Langkah Menilai

1. Buka **kuis Essay**
2. Tab **Hasil**
3. Klik nama siswa
4. Input skor **0-100** per soal
5. Sistem otomatis hitung rata-rata
6. Klik "Simpan Nilai"
7. Siswa dapat notifikasi

---

# D. FITUR TEKNIS

## D1. Notifikasi

### Notifikasi Siswa

| Trigger | Notifikasi |
|---------|-----------|
| Guru upload materi | "Materi baru" |
| Guru publish kuis | "Kuis baru" |
| Guru nilai essay | "Nilai keluar" |
| Deadline <24 jam | "Deadline mendekat" |
| Timer habis | Auto-submit |

### Notifikasi Guru

| Trigger | Notifikasi |
|---------|-----------|
| Siswa submit essay | "Perlu dinilai" |

## D2. Attempt Limits

### Logic Scoring

- Attempt baru = Submit baru
- Nilai final = Highest score
- Siswa lihat "Percobaan ke-X (Tertinggi: Y"

---

# E. TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Tidak bisa login | Hubungi guru/admin |
| Jawaban hilang | Auto-save sudah aktif |
| Timer reset | Normal (timer server-side) |
| Nilai PG tidak muncul | Langsung hitung otomatis |
| Nilai essay tidak ada | Guru belum menilai |
| Retry tidak muncul | Attempt habis / deadline lewat |
| Error sistem | Screenshot + hubungi admin |

---

# F. KONTAK

| Keperluan | Hubungi |
|-----------|---------|
| Masalah teknis | Admin IT Sekolah |
| Reset akun | Guru/Wali kelas |
| Pertanyaan materi | Guru mapel |

---

Panduan ini terakhir diupdate: **Juli 2026**

---

## WEBSISWA INSAN CENDEKIA NUSANTARA
### Platform Pembelajaran Digital Interaktif
