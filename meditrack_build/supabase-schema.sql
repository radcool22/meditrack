-- ============================================================
-- MediTrack — Supabase Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: Your Project → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE (family members)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) DEFAULT 'self',
  avatar_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  extracted_text TEXT,
  analysis JSONB,
  report_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_profile_id ON reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_report_id ON chat_messages(report_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================================
-- ROW LEVEL SECURITY
-- Since we handle auth via JWT middleware (not Supabase Auth),
-- we use permissive policies. All data access is controlled
-- at the API route level.
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon key (API routes handle authorization)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on reports" ON reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET
-- Also create via Supabase Dashboard:
-- Go to: Storage → New Bucket → Name: "medical-reports"
-- Set to PRIVATE (not public)
-- ============================================================
-- Note: Storage bucket must be created via Dashboard or API.
-- The bucket name must be: medical-reports

INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-reports', 'medical-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow all operations for authenticated anon key
CREATE POLICY "Allow upload to medical-reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-reports');

CREATE POLICY "Allow read from medical-reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-reports');

CREATE POLICY "Allow delete from medical-reports" ON storage.objects
  FOR DELETE USING (bucket_id = 'medical-reports');
