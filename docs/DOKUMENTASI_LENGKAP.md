# WEBSISWA INSAN CENDEKIA NUSANTARA
## Platform Pembelajaran Digital Interaktif

---

# 1. TENTANG WEBSITE

## 1.1 Apa Itu Websiswa ICN?

Websiswa Insan Cendekia Nusantara adalah platform pembelajaran digital berbasis web yang dirancang khusus untuk sekolah Insan Cendekia Nusantara. Platform ini memungkinkan guru membuat dan mengelola kuis online, sementara siswa dapat mengerjakannya secara online dengan fitur auto-timer, auto-save, dan retry attempt.

## 1.2 Target Pengguna

| Pengguna | Peran |
|-----------|-------|
| Guru | Membuat kuis, upload materi, menilai essay |
| Siswa | Mengerjakankuis, download materi |
| Admin | Manajemenakun |

## 1.3 Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 15 + TypeScript + TailwindCSS |
| Database | Supabase PostgreSQL |
| Autentikasi | Supabase Auth |
| UI Components | shadcn/ui |
| Animasi | Framer Motion |

---

# 2. FITUR UTAMA

## 2.1 Autentikasi & Keamanan

### Login
- Login dengan username & password
- Role-based access (Guru/Siswa
- Redirect otomatis berdasarkan role
- Session management

### Route Protection
- Siswa hanya bisa akses `/siswa/*`
- Guru hanya bisa akses `/guru/*`
- Middleware proteksi semua route

## 2.2 Manajemen Siswa (Guru)

### Kelola Siswa
- Tambah/edit siswa
- Reset password
- Aktif/nonaktif akun
- Ganti kelas

### Fitur Keamanan
- Akun nonaktif = siswa tidak bisa login
- Password reset = password default

## 2.3 Mata Pelajaran (Guru)

### CRUD Mapel
- Buat mapel baru
- Pilih kelas untuk mapel
- Deskripsi & info mapel

### Upload Materi
- Upload file langsung (PDF, Word, Excel)
- Link URL eksternal (YouTube, Google Drive, dokumen)
- Tracking viewer (siapa sudah buka materi

## 2.4 Sistem Kuis

### Tipe Kuis

#### Pilihan Ganda
- Otomatis dinilai
- Nilai langsung keluar setelah submit
- Retry dengan highest score

#### Essay
- Dinilai manual oleh guru
- Skor per-soal (0-100)
- Rata-rata otomatis

### Pengaturan Kuis

| Pengaturan | Fungsi |
|-----------|--------|
| Waktu (menit) | Timer countdown |
| Deadline | Batas akhir pengerjaan |
| Attempt Limits | Maksimal percobaan (1/2/3/unlimited |
| Attempt Limits kosong | Unlimited |

### Attempt Limits

**Scoring Logic:**
- Setiap submit = attempt baru
- Nilai final = Highest score dari semua percobaan
- Siswa lihat info "Percobaan ke-X (Tertinggi: Y)

### Grading Per-Soal (Essay)

**Konsep:**
- Setiap soal dinilai terpisah
- Total score = Rata-rata dari semua soal
- Skor per soal disimpan di JSON

### Workflow Kuis

**SEBELUM Publish:**
- Boleh tambah pertanyaan
- Boleh hapus pertanyaan
- Boleh edit pertanyaan

**SETELAH Publish:**
- Tidak boleh tambah pertanyaan
- Tidak boleh hapus pertanyaan
- Boleh hapus kuis

## 2.5 Fitur Siswa

### Dashboard Siswa
- Statistik mapel, materi, kuis
- Mata pelajaran yang di-assign
- Deadline mendekat

### Mengerjakankuis
- Timer real-time
- Progress pills
- Sidebar map soal
- Validasi jawaban

### Auto-Save
- Jawaban tersimpan otomatis setiap 5 detik
- Tersimpan di localStorage
- Restore saat browser refresh

### Retry Kuis
- Retry dengan attempt yang tersisa
- Highest score tetap terjaga

## 2.6 Sistem Notifikasi

### Jenis Notifikasi

| Trigger | Untuk |
|---------|--------|
| Guru upload materi | Siswa di kelas |
| Guru publish kuis | Siswa di kelas |
| Guru nilai essay | Siswa terkait |
| Deadline <24 jam | Siswa |
| Siswa submit essay | Guru mapel |

### Fitur Notifikasi
- Bell icon dengan badge unread
- Mark as read
- Mark all read
- Link ke halaman terkait

---

# 3. FITUR TEKNIS

## 3.1 Timer Real-Time

### Karakteristik
- Timer berdasarkan timestamp server
- Tersimpan dengan jawaban
- Refresh browser = timer lanjut (tidak reset)
- Auto-submit saat waktu habis

### Auto-Save
- Simpan setiap 5 detik
- Tersimpan di localStorage
- Restore otomatis saat browser refresh

## 3.2 Progress Bar & Indikator

### Progress Bar
- Gradient fill dengan shimmer
- Warna berdasarkan progress
- Smooth animation

### Badge Bounce
- Animasi saat notifikasi baru
- Polling setiap 30 detik

---

# 4. PANDUAN PENGGUNA

## A. LOGIN

Buka link websiswa → Masukkan Username + Password

---

## B. FITUR SISWA

### Dashboard
- Statistik: Mapel, Materi, Kuis Aktif, Kuis Selesai
- Deadline mendekat

### Mata Pelajaran
- Akses mapel yang di-assign
- Download materi
- Info guru pengampu

### Mengerjakankuis
- Timer real-time
- Auto-save jawaban
- Progress tracking
- Submit langsung dapat nilai (PG)

### Retry Kuis
- Pilihan Ganda: Kapan saja (selama attempt tersisa)
- Essay: Selama guru BELUM menilai

---

## C. FITUR GURU

### Dashboard
- Statistik: Siswa, Mapel, Materi, Kuis
- Kuis perlu dinilai
- Deadline mendekat

### Kelola Siswa
- Tambah/edit/hapus siswa
- Reset password
- Aktif/nonaktif akun

### Buat Mapel & Kuis
- CRUD mapel
- CRUD kuis dengan pengaturan lengkap
- Publish kuis + kirim notifikasi

### Nilai Essay
- Input skor per-soal
- Rata-rata otomatis

---

# 5. PANDUAN TEKNIS

## 5.1 Setup Database

### Tabel Utama
- users
- kelas
- mata_pelajaran
- materi
- kuis
- pertanyaan_kuis
- hasil_kuis
- notifications
- materi_views

### Attempt Tracking
- hasil_kuis.attempt_number
- kuis.attempt_limits
- kuis.due_date
- kuis.waktu_menit

## 5.2 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 5.3 Deployment

Platform: Vercel
Domain: insancendekia.com

---

# 6. CHECKLIST SEBELUM LAUNCH

## Guru Wajib Dicek

- [ ] Semua siswa punya akun
- [ ] Test login semua akun siswa
- [ ] Test 1x kuis Pilihan Ganda (siswa)
- [ ] Test 1x kuis Essay (siswa)
- [ ] Test retry kuis
- [ ] Test timer habis (auto-submit)
- [ ] Test attempt limits enforcement
- [ ] Test upload materi
- [ ] Test notifikasi berfungsi
- [ ] Test deadline enforcement

## Admin Wajib Dicek

- [ ] Semua guru punya akun
- [ ] Server stabil
- [ ] Database ter-backup
- [ ] Monitoring aktif

---

# 7. TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Siswa tidak bisa login | Cek akun aktif/nonaktif |
| Kuis tidak muncul | Cek mapel & kelas |
| Timer reset | Normal - timer berdasarkan server |
| Nilai essay tidak muncul | Guru belum menilai |
| Retry tidak muncul | Attempt limits habis / deadline lewat |

---

# 8. KONTAK

| Keperluan | Hubungi |
|-----------|---------|
| Masalah teknis | Admin IT Sekolah |
| Pertanyaan materi | Guru mapel |
| Reset akun | Guru/Wali kelas |

---

Dokumen ini terakhir diupdate: Juli 2026
