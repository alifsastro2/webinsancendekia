# 🚀 Quick Start Guide

## 1. Setup Database (ONE TIME ONLY)

### Option A: Automated Script (Recommended for development)

```bash
# Jalankan ini untuk melihat semua SQL yang perlu dijalankan
node scripts/setup-database-v2.js

# Copy SQL dari output di atas dan jalankan di Supabase Dashboard:
# https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq/sql
```

### Option B: Manual (Quick)

Buka Supabase SQL Editor dan jalankan:

**Step 1 - Schema:**
```bash
# Copy semua isi dari supabase/schema.sql
cat supabase/schema.sql
```

**Step 2 - RLS Policies:**
```bash
# Copy semua isi dari supabase/rls.sql
cat supabase/rls.sql
```

---

## 2. Create Teacher Account

```bash
node scripts/create-guru.js
```

**Login Credential:**
- Username: `azka`
- Password: `Azka123456`

---

## 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database tables & structure |
| `supabase/rls.sql` | Row Level Security policies |
| `scripts/create-guru.js` | Create test teacher account |
| `scripts/setup-database-v2.js` | Display setup instructions |

---

## 🔧 Common Issues

### "Username tidak ditemukan"
- Database belum di-setup
- Jalankan SQL schema & RLS di Supabase Dashboard
- Jalankan `node scripts/create-guru.js`

### "Password salah"
- Pastikan password: `Azka123456` (case-sensitive)

### Login redirect ke 404
- User profile belum terbuat di tabel `users`
- Jalankan `node scripts/create-guru.js` ulang