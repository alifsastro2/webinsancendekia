-- ============================================
-- TABLE: MATERI_VIEWS
-- Tracking siapa yang sudah membuka materi
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel untuk tracking pembukaan materi
CREATE TABLE IF NOT EXISTS materi_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materi_id UUID NOT NULL REFERENCES materi(id) ON DELETE CASCADE,
  siswa_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(materi_id, siswa_id) -- 1 siswa hanya tercatat 1x per materi
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_materi_views_materi ON materi_views(materi_id);
CREATE INDEX IF NOT EXISTS idx_materi_views_siswa ON materi_views(siswa_id);

-- RLS untuk materi_views
ALTER TABLE materi_views ENABLE ROW LEVEL SECURITY;

-- Guru bisa read semua view
CREATE POLICY "Guru can read materi_views"
ON materi_views FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran mp
    JOIN materi m ON m.mata_pelajaran_id = mp.id
    WHERE m.id = materi_views.materi_id AND mp.guru_id = auth.uid()
  )
);

-- Siswa bisa insert view (tracking)
CREATE POLICY "Siswa can create materi_views"
ON materi_views FOR INSERT
TO authenticated
WITH CHECK (
  siswa_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'siswa'
  )
);
