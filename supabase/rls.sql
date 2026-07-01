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
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS Policies
-- ============================================

-- Users public read
CREATE POLICY "Users public read"
ON users FOR SELECT
TO authenticated
USING (true);

-- Guru can read all users
CREATE POLICY "Guru can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'guru'
  )
);

-- Siswa can read own profile
CREATE POLICY "Siswa can read own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Login lookup by username
CREATE POLICY "Login lookup by username"
ON users FOR SELECT
TO authenticated
USING (true);

-- Guru can insert siswa
CREATE POLICY "Guru can insert siswa"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Users can create own profile
CREATE POLICY "Users can create own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- User can update own profile
CREATE POLICY "User can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Guru can update siswa
CREATE POLICY "Guru can update siswa"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'guru'
  )
);

-- ============================================
-- KELAS Policies
-- ============================================

-- Anyone can read kelas
CREATE POLICY "Anyone can read kelas"
ON kelas FOR SELECT
TO authenticated
USING (true);

-- Guru can insert kelas
CREATE POLICY "Guru can insert kelas"
ON kelas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Creator can update kelas
CREATE POLICY "Creator can update kelas"
ON kelas FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'guru'
  )
);

-- Creator can delete kelas
CREATE POLICY "Creator can delete kelas"
ON kelas FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'guru'
  )
);

-- ============================================
-- MATA_PELAJARAN Policies
-- ============================================

-- Guru can create mata pelajaran
CREATE POLICY "Guru can create mata_pelajaran"
ON mata_pelajaran FOR INSERT
TO authenticated
WITH CHECK (true);

-- Guru can read own mata pelajaran
CREATE POLICY "Guru can read own mata_pelajaran"
ON mata_pelajaran FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mata_pelajaran mp WHERE mp.id = mata_pelajaran.id AND mp.guru_id = auth.uid()
  )
);

-- Siswa can read class mata pelajaran
CREATE POLICY "Siswa can read class mata_pelajaran"
ON mata_pelajaran FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND kelas_id = mata_pelajaran.kelas_id
  )
);

-- Guru can update own mata pelajaran
CREATE POLICY "Guru can update own mata_pelajaran"
ON mata_pelajaran FOR UPDATE
TO authenticated
USING (guru_id = auth.uid());

-- Guru can delete own mata pelajaran
CREATE POLICY "Guru can delete own mata_pelajaran"
ON mata_pelajaran FOR DELETE
TO authenticated
USING (guru_id = auth.uid());

-- ============================================
-- MATERI Policies
-- ============================================

-- Guru can create materi
CREATE POLICY "Guru can create materi"
ON materi FOR INSERT
TO authenticated
WITH CHECK (true);

-- Guru can read all materi
CREATE POLICY "Guru can read all materi"
ON materi FOR SELECT
TO authenticated
USING (true);

-- Siswa can read class materi
CREATE POLICY "Siswa can read class materi"
ON materi FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN mata_pelajaran mp ON mp.kelas_id = u.kelas_id
    WHERE u.id = auth.uid() AND mp.id = materi.mata_pelajaran_id
  )
);

-- Guru can update materi
CREATE POLICY "Guru can update materi"
ON materi FOR UPDATE
TO authenticated
USING (true);

-- Guru can delete materi
CREATE POLICY "Guru can delete materi"
ON materi FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- KUIS Policies
-- ============================================

-- Guru can create kuis
CREATE POLICY "Guru can create kuis"
ON kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mata_pelajaran
    WHERE mata_pelajaran.id = kuis.mata_pelajaran_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can read all kuis
CREATE POLICY "Guru can read all kuis"
ON kuis FOR SELECT
TO authenticated
USING (true);

-- Siswa can read class kuis
CREATE POLICY "Siswa can read class kuis"
ON kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN mata_pelajaran mp ON mp.kelas_id = u.kelas_id
    WHERE u.id = auth.uid() AND mp.id = kuis.mata_pelajaran_id
  )
);

-- Guru can update own kuis
CREATE POLICY "Guru can update own kuis"
ON kuis FOR UPDATE
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

-- Guru can create pertanyaan_kuis
CREATE POLICY "Guru can create pertanyaan_kuis"
ON pertanyaan_kuis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = pertanyaan_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can read all pertanyaan_kuis
CREATE POLICY "Guru can read all pertanyaan_kuis"
ON pertanyaan_kuis FOR SELECT
TO authenticated
USING (true);

-- Siswa can read class pertanyaan_kuis
CREATE POLICY "Siswa can read class pertanyaan_kuis"
ON pertanyaan_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN kuis k ON k.mata_pelajaran_id IN (SELECT id FROM mata_pelajaran WHERE kelas_id = u.kelas_id)
    WHERE u.id = auth.uid() AND k.id = pertanyaan_kuis.kuis_id
  )
);

-- ============================================
-- HASIL_KUIS Policies
-- ============================================

-- Siswa can create hasil_kuis
CREATE POLICY "Siswa can create hasil_kuis"
ON hasil_kuis FOR INSERT
TO authenticated
WITH CHECK (siswa_id = auth.uid());

-- Siswa can read own hasil_kuis
CREATE POLICY "Siswa can read own hasil_kuis"
ON hasil_kuis FOR SELECT
TO authenticated
USING (siswa_id = auth.uid());

-- Guru can read all hasil_kuis
CREATE POLICY "Guru can read all hasil_kuis"
ON hasil_kuis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = hasil_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- Guru can update hasil_kuis
CREATE POLICY "Guru can update hasil_kuis"
ON hasil_kuis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kuis
    JOIN mata_pelajaran ON kuis.mata_pelajaran_id = mata_pelajaran.id
    WHERE kuis.id = hasil_kuis.kuis_id AND mata_pelajaran.guru_id = auth.uid()
  )
);

-- ============================================
-- NOTIFICATIONS Policies
-- ============================================

-- Users can insert notifications
CREATE POLICY "users_insert_notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can read own notifications
CREATE POLICY "users_read_own_notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update own notifications
CREATE POLICY "users_update_own_notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- MATERI_VIEWS Policies
-- ============================================

-- Siswa can track materi views
CREATE POLICY "Siswa_can_track_materi_views"
ON materi_views FOR INSERT
TO authenticated
WITH CHECK (siswa_id = auth.uid());

-- Guru can read materi views
CREATE POLICY "Guru can read materi_views"
ON materi_views FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM materi m
    JOIN mata_pelajaran mp ON mp.id = m.mata_pelajaran_id
    WHERE m.id = materi_views.materi_id AND mp.guru_id = auth.uid()
  )
);

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
