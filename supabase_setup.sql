-- ========================================
-- EMPRESSARIO MENTORSHIP PORTAL
-- Supabase Database Setup
-- ========================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ──────────────────────────────────────
-- 1. PROFILES TABLE
-- Linked to Supabase Auth users
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('mentor', 'startup', 'admin', 'pending')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- 2. MENTORS TABLE
-- Mentor-specific professional data
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  firm TEXT NOT NULL DEFAULT '',
  role_type TEXT NOT NULL DEFAULT '',
  expertise TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  calendly_link TEXT DEFAULT '',
  max_startups INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- 3. STARTUPS TABLE
-- Startup/Mentee-specific data
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL DEFAULT '',
  founder_name TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT '',
  team_size TEXT NOT NULL DEFAULT '',
  pitch_deck_url TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- 4. ASSIGNMENTS TABLE
-- Mentor-Startup pairings
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT DEFAULT '',
  UNIQUE(mentor_id, startup_id)
);

-- ──────────────────────────────────────
-- 5. MEETINGS TABLE
-- Meeting records between mentors and startups
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Mentoring Session',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  meeting_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assignments_mentor ON assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_startup ON assignments(startup_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_meetings_mentor ON meetings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_startup ON meetings(startup_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ──────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- ── Profiles Policies ──

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during registration
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Mentors Policies ──

-- Mentors can read their own data
CREATE POLICY "Mentors can read own data"
  ON mentors FOR SELECT
  USING (auth.uid() = id);

-- Startups can read their assigned mentor's data
CREATE POLICY "Startups can read assigned mentor"
  ON mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.mentor_id = mentors.id
      AND assignments.startup_id = auth.uid()
      AND assignments.status = 'active'
    )
  );

-- Admins can read all mentors
CREATE POLICY "Admins can read all mentors"
  ON mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Mentors can update their own data
CREATE POLICY "Mentors can update own data"
  ON mentors FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during registration
CREATE POLICY "Users can insert own mentor data"
  ON mentors FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Startups Policies ──

-- Startups can read their own data
CREATE POLICY "Startups can read own data"
  ON startups FOR SELECT
  USING (auth.uid() = id);

-- Mentors can read their assigned startups' data
CREATE POLICY "Mentors can read assigned startups"
  ON startups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.startup_id = startups.id
      AND assignments.mentor_id = auth.uid()
      AND assignments.status = 'active'
    )
  );

-- Admins can read all startups
CREATE POLICY "Admins can read all startups"
  ON startups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Startups can update their own data
CREATE POLICY "Startups can update own data"
  ON startups FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during registration
CREATE POLICY "Users can insert own startup data"
  ON startups FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Assignments Policies ──

-- Mentors can see their own assignments
CREATE POLICY "Mentors can read own assignments"
  ON assignments FOR SELECT
  USING (mentor_id = auth.uid());

-- Startups can see their own assignments
CREATE POLICY "Startups can read own assignments"
  ON assignments FOR SELECT
  USING (startup_id = auth.uid());

-- Admins can do everything with assignments
CREATE POLICY "Admins full access on assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Meetings Policies ──

-- Mentors can see their own meetings
CREATE POLICY "Mentors can read own meetings"
  ON meetings FOR SELECT
  USING (mentor_id = auth.uid());

-- Startups can see their own meetings
CREATE POLICY "Startups can read own meetings"
  ON meetings FOR SELECT
  USING (startup_id = auth.uid());

-- Admins can do everything with meetings
CREATE POLICY "Admins full access on meetings"
  ON meetings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Both mentors and startups can create meetings
CREATE POLICY "Participants can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (
    mentor_id = auth.uid() OR startup_id = auth.uid()
  );

-- ──────────────────────────────────────
-- 8. AUTO-UPDATE TIMESTAMPS
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────
-- 9. AUTO PROFILE CREATION TRIGGER
-- Automatically creates a profile when a new user signs up.
-- Also auto-assigns admin role to anantbhaidav@gmail.com
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  IF NEW.email = 'anantbhaidav@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    assigned_role := NEW.raw_user_meta_data->>'role';
  ELSE
    assigned_role := 'pending';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    assigned_role
  );
  
  IF assigned_role = 'mentor' THEN
    INSERT INTO public.mentors (id, firm, role_type, bio, calendly_link)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'firm', ''),
      COALESCE(NEW.raw_user_meta_data->>'role_type', ''),
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      COALESCE(NEW.raw_user_meta_data->>'calendly_link', '')
    );
  ELSIF assigned_role = 'startup' THEN
    INSERT INTO public.startups (id, startup_name, founder_name, sector, stage, pitch_deck_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'startup_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'founder_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'sector', ''),
      COALESCE(NEW.raw_user_meta_data->>'stage', ''),
      COALESCE(NEW.raw_user_meta_data->>'pitch_deck_url', '')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────
-- SETUP COMPLETE
-- ──────────────────────────────────────
