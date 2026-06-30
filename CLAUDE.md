# Progress Pembuatan Website Sekolah Online

## Project Setup

- **Tech Stack**: Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Framer Motion + Supabase
- **Database**: Supabase PostgreSQL
- **Created**: 2026-06-23

---

## ✅ Progress Checklist

- [x] Setup Next.js + TypeScript + TailwindCSS project
- [x] Install & setup Supabase client
- [x] Install shadcn/ui components
- [x] Setup Framer Motion untuk animasi
- [x] Upgrade color scheme dengan bold gradients (okalpha.co style)
- [x] Buat animated background components
- [x] Buat database schema di Supabase
- [x] Buat RLS policies untuk security
- [x] Integrasi logo sekolah
- [x] Buat halaman login dengan animasi
- [x] Implementasi autentikasi Supabase
- [x] Buat dashboard Guru
- [x] Buat dashboard siswa
- [x] Implementasi fitur kelola siswa (CRUD)
- [x] Implementasi fitur mata pelajaran
- [x] Implementasi fitur materi
- [x] Implementasi fitur kuis (pilihan ganda & essay)
- [x] Buat profil page untuk guru & siswa
- [x] Script pembuatan akun guru test (Azka Muhamad Naufal)
- [x] Buat setup instructions & quickstart guide
- [x] **Middleware.ts untuk route protection (auth + RBAC)**
- [x] **Fitur Notifikasi (Bell icon + dropdown)**
- [x] **Attempt Limits untuk Kuis**
- [x] **Highest Score Logic untuk retry kuis**

---

## 🛡️ Route Protection (Middleware)

Project menggunakan `middleware.ts` untuk security:

| Fitur | Penjelasan |
|-------|------------|
| **Authentication Check** | Cek user sudah login via Supabase session cookie |
| **Role-Based Access** | Guru hanya bisa akses `/guru/*`, Siswa hanya bisa akses `/siswa/*` |
| **Auto Redirect** | User belum login → redirect ke `/login?redirect=<path>` |
| **Session Refresh** | Auto refresh token jika expired |

### Protected Routes:
- `/guru/*` → Hanya untuk role `guru`
- `/siswa/*` → Hanya untuk role `siswa`

### Public Routes:
- `/login` → Semua orang
- `/register` → Semua orang

### File:
- `middleware.ts` → Route protection utama
- `src/lib/supabase/middleware.ts` → Supabase SSR helper

---

## 🔔 Sistem Notifikasi

### Fitur
- **Bell Icon** di header dengan badge angka unread
- **Dropdown list** dengan semua notifikasi
- **Mark as read** saat klik notifikasi
- **Mark all as read** button
- **Link navigasi** ke halaman terkait

### Jenis Notifikasi

| Type | Trigger | Untuk | Halaman Tujuan |
|------|---------|-------|----------------|
| `quiz_published` | Guru menerbitkan kuis | Siswa di kelas itu | `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]` |
| `materi_published` | Guru upload materi | Siswa di kelas itu | `/siswa/matapelajaran/[mapelId]` |
| `quiz_graded` | Guru menyimpan nilai essay | Siswa terkait | `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]/review` |
| `quiz_deadline_soon` | Auto-check saat load (siswa) | Siswa | `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]` |

### Komponen
- `src/components/common/notification-bell.tsx` - Bell icon + dropdown
- Tabel `notifications` di database

### Database Schema
```sql
notifications (
  id, user_id, type, title, message, link, is_read, created_at
)
```

---

## 📝 Kuis Workflow

### Aturan Setelah Kuis Published
| Aksi | Status |
|------|--------|
| Tambah Pertanyaan | ❌ Disabled |
| Hapus Pertanyaan | ❌ Disabled |
| Hapus Kuis | ✅ Allowed |

### Attempt Limits (Batasan Pengerjaan)

**Opsi:**
- `NULL` / kosong = Unlimited
- `1` = Maksimal 1 kali
- `2` = Maksimal 2 kali
- `3` = Maksimal 3 kali

**Scoring Logic:**
- Setiap submit = attempt baru
- Nilai yang direcord = **nilai tertinggi** dari semua percobaan
- Siswa bisa lihat info "Percobaan ke-X (Tertinggi: Y)"

### Database Columns
```sql
-- Di tabel kuis
attempt_limits INTEGER -- NULL = unlimited

-- Di tabel hasil_kuis
attempt_number INTEGER -- urutan percobaan
```

---

## 📁 File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Halaman login dengan animasi
│   ├── guru/
│   │   ├── page.tsx                # Dashboard Guru
│   │   ├── layout.tsx              # Layout Guru
│   │   ├── siswa/page.tsx          # Kelola siswa (CRUD)
│   │   ├── settings/page.tsx       # Settings guru
│   │   ├── matapelajaran/
│   │   │   ├── page.tsx            # Daftar mapel
│   │   │   ├── [id]/page.tsx       # Detail mapel (materi + daftar kuis)
│   │   │   └── [id]/kuis/
│   │   │       ├── page.tsx        # Kelola semua kuis
│   │   │       └── [kuisId]/page.tsx # Kelola 1 kuis + review hasil + nilai essay
│   │   └── profil/page.tsx         # Profil guru
│   ├── siswa/
│   │   ├── page.tsx                # Dashboard siswa
│   │   ├── layout.tsx              # Layout siswa
│   │   ├── kuis/page.tsx           # Daftar kuis + riwayat
│   │   ├── matapelajaran/
│   │   │   ├── page.tsx            # Daftar mapel
│   │   │   └── [mapelId]/
│   │   │       ├── page.tsx        # Detail mapel + materi/kuis
│   │   │       └── kuis/[kuisId]/page.tsx # Kerjakan kuis (satu-satu)
│   │   └── profil/page.tsx         # Profil siswa
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page (redirect)
├── components/
│   ├── auth/
│   ├── common/
│   │   ├── logo.tsx                # Logo component
│   │   ├── motion.tsx              # Framer Motion variants
│   │   ├── header.tsx              # Header dengan user menu + notification bell
│   │   ├── notification-bell.tsx    # Bell icon notification component
│   │   └── timer.tsx               # Timer component
│   ├── guru/
│   │   └── sidebar.tsx             # Sidebar guru
│   ├── siswa/
│   │   └── sidebar.tsx             # Sidebar siswa
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── supabase/
│   │   └── middleware.ts           # Supabase SSR helper untuk middleware
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Utility functions
└── styles/
    └── globals.css                 # Global styles

middleware.ts                        # Route protection (auth + RBAC)

scripts/
├── create-guru.js                  # Script buat akun guru
└── create-siswa-test.js            # Script buat akun siswa test

supabase/
├── schema.sql                      # Database schema
└── rls.sql                         # Row Level Security policies
```

---

## 🎨 Theme Colors

```css
Primary:     #3b82f6 (Blue 500)
Secondary:   #a855f7 (Purple 500)
Accent:      #14b8a6 (Teal 500)
Danger:      #ef4444 (Red 500)
```

---

## 📦 Dependencies Installed

### Core
- `next`, `react`, `react-dom` - Next.js & React
- `typescript`, `@types/*` - TypeScript support
- `tailwindcss`, `@tailwindcss/postcss` - Styling

### Supabase
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Auth helpers

### UI & Animation
- `framer-motion` - Animasi
- `lucide-react` - Icons
- `shadcn/ui` (via @radix-ui/*) - UI components

### Forms & Validation
- `react-hook-form`, `@hookform/resolvers`, `zod` - Form handling
- `clsx`, `tailwind-merge`, `class-variance-authority` - Utilities

### State Management
- `zustand` - State management (optional use)

---

## 🎯 Fitur yang Sudah Dibuat

### Autentikasi & Authorization
- ✅ Login dengan username & password
- ✅ Role-based routing (guru/siswa)
- ✅ Session management dengan Supabase Auth
- ✅ Logout functionality

### Dashboard Guru
- ✅ Overview statistik (siswa, mapel, materi, kuis)
- ✅ Kelola siswa (Create, Read, Update, Delete)
- ✅ Reset password siswa
- ✅ Aktif/Nonaktifkan akun siswa
- ✅ Ganti kelas siswa
- ✅ Edit profil sendiri

### Mata Pelajaran (Guru)
- ✅ Buat mata pelajaran baru
- ✅ Pilih kelas untuk mata pelajaran
- ✅ Edit & hapus mata pelajaran
- ✅ Upload materi (link file)
- ✅ Kelola materi

### Kuis (Guru)
- ✅ Buat kuis pilihan ganda & essay
- ✅ Set waktu kuis (opsional)
- ✅ Set batas akhir (deadline) kuis
- ✅ Set batasan percobaan (attempt limits)
- ✅ Tambah pertanyaan (hanya sebelum publish)
- ✅ Hapus pertanyaan (hanya sebelum publish)
- ✅ Hapus kuis
- ✅ Terbitkan kuis + kirim notifikasi
- ✅ Lihat semua hasil siswa per kuis
- ✅ Review jawaban (pilihan ganda otomatis, essay manual)
- ✅ Input & simpan nilai essay (0-100)
- ✅ Statistik rata-rata nilai

### Dashboard Siswa
- ✅ Overview statistik (mapel, materi, kuis)
- ✅ Daftar mata pelajaran (hanya kelas siswa)
- ✅ Lihat materi & download file
- ✅ Daftar kuis tersedia & riwayat pengerjaan

### Kuis (Siswa)
- ✅ Kerjakan kuis pilihan ganda & essay
- ✅ Timer + auto-submit saat waktu habis
- ✅ Soal tampil satu-satu dengan navigasi Sebelumnya/Berikutnya
- ✅ Progress pills & sidebar map soal
- ✅ Validasi & konfirmasi jika ada soal belum dijawab
- ✅ Submit jawaban & lihat skor (pilihan ganda)
- ✅ Attempt limits (bisa retry dengan nilai tertinggi)

### Notifikasi
- ✅ Bell icon di header dengan badge unread
- ✅ Dropdown list notifikasi
- ✅ Notifikasi saat guru publish kuis
- ✅ Notifikasi saat guru upload materi
- ✅ Notifikasi saat guru nilai essay
- ✅ Notifikasi deadline < 24 jam (auto-check)
- ✅ Mark as read on click
- ✅ Mark all as read

### Profil
- ✅ Edit nama, username, email
- ✅ Ubah password
- ✅ Lihat info akun

---

## 🚀 Cara Menjalankan Project

### 1. Setup Database Supabase (ONE TIME)

**Buka Supabase Dashboard:** https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq/sql

**Step 1 - Jalankan Schema:**
1. SQL Editor → New Query
2. Copy semua isi dari `supabase/schema.sql`
3. Click Run

**Step 2 - Jalankan RLS Policies:**
1. SQL Editor → New Query
2. Copy semua isi dari `supabase/rls.sql`
3. Click Run

**Step 3 - Tambah Kolom untuk Fitur Baru:**
```sql
-- Attempt limits
ALTER TABLE kuis ADD COLUMN IF NOT EXISTS attempt_limits INTEGER DEFAULT NULL;
ALTER TABLE hasil_kuis ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_hasil_kuis_siswa_kuis ON hasil_kuis(siswa_id, kuis_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_update_own_notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
```

### 2. Buat Akun Guru Test

```bash
node scripts/create-guru.js
```

**Credential:**
- Username: `azka`
- Password: `Azka123456`

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000/login

---

## 🎨 Design Updates (Latest)

### Color Palette (okalpha.co inspired)
```css
Primary:     #ff1f25 (Red 500)
Secondary:   #ff6b35 (Orange 500)
Accent:      #f7c548 (Yellow 500)
Tertiary:    #00d4ff (Cyan 500)
Purple:      #8b5cf6 (Purple 500)
```

### Animations Added
- ✅ Animated gradient backgrounds
- ✅ Floating blobs with blur effect
- ✅ Particle systems
- ✅ Wave animations
- ✅ Glassmorphism effects
- ✅ Neon text & borders
- ✅ Shimmer button effects
- ✅ Wavy text animation
- ✅ Ripple click effects
- ✅ Gradient text
- ✅ 3D card hover effects

### Components
- `AnimatedBackground` - Multi-variant animated background
- `GradientText` - Gradient text animation
- `GlassCard` - Glassmorphism card component
- `ShimmerButton` - Button with shimmer effect
- `NotificationBell` - Bell icon with notification dropdown

---

## 📁 Setup Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema (tables, indexes, triggers) |
| `supabase/rls.sql` | Row Level Security policies |
| `scripts/create-guru.js` | Create test teacher account |
| `scripts/create-siswa-test.js` | Create test student accounts |
| `scripts/supabase-exec.js` | Execute SQL via Management API |
| `scripts/setup-database-v2.js` | Display setup instructions |
| `SETUP_DATABASE.md` | Detailed setup guide |
| `SETUP_QUICKSTART.md` | Quick reference guide |

---

## 📝 Catatan Penting

### Logo Sekolah
- Logo bisa ditaruh di `public/images/logo.png`
- Jika tidak ada, akan menggunakan icon fallback

### Password Reset
- Saat ini reset password menggunakan Supabase Admin API
- Pastikan menggunakan SERVICE_ROLE_KEY untuk produksi

### File Upload
- Saat ini menggunakan URL untuk materi (Google Drive, dll)
- Untuk upload file sungguhan, setup Supabase Storage

### RLS Policies
- Semua tabel sudah dilindungi dengan Row Level Security
- Siswa hanya bisa akses mapel, materi, kuis di kelasnya
- Guru hanya bisa edit mapel miliknya
- Semua policies menggunakan role `siswa` (bukan `murid`)

### Notifikasi
- Tabel `notifications` perlu dibuat manual (lihat SQL di atas)
- Policy INSERT menggunakan `WITH CHECK (true)` agar guru bisa insert untuk siswa
- Deadline check auto-run saat siswa load halaman

### Kuis Attempt Limits
- Kolom `attempt_limits` di tabel `kuis` perlu ditambahkan manual
- Kolom `attempt_number` di tabel `hasil_kuis` perlu ditambahkan manual
- Scoring menggunakan highest score logic

---

## 🎨 Animasi yang Digunakan

### Page Transitions
- Fade + slide up
- Staggered list items

### Card Interactions
- Hover scale (1.02)
- Shadow enhancement
- Spring animation

### Form Elements
- Input focus transitions
- Button tap scale
- Modal scale in/out

---

## 📌 Todo Belum Dikerjakan (Optional)

- [ ] Halaman register (opsional, guru buat akun siswa)
- [ ] Laporan statistik siswa (guru bisa lihat performa siswa)
- [ ] File upload dengan Supabase Storage
- [ ] Email verification
- [ ] Dark mode
- [ ] Mobile responsive improvements
- [ ] Fitur unpublish kuis (tidak direkomendasikan)

---

## 📞 Kontak / Support

Untuk pertanyaan atau issue, hubungi:
- Project di: `/home/alif/sekolah-online`
- Database schema: `supabase/schema.sql`
- RLS policies: `supabase/rls.sql`
