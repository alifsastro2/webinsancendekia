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

## Supabase Tables
| Table | Key Columns | Notes |
|---|---|---|
| **`kelas`** | id, nama, `created_by` (UUID), created_at | Default: X, XI, XII; creator-only DML |
| **`users`** | id, username, nama, email, role (guru/siswa), kelas_id, is_active | Auto-created via trigger on auth.users signup |
| **`mata_pelajaran`** | id, nama, deskripsi, guru_id, kelas_id | Strict RLS: guru only sees own mapel |
| **`materi`** | id, mata_pelajaran_id, judul, deskripsi, file_url (R2) | File URL proxied through /api/files |
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
- **Register:** Hidden `/register` page uses `supabaseAdmin.auth.admin.createUser` (service_role key) with email=`${username}@sekolah.app`

## Migration SQL (run in Supabase SQL Editor)
- `supabase/add_due_date.sql` — adds `due_date TIMESTAMPTZ` to `kuis`
- `supabase/add_published.sql` — adds `published BOOLEAN DEFAULT FALSE` to `kuis`
- `supabase/add_created_by_kelas.sql` — adds `created_by` to `kelas`, backfill legacy, RLS policies

## Progress
### Done
- Sidebar header (guru + siswa): no icon, just name; siswa shows kelas
- All "Download" buttons → "Lihat Materi" with Eye icon
- Review page at `/review/` for graded kuis results
- Due date: column, form input, badges, expired check, disabled "Ditutup" button
- Published: column, Terbitkan button (guard: ≥1 soal), draft/published badges, siswa filter `.eq('published', true)`
- Dashboard: removed Aksi Cepat & Activity; added "Kuis Perlu Dinilai" (guru) + "Deadline Mendekat" (guru & siswa, side-by-side)
- R2 proxy via `/api/files/[...path]` with `getFileUrl()` helper
- Standardized "Skor" → "Nilai" everywhere
- Kelas `created_by` + RLS (creator-only DML) + reference check before delete
- Strict RLS for `mata_pelajaran` (SELECT/UPDATE/DELETE own only)
- Secret `/register` page + `/api/register` endpoint

### In Progress
- (none)

### Known Issues / Next Steps
- Test `/register` page end-to-end (create teacher account, verify login)
- Verify R2 proxy works (click "Lihat Materi" on R2 file)
- Ensure `SUPABASE_SERVICE_ROLE_KEY` set in production `.env`
- No "unpublish" button yet (published kuis cannot revert to draft)
- `next.config.ts` has `allowedDevOrigins: ['10.17.217.122']` for dev from network IP
