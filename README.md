# 🏫 Sekolah Online - Student Information Management System

Sistem informasi belajar siswa dengan fitur lengkap untuk guru dan siswa.

## ✨ Fitur Utama

### 👨‍🏫 Untuk Guru
- **Kelola Siswa** - Buat, edit, hapus, reset password, aktif/nonaktifkan akun
- **Mata Pelajaran** - Buat dan kelola mapel per kelas
- **Materi** - Upload materi pembelajaran (file/URL)
- **Kuis** - Buat kuis pilihan ganda & essay dengan timer
- **Penilaian** - Review jawaban & nilai essay siswa

### 👨‍🎓 Untuk Siswa
- **Lihat Mata Pelajaran** - Sesuai kelas
- **Akses Materi** - Lihat dan download materi
- **Kerjakan Kuis** - Pilihan ganda & essay, satu-satu dengan navigasi
- **Timer** - Auto-submit saat waktu habis
- **Lihat Skor** - Skor otomatis untuk pilihan ganda

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

### 5. Buat Akun Guru & Siswa Test

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
│   ├── siswa/          # Siswa pages
│   └── login/          # Auth pages
├── components/         # React components
│   ├── common/         # Shared components
│   ├── guru/           # Guru-specific
│   ├── siswa/          # Siswa-specific
│   └── ui/             # shadcn/ui
├── lib/                # Utilities & types
└── styles/             # Global styles
```

## 🎨 Theme Colors

- **Primary**: Red (#ef4444)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Green (#22c55e)

## 📝 Database Schema

Tables: `users`, `kelas`, `mata_pelajaran`, `materi`, `kuis`, `pertanyaan_kuis`, `hasil_kuis`

Full schema: [supabase/schema.sql](supabase/schema.sql)

## 🔐 Security

- Row Level Security (RLS) enabled
- Role-based access control
- Siswa hanya akses mapel, materi, kuis di kelasnya
- Guru hanya edit mapel miliknya

## 📄 License

MIT License

## 🤝 Contributing

Pull requests welcome!

---

**Dibuat dengan ❤️ menggunakan Next.js + Supabase**