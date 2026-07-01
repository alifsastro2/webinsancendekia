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
- [x] **Per-Question Essay Grading**
- [x] **External URL support untuk materi**

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
| `essay_submitted` | Siswa submit essay | Guru mapel | `/guru/matapelajaran/[mapelId]/kuis/[kuisId]` |
| `quiz_graded` | Guru menyimpan nilai essay | Siswa terkait | `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]/review` |
| `quiz_deadline_soon` | Auto-check saat load (siswa) | Siswa | `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]` |

### Komponen
- `src/components/common/notification-bell.tsx` - Bell icon + dropdown
- Tabel `notifications` di database

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

### Grading Essay (Per-Soal)

**Konsep:**
- Setiap soal essay dinilai terpisah (0-100 masing-masing)
- Total score = **rata-rata** dari semua soal
- Skor per soal disimpan di JSON `jawaban`

**Format Jawaban Essay:**
```json
{
  "pertanyaanId1": { "jawaban": "isi jawaban siswa", "skor": 80 },
  "pertanyaanId2": { "jawaban": "isi jawaban siswa", "skor": 90 }
}
```

**Contoh:**
| Soal | Nilai |
|------|-------|
| Soal 1 | 80 |
| Soal 2 | 90 |
| Soal 3 | 70 |
| **Rata-rata** | **80** |

---

## 📚 Materi

### Upload Materi
Guru bisa upload materi dengan dua cara:
1. **Upload File** - Upload file langsung (PDF, Word, Excel, dll)
2. **URL Link** - Masukkan link eksternal (YouTube, Google Drive, dll)

### Form Behavior
- URL dan File bersifat mutually exclusive
- Jika upload file dipilih → URL field di-clear otomatis
- Jika URL diketik → file selection di-clear otomatis
- Hint format URL: `https://` wajib

### External URL Support
- YouTube, Google Drive, dan URL eksternal lainnya didukung
- Link langsung terbuka di tab baru
- Format wajib: `https://` di awal

### Siapa yang Membuka (Tracking)
- Guru bisa melihat siapa saja siswa yang sudah membuka materi
- Track dilakukan saat siswa klik tombol "Lihat Materi"
- Tabel `materi_views` menyimpan data viewer

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
│   │   │       └── kuis/[kuisId]/
│   │   │           ├── page.tsx    # Kerjakan kuis (satu-satu)
│   │   │           └── review/page.tsx # Review hasil kuis
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
│   ├── files.ts                    # File URL helpers (external URL support)
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
- `canvas-confetti` - Confetti celebration effect
- `shadcn/ui` (via @radix-ui/*) - UI components

### Forms & Validation
- `react-hook-form`, `@hookform/resolvers`, `zod` - Form handling
- `clsx`, `tailwind-merge`, `class-variance-authority` - Utilities

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
- ✅ Upload materi (file atau URL link)
- ✅ Kelola materi
- ✅ Siapa yang Membuka (tracking viewer)

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
- ✅ Input & simpan nilai essay **per-soal** (rata-rata otomatis)
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
- ✅ Notifikasi saat siswa submit essay
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

-- Materi views tracking
CREATE TABLE IF NOT EXISTS materi_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materi_id UUID REFERENCES materi(id) ON DELETE CASCADE,
  siswa_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(materi_id, siswa_id)
);
ALTER TABLE materi_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materi_views_all" ON materi_views FOR ALL TO authenticated USING (true);
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

### File Upload & URL
- Guru bisa upload file atau masukkan URL link
- URL dan File mutually exclusive (salah satu saja)
- External URL harus diawali dengan `https://`

### RLS Policies
- Semua tabel sudah dilindungi dengan Row Level Security
- Siswa hanya bisa akses mapel, materi, kuis di kelasnya
- Guru hanya bisa edit mapel miliknya
- Semua policies menggunakan role `siswa` (bukan `murid`)

### Kuis Attempt Limits
- Kolom `attempt_limits` di tabel `kuis` perlu ditambahkan manual
- Kolom `attempt_number` di tabel `hasil_kuis` perlu ditambahkan manual
- Scoring menggunakan highest score logic

### Essay Grading
- Jawaban essay disimpan dalam format: `{ pertanyaanId: { jawaban: string, skor: number }`
- Total score = rata-rata dari semua soal
- Siswa bisa retry sesuai attempt_limits

---

## 🎨 Animasi dan UI/UX Improvements

### Komponen Baru

| Komponen | File | Fungsi |
|----------|-------|--------|
| Skeleton | `src/components/ui/skeleton.tsx` | Loading state dengan shimmer effect |
| Animated Form Field | `src/components/ui/animated-form-field.tsx` | Label naik saat focus |
| Empty State | `src/components/ui/empty-state.tsx` | Ilustrasi SVG animasi |
| Progress Bar | `src/components/ui/progress-bar.tsx` | Progress dengan gradient + shimmer |
| Timer | `src/components/ui/timer.tsx` | Timer dengan pulse warning |
| Pull to Refresh | `src/components/ui/pull-to-refresh.tsx` | Swipe down untuk refresh |
| Sparkle | `src/components/ui/sparkle.tsx` | Partikel sparkle saat submit |
| Confetti | `src/components/common/confetti.tsx` | Confetti celebration |
| Auto-save | `src/lib/hooks/use-auto-save.ts` | Draft jawaban tersimpan otomatis |

### CSS Animations (globals.css)
- `.animate-shimmer` - Shimmer effect
- `.animate-badge-bounce` - Badge bounce saat notifikasi baru
- `.animate-timer-pulse` - Timer pulse animation
- `.animate-timer-critical` - Timer critical (merah berkedip)
- `.animate-sparkle` - Sparkle particles

### Fitur yang Diimplementasi

#### 1. Skeleton Shimmer Loading
```tsx
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui/skeleton'
```
- `Skeleton` - Generic skeleton dengan shimmer
- `SkeletonCard` - Card skeleton untuk list
- `SkeletonList` - List skeleton untuk items
- `SkeletonTable` - Table skeleton

#### 2. Animated Form Field (Floating Label)
```tsx
import { AnimatedFormField, AnimatedTextarea } from '@/components/ui/animated-form-field'

<AnimatedFormField
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={errors.username}
/>
```
- Label naik ke atas saat focus atau ada value
- Focus ring animation
- Error state dengan shake
- Password toggle dengan eye icon

#### 3. Empty State Illustrations
```tsx
import { EmptyState } from '@/components/ui/empty-state'

<EmptyState
  title="Belum ada kuis"
  description="Kuis akan muncul setelah guru membuat"
  illustration="quiz"
  action={{ label: 'Buat Kuis', onClick: () => {} }}
/>
```
- 8 type ilustrasi: book, quiz, users, folder, check, clock, search
- SVG animasi untuk setiap ilustrasi
- Floating particles effect
- Tombol action opsional

#### 4. Notification Badge Bounce
- Badge bounce saat ada notifikasi baru
- Shimmer effect untuk unread
- Polling setiap 30 detik
- Pulse indicator di header

#### 5. Auto-save Draft Jawaban Kuis
- Simpan otomatis setiap 5 detik ke localStorage
- Modal restore saat buka kuis lagi
- Indikator "Menyimpan..." saat auto-save
- Clear draft setelah submit berhasil
- Simpan juga saat page unload

#### 6. Confetti Animation (Hasil Kuis)
- Confetti saat nilai >= 80
- Extra burst untuk nilai >= 95
- Trophy icon untuk high scores
- Star rating berdasarkan nilai

#### 7. Progress Bar Animation
- Gradient fill dengan shimmer
- Auto color berdasarkan percentage
- Smooth animation saat update
- Support circular progress untuk timer

#### 8. Timer Pulse Animation
- Normal: background abu-abu
- Warning (< 60 detik): background kuning, pulse
- Critical (< 10 detik): background merah, pulse cepat, ikon alert

#### 9. Pull-to-Refresh
- Swipe down gesture
- Loading spinner animasi
- Spring physics untuk smooth feel

#### 10. Sparkle Animation
- Sparkle particles saat submit
- Button click sparkle effect
- Success sparkle burst

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
- Input focus transitions (label naik)
- Button tap scale
- Modal scale in/out

---

## 📌 Todo Belum Dikerjakan (Optional)

- [ ] Halaman register (opsional, guru buat akun siswa)
- [ ] Laporan statistik siswa (guru bisa lihat performa siswa)
- [ ] File upload dengan Supabase Storage (saat ini pakai URL)
- [ ] Email verification
- [ ] Dark mode
- [ ] Fitur unpublish kuis (tidak direkomendasikan)

---

## 📞 Kontak / Support

Untuk pertanyaan atau issue, hubungi:
- Project di: `/home/alif/sekolah-online`
- Database schema: `supabase/schema.sql`
- RLS policies: `supabase/rls.sql`
