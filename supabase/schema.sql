-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: KELAS
-- ============================================
CREATE TABLE IF NOT EXISTS kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default classes
INSERT INTO kelas (nama) VALUES
  ('X'),
  ('XI'),
  ('XII')
ON CONFLICT (nama) DO NOTHING;

-- ============================================
-- TABLE: USERS (Public profile for auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(10) NOT NULL CHECK (role IN ('guru', 'siswa')),
  kelas_id UUID REFERENCES kelas(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: MATA_PELAJARAN
-- ============================================
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  guru_id UUID REFERENCES public.users(id),
  kelas_id UUID REFERENCES kelas(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: MATERI
-- ============================================
CREATE TABLE IF NOT EXISTS materi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mata_pelajaran_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: KUIS
-- ============================================
CREATE TABLE IF NOT EXISTS kuis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mata_pelajaran_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  judul VARCHAR(200) NOT NULL,
  tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pilihan_ganda', 'essay')),
  waktu_menit INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: PERTANYAAN_KUIS
-- ============================================
CREATE TABLE IF NOT EXISTS pertanyaan_kuis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kuis_id UUID REFERENCES kuis(id) ON DELETE CASCADE,
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT,
  opsi_b TEXT,
  opsi_c TEXT,
  opsi_d TEXT,
  jawaban_benar TEXT NOT NULL,
  urutan INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: HASIL_KUIS
-- ============================================
CREATE TABLE IF NOT EXISTS hasil_kuis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kuis_id UUID REFERENCES kuis(id) ON DELETE CASCADE,
  siswa_id UUID REFERENCES public.users(id),
  jawaban JSONB NOT NULL,
  skor INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(kuis_id, siswa_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_kelas ON public.users(kelas_id);
CREATE INDEX IF NOT EXISTS idx_matapelajaran_guru ON mata_pelajaran(guru_id);
CREATE INDEX IF NOT EXISTS idx_matapelajaran_kelas ON mata_pelajaran(kelas_id);
CREATE INDEX IF NOT EXISTS idx_materi_matapelajaran ON materi(mata_pelajaran_id);
CREATE INDEX IF NOT EXISTS idx_kuis_matapelajaran ON kuis(mata_pelajaran_id);
CREATE INDEX IF NOT EXISTS idx_pertanyaan_kuis ON pertanyaan_kuis(kuis_id);
CREATE INDEX IF NOT EXISTS idx_hasil_kuis_siswa ON hasil_kuis(siswa_id);

-- ============================================
-- TRIGGER: Updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matapelajaran_updated_at
  BEFORE UPDATE ON mata_pelajaran
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Create user profile after signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, nama, email, role, kelas_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->>'kelas_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKET: materi
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('materi', 'materi', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for materi
CREATE POLICY "Public Read Materi"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'materi');

CREATE POLICY "Guru Can Upload Materi"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materi' AND
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'guru')
);

CREATE POLICY "Guru Can Delete Materi"
ON storage.objects FOR DELETE
TO authenticated
WITH CHECK (
  bucket_id = 'materi' AND
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'guru')
);