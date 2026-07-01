# WEBSISWA INSAN CENDEKIA NUSANTARA
## Platform Pembelajaran Digital Interaktif

---

## 1. TENTANG PLATFORM

### 1.1 Apa Itu Websiswa ICN?

Websiswa Insan Cendekia Nusantara adalah platform pembelajaran digital berbasis web yang dirancang khusus untuk sekolah Insan Cendekia Nusantara. Platform ini memungkinkan guru membuat dan mengelola kuis online, sementara siswa dapat mengerjakannya secara real-time dengan fitur timer, penyimpanan jawaban otomatis, dan kesempatan retry.

### 1.2 Target Pengguna

| Pengguna | Peran |
|---------|-------|
| Guru | Membuat kuis, mengunggah materi, menilai essay |
| Siswa | Mengerjakankuis, mengunduh materi |
| Admin | Mengelola akun guru, memastikan sistem berjalan |

### 1.3 Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Database | Supabase PostgreSQL |
| Autentikasi | Supabase Auth |
| UI Komponen | shadcn/ui |
| Animasi | Framer Motion |

---

## 2. FITUR UTAMA

### 2.1 Sistem Akun

#### Autentikasi
- Login dengan username & password
- Role-based access: Guru ↔ Siswa
- Middleware proteksi route otomatis
- Session tersimpan di cookie

#### Manajemen Akun Siswa (Guru)
- Tambah/edit/hapus akun siswa
- Reset password ke default
- Aktif/nonaktif akun
- Ganti kelas siswa

### 2.2 Manajemen Mata Pelajaran

#### CRUD Mapel
- Guru buat/edit/hapus mata pelajaran
- Pilih kelas untuk mapel
- Deskripsi & info mapel
- Lihat siswa di kelas

#### Upload Materi
- Upload file (PDF/Word/Excel/langsung dari komputer)
- Link URL (YouTube/Google Drive/dokumen online)
- Tracking siapa yang sudah membuka materi

### 2.3 Sistem Kuis

#### Tipe Kuis
| Tipe | Cara Nilai |
|------|---------|
| Pilihan Ganda | Otomatis oleh sistem |
| Essay | Manual oleh guru |

#### Konfigurasi Kuis

| Pengaturan | Fungsi |
|----------|--------|
| Waktu (menit) | Timer countdown |
| Deadline | Batas akhir pengerjaan |
| Attempt Limits | Maksimal percobaan (1/2/3/unlimited |
| Attempt Limits kosong | Unlimited |

#### Attempt Limits

- Setiap submit = attempt baru
- Nilai final = **nilai tertinggi** semua percobaan
- Siswa lihat info "Percobaan ke-X (Tertinggi: Y"
- Guru bisa mengatur batas percobaan

#### Workflow Kuis

| Fase | Aksi Guru | Aksi Siswa |
|------|----------|----------|
| Draft | Tambah pertanyaan | - |
| Published | Publish ke siswa | Mengerjak |

#### Scoring Otomatis (Pilihan Ganda)
- Jawaban benar = 1, Salah = 0
- Total score = (benar/total) × 100

#### Grading Per-Soal (Essay)
- Guru input skor 0-100 per soal
- Sistem hitung rata-rata otomatis
- Skor per soal tersimpan di JSON

### 2.4 Fitur Siswa

#### Dashboard
- Statistik: Mapel, Materi, Kuis Aktif, Kuis Selesai
- Deadline mendekat

#### Akses Materi
- Download file
- Buka link eksternal
- Info guru pengampu

#### Pengerjaan Kuis

### 2.5 Timer Real-Time

- Timer hitung mundur
- Auto-submit saat waktu habis
- Penyimpanan jawaban otomatis (localStorage)
- Refresh browser tidak reset timer

### 2.6 Auto-Save Jawaban

- Simpan setiap 5 detik
- Refresh browser = jawaban tetap ada
- Timer lanjut dari posisi terakhir

### 2.7 Retry Kuis

#### Aturan Retry

| Tipe | Aturan |
|------|---------|
| Pilihan Ganda | Boleh kapan saja (selama attempt tersisa + belum deadline |
| Essay | Boleh SELAMA guru belum menilai attempt sebelumnya |
| Due date | Jika lewat = tidak boleh retry |

### 2.8 Sistem Notifikasi

#### Notifikasi Siswa

| Pemicu | Notifikasi |
|--------|----------|
| Guru upload materi | "Materi baru: [Judul]" |
| Guru publish kuis | "Kuis baru: [Judul]" |
| Guru nilai essay | "Nilai [Judul] keluar!" |
| Deadline <24 jam | "[Judul] deadline mendekat" |

#### Notifikasi Guru

| Pemicu | Notifikasi |
|--------|----------|
| Siswa submit essay | "Jawaban perlu dinilai: [Judul]" |

### 2.9 Animasi & UI

- Skeleton shimmer loading
- Form field dengan label mengambang
- Ilustrasi empty state
- Badge bounce notifikasi
- Progress bar gradient + shimmer
- Timer pulse warning
- Pull-to-refresh
- Sparkle saat submit
- Confetti untuk nilai bagus

---

## 3. PANDUAN PENGGUNA

### 3.1 Login

#### Langkah
1. Buka link websiswa
2. Masukkan username + password
3. Klik "Masuk"
4. Redirect otomatis sesuai role

#### Troubleshooting
| Masalah | Solusi |
|--------|--------|
| Akun tidak ditemukan | Hubungi admin |
| Password salah | Cek Caps Lock, coba lagi |
| Akun nonaktif | Hubungi admin |

---

### 3.2 Fitur Guru

#### Dashboard
- Statistik: Siswa, Mapel, Materi, Kuis
- Kuis perlu dinilai (essay)
- Deadline mendekat

#### Kelola Siswa
| Aksi | Langkah |
|-----|--------|
| Tambah | Menu Siswa → Tambah Siswa |
| Edit | Klik nama → Edit |
| Reset Password | Klik ikon kunci → Reset |
| Nonaktif | Toggle aktif/nonaktif |

#### Buat Mapel
1. Menu Mata Pelajaran
2. "Tambah Mapel"
3. Isi form
4. Simpan

#### Upload Materi
1. Buka mapel
2. Tab Materi
3. "Tambah Materi"
4. Pilih tipe: Upload file / Link URL
5. Simpan

**Tipe Upload:**
- File: Upload dari komputer
- URL: Masukkan link YouTube/Google Drive/lainnya

#### Buat Kuis
1. Buka mapel → Tab Kuis
2. "Buat Kuis Baru"

**Form Buat Kuis:**
| Field | Wajib | Keterangan |
|-------|--------|------------|
| Judul | Ya | Nama kuis |
| Tipe | Ya | Pilihan Ganda / Essay |
| Waktu | Tidak | Dalam menit |
| Attempt Limits | Tidak | 1/2/3/unlimited |
| Due Date | Tidak | Batas akhir |

**Setelah Publish:**
- Soal tidak bisa ditambah/dikurangi
- Kuis tidak bisa di-unpublish

#### Nilai Essay
1. Buka kuis Essay → Tab Hasil
2. Klik nama siswa
3. Input skor 0-100 per soal
4. Sistem hitung rata-rata otomatis
5. Klik "Simpan Nilai"

**Contoh:**
| Soal | Skor Input |
|-----|----------|
| Soal 1 | 80 |
| Soal 2 | 90 |
| Soal 3 | 70 |
| **Rata-rata | **80 |

---

### 3.3 Fitur Siswa

#### Dashboard
- Statistik: Mapel, Materi, Kuis Aktif, Kuis Selesai
- Deadline mendekat

#### Akses Materi
1. Menu Mata Pelajaran
2. Pilih mapel
3. Tab Materi

#### Mengerjakankuis
1. Pilih kuis dari daftar
2. Baca instruksi
3. Jawab pertanyaan

#### Navigasi Soal
- Klik "Simpan & Berikutnya" untuk lanjut
- Klik nomor soal di sidebar untuk lompat
- Jawaban otomatis tersimpan

#### Submit Kuis
- Klik "Kirim" di soal terakhir
- Konfirmasi jika ada soalbelum dijawab

#### Auto-Save
- Setiap 5 detik tersimpan
- Refresh browser = jawaban tetap ada
- Timer lanjut dari posisi terakhir

#### Retry Kuis
1. Selesai attempt pertama
2. Lihat halaman hasil
3. Klik "Kerjakan Ulang" jika masih ada attempt tersisa

---

## 4. TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Siswa tidak bisa login | Cek akun aktif/nonaktif |
| Kuis tidak muncul | Cek mapel & kelas |
| Timer reset | Normal (timer server-side) |
| Nilai PG tidak muncul | Langsung hitung otomatis |
| Nilai essay kosong | Guru belum menilai |
| Tombol retry tidak ada | Attempt habis / deadline lewat |

---

## 5. KONTAK

| Keperluan | Hubungi |
|----------|--------|
| Masalah teknis | Admin IT Sekolah |
| Reset akun | Guru/Wali kelas |
| Pertanyaan materi | Guru mapel |

---

*Terakhir diupdate: Juli 2026*
