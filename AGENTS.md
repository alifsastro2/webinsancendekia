<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Sekolah Online (Insan Cendekia Nusantara)

Platform pembelajaran digital — manajemen kelas, materi, kuis (pilihan ganda & essay), grading, dan review.

## Stack
- **Framework:** Next.js 16 (Turbopack)
- **Auth/DB:** Supabase (Postgres + RLS + Storage)
- **UI:** Tailwind CSS, shadcn/ui, framer-motion, lucide-react, sonner

## Routes
| Route | Role | Description |
|---|---|---|
| `/login` | Public | Login page (red theme) |
| `/register` | Secret | Buat akun guru baru (hidden, no public link) |
| `/guru` | Guru | Dashboard: stat cards + Kuis Perlu Dinilai + Deadline Mendekat |
| `/guru/matapelajaran` | Guru | Daftar mata pelajaran |
| `/guru/matapelajaran/[id]` | Guru | Detail mapel: materi + kuis CRUD |
| `/guru/matapelajaran/[id]/kuis` | Guru | Manajemen kuis untuk satu mapel |
| `/guru/matapelajaran/[id]/kuis/[kuisId]` | Guru | Detail kuis: daftar soal, grading essay, Terbitkan |
| `/guru/settings` | Guru | CRUD kelas (creator-only edit/delete) |
| `/guru/siswa` | Guru | Daftar siswa |
| `/siswa` | Siswa | Dashboard: mapel card + Deadline Mendekat (side-by-side) |
| `/siswa/kuis` | Siswa | Daftar semua kuis yang tersedia |
| `/siswa/matapelajaran` | Siswa | Daftar mapel |
| `/siswa/matapelajaran/[mapelId]` | Siswa | Detail mapel: materi + kuis |
| `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]` | Siswa | Mengerjakan kuis |
| `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]/review` | Siswa | Review hasil kuis yang sudah dinilai |
| `/siswa/profil` | Siswa | Profil siswa (nama, username, ganti password) |

## Supabase Tables
| Table | Key Columns | Notes |
|---|---|---|
| **`kelas`** | id, nama, `created_by` (UUID), created_at | Default: X, XI, XII; creator-only DML |
| **`users`** | id, username, nama, email, role (guru/siswa), kelas_id, is_active | Auto-created via trigger on auth.users signup |
| **`mata_pelajaran`** | id, nama, deskripsi, guru_id, kelas_id | Strict RLS: guru only sees own mapel |
| **`materi** | id, mata_pelajaran_id, judul, deskripsi, file_url (R2) | File URL proxied through /api/files |
| **`kuis`** | id, mata_pelajaran_id, judul, tipe (pilihan_ganda/essay), waktu_menit, `due_date`, `published`, created_at | Draft by default |
| **`pertanyaan_kuis`** | id, kuis_id, pertanyaan, opsi_a..d, jawaban_benar, urutan | |
| **`hasil_kuis`** | id, kuis_id, siswa_id, jawaban (JSONB), skor (null until graded), submitted_at | Unique per kuis+siswa; essay needs manual grading |

## Env Vars (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL`
- `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL`

## Key Decisions & Conventions
- **UI language:** Indonesian ("Nilai" not "Skor", "Lihat Materi" not "Download", etc.)
- **Sidebar:** No icon, just name text; siswa shows kelas instead of @username
- **Dashboard:** No Aksi Cepat / Activity & Status sections
- **Due date:** Student can start before deadline, finish per duration (no auto-submit)
- **Published:** Kuis created as draft; only visible to students after guru publishes
- **R2 files:** Proxied through `/api/files/[...path]` to fix SSL `ERR_CERT_AUTHORITY_INVALID`
- **Kelas:** Creator only can edit/delete; RPC helper `count_kelas_references()` prevents delete if referenced
- **Mata pelajaran:** Strict RLS — guru only sees their own subjects
- **Register:** Hidden `/register` page uses `supabaseAdmin.auth.admin.createUser` (service_role key) with email=`${username}@insancendekia.com`
- **Email auto-generated:** Login uses `username@insancendekia.com` for auth; email is NEVER shown to users in UI/UX
- **Login:** Only username + password; auth email generated from username (`${username}@insancendekia.com`)
- **Card layout mobile:** All cards use `flex-col sm:flex-row` for responsive layout; action buttons stack below content on mobile
- **`.maybeSingle()`:** Prefer over `.single()` for existence checks to avoid PGRST116/406 bug
- **Ambiguous FK joins:** When 2 FK exist between tables (e.g. `users` ↔ `kelas` via `kelas_id` AND `created_by`), specify explicit FK: `kelas!users_kelas_id_fkey(nama)`

## Migration SQL (run in Supabase SQL Editor)
- `supabase/add_due_date.sql` — adds `due_date TIMESTAMPTZ` to `kuis`
- `supabase/add_published.sql` — adds `published BOOLEAN DEFAULT FALSE` to `kuis`
- `supabase/add_created_by_kelas.sql` — adds `created_by` to `kelas`, backfill legacy, RLS policies

## Progress
### Done
- Sidebar header (guru + siswa): no icon, just name; siswa shows kelas
- All "Download" buttons → "Lihat Materi" with Eye icon
- Review page at `/siswa/matapelajaran/[mapelId]/kuis/[kuisId]/review/` for graded kuis results
- Due date: column, form input, badges, expired check, disabled "Ditutup" button
- Published: column, Terbitkan button (guard: ≥1 soal), draft/published badges, siswa filter `.eq('published', true)`
- Dashboard: removed Aksi Cepat & Activity; added "Kuis Perlu Dinilai" (guru) + "Deadline Mendekat" (guru & siswa, side-by-side)
- R2 proxy via `/api/files/[...path]` with `getFileUrl()` helper
- Standardized "Skor" → "Nilai" everywhere
- Kelas `created_by` + RLS (creator-only DML) + reference check before delete
- Strict RLS for `mata_pelajaran` (SELECT/UPDATE/DELETE own only)
- Secret `/register` page + `/api/register` endpoint
- Login uses username-based auto-generated email (`username@insancendekia.com`) instead of fetching from DB
- CSS mobile fixes: Card layout `flex-col sm:flex-row` for kuis & materi cards, search card padding fix
- Email domain changed from `@sekolah.app` to `@insancendekia.com` in all API/auth code
- Email removed from all UI/UX (profil siswa, settings guru, edit siswa) — auto-generated, hidden from users
- Fixed ambiguous FK join (`kelas!users_kelas_id_fkey`) in profil page
- Fixed kuis count stat to count all published kuis (not just non-expired)
- Added duplicate username check before saving profile
- Removed unused imports (AlertCircle, FileText, Button, UserPlus, Eye)

### Known Issues / Next Steps
- **Notifikasi:** Belum ada fitur notifikasi (to-do next)
- **`.single()` calls:** ~20 `.single()` calls remain that could be `.maybeSingle()` for consistency (non-breaking, low priority)
- **Hardcoded email domain:** `@insancendekia.com` hardcoded in 4 places, not an env var (low priority, stable domain)
- **No "unpublish" button:** Published kuis cannot revert to draft
- **Guru siswa page** fetches ALL siswa across all classes (may show students from other teachers' classes depending on RLS)
- `next.config.ts` has `allowedDevOrigins: ['10.17.217.122']` for dev from network IP
