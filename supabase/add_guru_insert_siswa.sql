-- ============================================
-- Fix: Guru can insert siswa profiles
-- ============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;

-- Allow guru to insert siswa profiles
CREATE POLICY "Guru can insert siswa"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'guru'
  )
  AND role = 'siswa'
);

-- Users can still create their own profile (for auth trigger)
CREATE POLICY "Users can create own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
