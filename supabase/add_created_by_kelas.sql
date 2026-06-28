-- Add created_by column to kelas table
ALTER TABLE kelas ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- Drop existing RLS policies for kelas
DROP POLICY IF EXISTS "Anyone can read kelas" ON kelas;
DROP POLICY IF EXISTS "Guru can insert kelas" ON kelas;
DROP POLICY IF EXISTS "Creator can update kelas" ON kelas;
DROP POLICY IF EXISTS "Creator can delete kelas" ON kelas;

-- Everyone can still read all kelas
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

-- Only creator can update kelas
CREATE POLICY "Creator can update kelas"
ON kelas FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Only creator can delete kelas
CREATE POLICY "Creator can delete kelas"
ON kelas FOR DELETE
TO authenticated
USING (created_by = auth.uid());
