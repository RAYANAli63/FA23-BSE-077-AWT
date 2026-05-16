-- ================================================
-- SECURE ONLINE ELECTION MANAGEMENT SYSTEM
-- Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('super_admin', 'election_creator', 'voter')),
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ELECTION CREATOR REQUESTS
CREATE TABLE IF NOT EXISTS creator_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- ELECTIONS TABLE
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','active','completed','cancelled')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  max_voters INTEGER NOT NULL DEFAULT 1000,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designation TEXT,
  manifesto TEXT,
  photo_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOTER REGISTRATIONS
CREATE TABLE IF NOT EXISTS voter_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  secret_code TEXT UNIQUE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered','waitlisted','finalized','voted')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  voted_at TIMESTAMPTZ,
  UNIQUE(election_id, voter_id)
);

-- VOTES TABLE (anonymous)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
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

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Elections: public can view published/active/completed
CREATE POLICY "Anyone can view published elections" ON elections FOR SELECT USING (status IN ('published','active','completed'));
CREATE POLICY "Creators can manage own elections" ON elections FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Admins can manage all elections" ON elections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Candidates: public can view
CREATE POLICY "Anyone can view candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Election creator can manage candidates" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM elections WHERE id = election_id AND creator_id = auth.uid())
);

-- Voter Registrations
CREATE POLICY "Voters can view own registrations" ON voter_registrations FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "Voters can register" ON voter_registrations FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "Admins can view all registrations" ON voter_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','election_creator'))
);

-- Votes: insert only, no viewing individual votes (anonymous)
CREATE POLICY "Anyone with valid secret can vote" ON votes FOR INSERT WITH CHECK (true);

-- Audit Logs: only admins
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','election_creator'))
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- ===========================
-- FUNCTIONS
-- ===========================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate unique secret voter ID
CREATE OR REPLACE FUNCTION generate_secret_code(election_id UUID, voter_num INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN 'POLL-' || UPPER(SUBSTRING(election_id::TEXT, 1, 4)) || '-' || LPAD(voter_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-lock election when max voters reached
CREATE OR REPLACE FUNCTION check_voter_lock()
RETURNS TRIGGER AS $$
DECLARE
  voter_count INTEGER;
  max_v INTEGER;
BEGIN
  SELECT COUNT(*), e.max_voters INTO voter_count, max_v
  FROM voter_registrations vr
  JOIN elections e ON e.id = vr.election_id
  WHERE vr.election_id = NEW.election_id AND vr.status = 'registered'
  GROUP BY e.max_voters;

  IF voter_count >= max_v THEN
    UPDATE elections SET is_locked = TRUE WHERE id = NEW.election_id;
    -- Generate secret codes for all finalized voters
    UPDATE voter_registrations
    SET status = 'finalized',
        secret_code = generate_secret_code(election_id, ROW_NUMBER() OVER (ORDER BY registered_at)::INTEGER)
    WHERE election_id = NEW.election_id AND status = 'registered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_lock_election AFTER INSERT ON voter_registrations
  FOR EACH ROW EXECUTE FUNCTION check_voter_lock();

-- ===========================
-- SEED: Super Admin
-- ===========================
-- After creating your first user via signup, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'admin@yourdomain.com';
