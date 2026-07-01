-- ============================================
-- HAPUS SEMUA DATA TESTING
-- Menjaga akun guru (username: azka) SAJA
-- ============================================

-- Urutan hapus (perhatikan FOREIGN KEY constraint):

-- 1. Hapus notifications milik siswa
DELETE FROM notifications
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE username = 'azka'
);

-- 2. Hapus materi_views
DELETE FROM materi_views;

-- 3. Hapus pertanyaan_kuis (child table dari kuis)
DELETE FROM pertanyaan_kuis
WHERE kuis_id IN (
  SELECT id FROM kuis
  WHERE mata_pelajaran_id IN (
    SELECT id FROM mata_pelajaran WHERE guru_id != (SELECT id FROM public.users WHERE username = 'azka')
  )
);

-- 4. Hapus hasil_kuis
DELETE FROM hasil_kuis;

-- 5. Hapus kuis
DELETE FROM kuis;

-- 6. Hapus materi
DELETE FROM materi;

-- 7. Hapus mata_pelajaran
DELETE FROM mata_pelajaran;

-- 8. Hapus siswa dari public.users (JANGAN hapus guru azka)
DELETE FROM public.users
WHERE username != 'azka';

-- 9. Hapus siswa dari auth.users (JANGAN hapus guru azka)
DELETE FROM auth.users
WHERE id NOT IN (
  SELECT id FROM public.users WHERE username = 'azka'
);

-- ============================================
-- VERIFIKASI: Cek data yang tersisa
-- ============================================

-- Cek jumlah user
SELECT role, COUNT(*) as jumlah FROM public.users GROUP BY role;

-- Lihat semua user
SELECT id, username, nama, role, kelas_id FROM public.users;

-- Cek apakah data lain sudah kosong
SELECT 'mata_pelajaran' as tabel, COUNT(*) as jumlah FROM mata_pelajaran
UNION ALL
SELECT 'materi', COUNT(*) FROM materi
UNION ALL
SELECT 'kuis', COUNT(*) FROM kuis
UNION ALL
SELECT 'hasil_kuis', COUNT(*) FROM hasil_kuis
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
