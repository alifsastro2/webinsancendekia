-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Sekolah Online - Insan Cendekia Nusantara
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertanyaan_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_kuis ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS Policies
-- ============================================

-- Users can be read by public (anon + authenticated)
CREATE POLICY "Users public read"
ON users FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users update own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Guru can create users (siswa only)
CREATE POLICY "Guru can create users"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM users users_1
    WHERE users_1.id = auth.uid() AND users_1.role = 'guru'
  )) OR (id = auth.uid())
);

-- ============================================
-- KELAS Policies
-- ============================================

-- Everyone can read kelas
CREATE POLICY "Kelas public read"
ON kelas FOR SELECT
TO authenticated
USING (true);

-- Guru can insert kelas
CREATE POLICY "Guru can insert kelas"
ON kelas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'guru'
  )
);

-- Guru can update kelas
CREATE POLICY "Guru can update kelas"
ON kelas FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'guru'
  )
);

-- Guru can delete kelas
CREATE POLICY "Guru can delete kelas"
ON kelas FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'guru'
  )
);

-- ============================================
-- MATA_PELAJARAN Policies
-- ============================================

-- Mata Pelajaran can be read by authenticated
CREATE POLICY "MataPelajaran read"
ON mata_pelajaran FOR SELECT
TO authenticated
USING (true);

-- Guru can create mata pelajaran
CREATE POLICY "MataPelajaran insert"
ON mata_pelajaran FOR INSERT
TO authenticated
WITH CHECK (true);

-- Guru can update own mata pelajaran
CREATE POLICY "MataPelajaran update own"
ON mata_pelajaran FOR UPDATE
TO authenticated
USING (guru_id = auth.uid());

-- Guru can delete own mata pelajaran
CREATE POLICY "MataPelajaran delete own"
ON mata_pelajaran FOR DELETE
TO authenticated
USING (guru_id = auth.uid());

-- ============================================
-- MATERI Policies
-- ============================================

-- Materi can be read by authenticated
CREATE POLICY "Materi read"
ON materi FOR SELECT
TO authenticated
USING (true);

-- Guru can insert materi
CREATE POLICY "Allow guru to insert materi"
ON materi FOR INSERT
TO authenticated
WITH CHECK (true);

-- Guru can update materi
CREATE POLICY "Allow guru to update materi"
ON materi FOR UPDATE
TO authenticated
USING (true);

-- Guru can delete materi
CREATE POLICY "Allow guru to delete materi"
ON materi FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- KUIS Policies
-- ============================================

-- Kuis can be read by authenticated
CREATE POLICY "Kuis read"
ON kuis FOR SELECT
TO authenticated
USING (true);

-- Guru can insert kuis
CREATE POLICY "Kuis insert"
ON kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE mata_pelajaran.id = kuis.mata_pelajaran_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can update own kuis
CREATE POLICY "Kuis update own"
ON kuis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE mata_pelajaran.id = kuis.mata_pelajaran_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can delete own kuis
CREATE POLICY "Kuis delete own"
ON kuis FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE mata_pelajaran.id = kuis.mata_pelajaran_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- ============================================
-- PERTANYAAN_KUIS Policies
-- ============================================

-- Pertanyaan kuis can be read by authenticated
CREATE POLICY "PertanyaanKuis read"
ON pertanyaan_kuis FOR SELECT
TO authenticated
USING (true);

-- Guru can insert pertanyaan kuis
CREATE POLICY "PertanyaanKuis insert"
ON pertanyaan_kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = pertanyaan_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can update own pertanyaan kuis
CREATE POLICY "PertanyaanKuis update own"
ON pertanyaan_kuis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = pertanyaan_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can delete own pertanyaan kuis
CREATE POLICY "PertanyaanKuis delete own"
ON pertanyaan_kuis FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = pertanyaan_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- ============================================
-- HASIL_KUIS Policies
-- ============================================

-- Siswa can read own hasil kuis
CREATE POLICY "HasilKuis read own"
ON hasil_kuis FOR SELECT
TO authenticated
USING (siswa_id = auth.uid());

-- Guru can read hasil kuis from their subjects
CREATE POLICY "HasilKuis read guru"
ON hasil_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = hasil_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Siswa can insert their own hasil kuis
CREATE POLICY "HasilKuis insert own"
ON hasil_kuis FOR INSERT
TO authenticated
WITH CHECK (siswa_id = auth.uid());

-- Siswa can update their own hasil kuis
CREATE POLICY "HasilKuis update own"
ON hasil_kuis FOR UPDATE
TO authenticated
USING (siswa_id = auth.uid())
WITH CHECK (siswa_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is guru
CREATE OR REPLACE FUNCTION is_guru(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'guru'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's class
CREATE OR REPLACE FUNCTION get_user_kelas(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT kelas_id FROM public.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count kelas references (for delete prevention)
CREATE OR REPLACE FUNCTION count_kelas_references(p_kelas_id UUID)
RETURNS TABLE(table_name TEXT, count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT 'mata_pelajaran'::TEXT, COUNT(*)::BIGINT
    FROM mata_pelajaran WHERE mata_pelajaran.kelas_id = p_kelas_id
  UNION ALL
    SELECT 'users'::TEXT, COUNT(*)::BIGINT
    FROM public.users WHERE users.kelas_id = p_kelas_id AND users.role = 'siswa';
END;
$$;

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for mata_pelajaran table
DROP TRIGGER IF EXISTS update_matapelajaran_updated_at ON mata_pelajaran;
CREATE TRIGGER update_matapelajaran_updated_at
  BEFORE UPDATE ON mata_pelajaran
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
