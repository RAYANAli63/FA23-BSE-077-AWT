-- ================================================
-- VOTESECURE - SECURE ONLINE ELECTION MANAGEMENT SYSTEM
-- Complete Supabase Schema
-- Run this FIRST in Supabase SQL Editor
-- ================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('super_admin','election_creator','voter')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATOR REQUESTS TABLE
CREATE TABLE IF NOT EXISTS creator_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  purpose TEXT NOT NULL,
  organization TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ELECTIONS TABLE
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','active','completed','cancelled')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_voters INTEGER NOT NULL DEFAULT 1000,
  is_locked BOOLEAN DEFAULT FALSE,
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  designation TEXT,
  manifesto TEXT,
  photo_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VOTER REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS voter_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  secret_code TEXT UNIQUE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered','waitlisted','finalized','voted')),
  terms_accepted BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  voted_at TIMESTAMPTZ,
  UNIQUE(election_id, voter_id)
);

-- 6. VOTES TABLE (Anonymous)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  secret_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ELECTIONS POLICIES
CREATE POLICY "elections_select_public" ON elections FOR SELECT USING (status IN ('published','active','completed'));
CREATE POLICY "elections_select_own" ON elections FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "elections_insert_creator" ON elections FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "elections_update_creator" ON elections FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "elections_admin_all" ON elections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- CANDIDATES POLICIES
CREATE POLICY "candidates_select_all" ON candidates FOR SELECT USING (true);
CREATE POLICY "candidates_manage_creator" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM elections WHERE id = election_id AND creator_id = auth.uid())
);
CREATE POLICY "candidates_admin_all" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- VOTER REGISTRATIONS POLICIES
CREATE POLICY "vr_select_own" ON voter_registrations FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "vr_insert_own" ON voter_registrations FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "vr_update_own" ON voter_registrations FOR UPDATE USING (auth.uid() = voter_id);
CREATE POLICY "vr_creator_select" ON voter_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM elections WHERE id = election_id AND creator_id = auth.uid())
);
CREATE POLICY "vr_admin_all" ON voter_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- VOTES POLICIES
CREATE POLICY "votes_insert_all" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_select_admin" ON votes FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','election_creator'))
);

-- AUDIT LOGS POLICIES
CREATE POLICY "audit_insert_all" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_select_admin" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','election_creator'))
);

-- CREATOR REQUESTS POLICIES
CREATE POLICY "cr_select_own" ON creator_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cr_insert_own" ON creator_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cr_admin_all" ON creator_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- NOTIFICATIONS POLICIES
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_all" ON notifications FOR INSERT WITH CHECK (true);

-- ===========================
-- FUNCTIONS & TRIGGERS
-- ===========================

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'voter'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER elections_updated_at BEFORE UPDATE ON elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate secret code
CREATE OR REPLACE FUNCTION generate_voter_secret(p_election_id UUID, p_seq INTEGER)
RETURNS TEXT AS $$
DECLARE
  short_id TEXT;
BEGIN
  short_id := UPPER(SUBSTRING(REPLACE(p_election_id::TEXT, '-', ''), 1, 4));
  RETURN 'POLL-' || short_id || '-' || LPAD(p_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Increment vote count
CREATE OR REPLACE FUNCTION increment_vote(p_candidate_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE candidates SET vote_count = vote_count + 1 WHERE id = p_candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_vote(UUID) TO authenticated;

-- Finalize voters when election starts
CREATE OR REPLACE FUNCTION finalize_voters(p_election_id UUID)
RETURNS void AS $$
DECLARE
  voter_record RECORD;
  seq_num INTEGER := 1;
BEGIN
  FOR voter_record IN
    SELECT id FROM voter_registrations
    WHERE election_id = p_election_id AND status = 'registered'
    ORDER BY registered_at ASC
  LOOP
    UPDATE voter_registrations
    SET
      status = 'finalized',
      secret_code = generate_voter_secret(p_election_id, seq_num),
      finalized_at = NOW()
    WHERE id = voter_record.id;
    seq_num := seq_num + 1;
  END LOOP;

  UPDATE elections SET is_locked = TRUE WHERE id = p_election_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION finalize_voters(UUID) TO authenticated;

-- Get election stats
CREATE OR REPLACE FUNCTION get_election_stats(p_election_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_registered', COUNT(*) FILTER (WHERE status IN ('registered','finalized','voted')),
    'total_finalized', COUNT(*) FILTER (WHERE status IN ('finalized','voted')),
    'total_voted', COUNT(*) FILTER (WHERE status = 'voted'),
    'total_waitlisted', COUNT(*) FILTER (WHERE status = 'waitlisted')
  ) INTO result
  FROM voter_registrations
  WHERE election_id = p_election_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_election_stats(UUID) TO authenticated, anon;

-- ===========================
-- AFTER SETUP: Make Super Admin
-- ===========================
-- Run this after registering your first account:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
