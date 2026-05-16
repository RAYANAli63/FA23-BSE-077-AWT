-- Run this in Supabase SQL Editor AFTER the main schema
-- This adds the increment_vote RPC function used by the voting page

CREATE OR REPLACE FUNCTION increment_vote(candidate_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE candidates
  SET vote_count = vote_count + 1
  WHERE id = candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_vote(UUID) TO authenticated;
