# 🏫 Sekolah Online - Student Information Management System

Sistem informasi belajar siswa dengan fitur lengkap untuk guru dan murid.

## ✨ Fitur Utama

### 👨‍🏫 Untuk Guru
- **Kelola Murid** - Buat, edit, hapus akun murid
- **Reset Password** - Reset password murid
- **Status Akun** - Aktif/nonaktifkan akun murid
- **Pindah Kelas** - Ganti kelas murid
- **Mata Pelajaran** - Buat dan kelola mata pelajaran per kelas
- **Upload Materi** - Upload materi pembelajaran
- **Buat Kuis** - Kuis pilihan ganda dan essay
- **Lihat Hasil** - Lihat hasil kuis murid

### 👨‍🎓 Untuk Murid
- **Lihat Mata Pelajaran** - Sesuai kelas yang dituju
- **Akses Materi** - Lihat dan download materi
- **Kerjakan Kuis** - Pilihan ganda & essay
- **Lihat Skor** - Skor kuis otomatis untuk pilihan ganda
- **Edit Profil** - Ubah nama, username, password

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Animation**: Framer Motion
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd sekolah-online
npm install
```

### 2. Setup Supabase

```bash
# Buat project di https://supabase.com
# Copy URL dan ANON KEY
```

### 3. Environment Variables

```bash
# Edit .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Setup Database

```bash
# Di Supabase Dashboard > SQL Editor
# Run file: supabase/schema.sql
# Run file: supabase/rls.sql
```

### 5. Buat Akun Guru Test

```bash
node scripts/create-guru.js
```

### 6. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

## 👤 Credential Test

```
Username: azka
Password: Azka123456
Email: azka@sekolah.test
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── guru/           # Guru pages
│   ├── murid/          # Murid pages
│   └── login/          # Auth pages
├── components/         # React components
│   ├── common/         # Shared components
│   ├── guru/           # Guru-specific
│   ├── murid/          # Murid-specific
│   └── ui/             # shadcn/ui
├── lib/                # Utilities & types
└── styles/             # Global styles
```

## 🎨 Theme Colors

- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#a855f7)
- **Accent**: Teal (#14b8a6)

## 📝 Database Schema

Tables: `users`, `kelas`, `mata_pelajaran`, `materi`, `kuis`, `pertanyaan_kuis`, `hasil_kuis`

Full schema: [supabase/schema.sql](supabase/schema.sql)

## 🔐 Security

- Row Level Security (RLS) enabled
- Role-based access control
- Murid hanya akses kelas mereka
- Guru hanya edit mapel miliknya

## 📄 License

MIT License

## 🤝 Contributing

Pull requests welcome!

---

**Dibuat dengan ❤️ menggunakan Next.js + Supabase**