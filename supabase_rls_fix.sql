-- ========================================
-- RLS INFINITE RECURSION FIX
-- ========================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS so it won't trigger the infinite recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all mentors" ON mentors;
DROP POLICY IF EXISTS "Admins can read all startups" ON startups;
DROP POLICY IF EXISTS "Admins full access on assignments" ON assignments;
DROP POLICY IF EXISTS "Admins full access on meetings" ON meetings;

-- 3. Recreate the policies using the new helper function
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all mentors"
  ON mentors FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all startups"
  ON startups FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins full access on assignments"
  ON assignments FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins full access on meetings"
  ON meetings FOR ALL
  USING (public.is_admin());
