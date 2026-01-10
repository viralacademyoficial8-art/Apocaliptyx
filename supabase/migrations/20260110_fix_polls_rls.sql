-- =====================================================
-- FIX POLLS RLS POLICIES
-- Allow authenticated users to create polls
-- =====================================================

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Anyone can view polls" ON forum_polls;
DROP POLICY IF EXISTS "Anyone can view poll options" ON forum_poll_options;
DROP POLICY IF EXISTS "Users can vote on polls" ON forum_poll_votes;
DROP POLICY IF EXISTS "Users can view their votes" ON forum_poll_votes;
DROP POLICY IF EXISTS "Users can create polls" ON forum_polls;
DROP POLICY IF EXISTS "Users can create poll options" ON forum_poll_options;
DROP POLICY IF EXISTS "Anyone can view all votes" ON forum_poll_votes;

-- Ensure tables exist (for safety)
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  multiple_choice BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id)
);

CREATE TABLE IF NOT EXISTS forum_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES forum_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Enable RLS
ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLLS POLICIES
-- =====================================================

-- Anyone can view polls
CREATE POLICY "Anyone can view polls" ON forum_polls
  FOR SELECT USING (true);

-- Authenticated users can create polls (linked to their own posts)
CREATE POLICY "Users can create polls" ON forum_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_posts
      WHERE forum_posts.id = post_id
      AND forum_posts.author_id = auth.uid()
    )
  );

-- =====================================================
-- POLL OPTIONS POLICIES
-- =====================================================

-- Anyone can view poll options
CREATE POLICY "Anyone can view poll options" ON forum_poll_options
  FOR SELECT USING (true);

-- Authenticated users can create poll options for their polls
CREATE POLICY "Users can create poll options" ON forum_poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_polls p
      JOIN forum_posts fp ON fp.id = p.post_id
      WHERE p.id = poll_id
      AND fp.author_id = auth.uid()
    )
  );

-- =====================================================
-- POLL VOTES POLICIES
-- =====================================================

-- Anyone can view all votes (needed for vote counts)
CREATE POLICY "Anyone can view all votes" ON forum_poll_votes
  FOR SELECT USING (true);

-- Users can vote on polls
CREATE POLICY "Users can vote on polls" ON forum_poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes (for changing votes in single-choice polls)
CREATE POLICY "Users can delete own votes" ON forum_poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VOTE ON POLL FUNCTION (SECURITY DEFINER)
-- =====================================================

CREATE OR REPLACE FUNCTION vote_on_poll(
  p_poll_id UUID,
  p_option_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_poll forum_polls;
  v_existing forum_poll_votes;
  v_result JSON;
BEGIN
  -- Check if poll exists and not expired
  SELECT * INTO v_poll FROM forum_polls WHERE id = p_poll_id;

  IF v_poll IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Poll not found');
  END IF;

  IF v_poll.ends_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Poll has ended');
  END IF;

  -- Check if already voted (for single choice)
  IF NOT v_poll.multiple_choice THEN
    SELECT * INTO v_existing
    FROM forum_poll_votes
    WHERE poll_id = p_poll_id AND user_id = p_user_id;

    IF v_existing IS NOT NULL THEN
      -- Remove old vote
      DELETE FROM forum_poll_votes WHERE id = v_existing.id;
      UPDATE forum_poll_options SET votes_count = votes_count - 1 WHERE id = v_existing.option_id;
    END IF;
  END IF;

  -- Add new vote
  INSERT INTO forum_poll_votes (poll_id, option_id, user_id)
  VALUES (p_poll_id, p_option_id, p_user_id)
  ON CONFLICT (poll_id, user_id, option_id) DO NOTHING;

  -- Update vote count
  UPDATE forum_poll_options SET votes_count = votes_count + 1 WHERE id = p_option_id;

  -- Return updated poll data
  SELECT json_build_object(
    'success', true,
    'options', (
      SELECT json_agg(json_build_object(
        'id', po.id,
        'option_text', po.option_text,
        'votes_count', po.votes_count
      ) ORDER BY po.option_order)
      FROM forum_poll_options po
      WHERE po.poll_id = p_poll_id
    ),
    'total_votes', (SELECT COALESCE(SUM(votes_count), 0) FROM forum_poll_options WHERE poll_id = p_poll_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION vote_on_poll(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION vote_on_poll(UUID, UUID, UUID) TO anon;
