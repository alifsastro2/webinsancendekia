-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertanyaan_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_kuis ENABLE ROW LEVEL SECURITY;

-- ============================================
-- KELAS Policies
-- ============================================

-- Everyone can read kelas
CREATE POLICY "Anyone can read kelas"
ON kelas FOR SELECT
TO authenticated
USING (true);

-- Guru can insert kelas with their own id
CREATE POLICY "Guru can insert kelas"
ON kelas FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'guru')
);

-- Only creator can update kelas (or legacy records without creator)
CREATE POLICY "Creator can update kelas"
ON kelas FOR UPDATE
TO authenticated
USING (created_by IS NULL OR created_by = auth.uid())
WITH CHECK (created_by IS NULL OR created_by = auth.uid());

-- Only creator can delete kelas (or legacy records without creator)
CREATE POLICY "Creator can delete kelas"
ON kelas FOR DELETE
TO authenticated
USING (created_by IS NULL OR created_by = auth.uid());

-- ============================================
-- USERS Policies
-- ============================================

-- Allow users to create their own profile (for auth trigger)
CREATE POLICY "Users can create own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Guru can read all users
CREATE POLICY "Guru can read all users"
ON public.users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can only read themselves
CREATE POLICY "Siswa can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- User can update own profile
CREATE POLICY "User can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
-- Guru can update siswa profiles

CREATE POLICY "Guru can update siswa"
ON public.users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
  AND role = 'siswa'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
  AND role = 'siswa'
);

-- ============================================
-- MATA_PELAJARAN Policies
-- ============================================

-- Guru can read all mata_pelajaran
CREATE POLICY "Guru can read all mata_pelajaran"
ON mata_pelajaran FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can only read mata_pelajaran for their class
CREATE POLICY "Siswa can read class mata_pelajaran"
ON mata_pelajaran FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'siswa' AND kelas_id = mata_pelajaran.kelas_id
  )
);

-- Guru can create mata_pelajaran
CREATE POLICY "Guru can create mata_pelajaran"
ON mata_pelajaran FOR INSERT
TO authenticated
WITH CHECK (
  guru_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Guru can update own mata_pelajaran
CREATE POLICY "Guru can update own mata_pelajaran"
ON mata_pelajaran FOR UPDATE
TO authenticated
USING (guru_id = auth.uid())
WITH CHECK (guru_id = auth.uid());

-- ============================================
-- MATERI Policies
-- ============================================

-- Guru can read all materi
CREATE POLICY "Guru can read all materi"
ON materi FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can read materi for their class
CREATE POLICY "Siswa can read class materi"
ON materi FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    INNER JOIN mata_pelajaran mp ON mp.kelas_id = u.kelas_id
    WHERE u.id = auth.uid() AND u.role = 'siswa' AND mp.id = materi.mata_pelajaran_id
  )
);

-- Guru can create materi
CREATE POLICY "Guru can create materi"
ON materi FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE id = materi.mata_pelajaran_id AND guru_id = auth.uid()
  )
);

-- Guru can delete materi
CREATE POLICY "Guru can delete materi"
ON materi FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE id = materi.mata_pelajaran_id AND guru_id = auth.uid()
  )
);

-- ============================================
-- KUIS Policies
-- ============================================

-- Guru can read all kuis
CREATE POLICY "Guru can read all kuis"
ON kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can read kuis for their class
CREATE POLICY "Siswa can read class kuis"
ON kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    INNER JOIN mata_pelajaran mp ON mp.kelas_id = u.kelas_id
    WHERE u.id = auth.uid() AND u.role = 'siswa' AND mp.id = kuis.mata_pelajaran_id
  )
);

-- Guru can create kuis
CREATE POLICY "Guru can create kuis"
ON kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE id = kuis.mata_pelajaran_id AND guru_id = auth.uid()
  )
);

-- Guru can update own kuis
CREATE POLICY "Guru can update own kuis"
ON kuis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE id = kuis.mata_pelajaran_id AND guru_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE id = kuis.mata_pelajaran_id AND guru_id = auth.uid()
  )
);

-- ============================================
-- PERTANYAAN_KUIS Policies
-- ============================================

-- Guru can read all pertanyaan_kuis
CREATE POLICY "Guru can read all pertanyaan_kuis"
ON pertanyaan_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can read pertanyaan_kuis for their class
CREATE POLICY "Siswa can read class pertanyaan_kuis"
ON pertanyaan_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    INNER JOIN kuis k ON k.mata_pelajaran_id = (
      SELECT mp.id FROM mata_pelajaran mp
      WHERE mp.kelas_id = u.kelas_id
    )
    WHERE u.id = auth.uid() AND u.role = 'siswa' AND k.id = pertanyaan_kuis.kuis_id
  )
);

-- Guru can create pertanyaan_kuis
CREATE POLICY "Guru can create pertanyaan_kuis"
ON pertanyaan_kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kuis
    WHERE id = pertanyaan_kuis.kuis_id
    AND mata_pelajaran_id IN (
      SELECT id FROM mata_pelajaran WHERE guru_id = auth.uid()
    )
  )
);

-- ============================================
-- HASIL_KUIS Policies
-- ============================================

-- Guru can read all hasil_kuis
CREATE POLICY "Guru can read all hasil_kuis"
ON hasil_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Siswa can read own hasil_kuis
CREATE POLICY "Siswa can read own hasil_kuis"
ON hasil_kuis FOR SELECT
TO authenticated
USING (siswa_id = auth.uid());

-- Siswa can create hasil_kuis
CREATE POLICY "Siswa can create hasil_kuis"
ON hasil_kuis FOR INSERT
TO authenticated
WITH CHECK (siswa_id = auth.uid());

-- Guru can update hasil_kuis (skor)
CREATE POLICY "Guru can update hasil_kuis"
ON hasil_kuis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
);

-- ============================================
-- Helper Functions
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