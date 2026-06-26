# 🗄️ Setup Database Supabase

SQL untuk setup database sudah disiapkan. Karena Supabase tidak menyediakan API langsung untuk execute raw SQL, harap jalankan secara manual di Supabase Dashboard.

---

## 📋 Langkah-langkah

### 1. Jalankan Schema SQL

1. Buka: https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq
2. Masuk ke **SQL Editor**
3. **Create New Query**
4. Copy & paste SQL dari file `supabase/schema.sql`
5. Click **Run** button

Atau jalankan command ini untuk melihat SQL:
```bash
cat supabase/schema.sql
```

---

### 2. Jalankan RLS Policies

Setelah schema berhasil, jalankan RLS policies:

1. Di SQL Editor yang sama atau baru
2. Copy & paste SQL dari file `supabase/rls.sql`
3. Click **Run** button

Atau jalankan command ini untuk melihat SQL:
```bash
cat supabase/rls.sql
```

---

### 3. Buat Akun Guru Test

Setelah database setup selesai, jalankan:
```bash
node scripts/create-guru.js
```

**Credential:**
- Username: `azka`
- Password: `Azka123456`
- Email: `azka@sekolah.test`

---

## ✅ Verifikasi Setup

Setelah selesai, jalankan server dan test login:
```bash
npm run dev
```

Buka http://localhost:3000/login dan login dengan credential di atas.