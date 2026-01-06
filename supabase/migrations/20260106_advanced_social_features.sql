-- =====================================================
-- ADVANCED SOCIAL FEATURES MIGRATION
-- Combining Reddit, X/Twitter, Threads, Facebook, TikTok
-- For Apocaliptyx Forum - All-in-One Social Platform
-- =====================================================

-- =====================================================
-- 1. POLLS SYSTEM (Twitter/X Style)
-- =====================================================

-- Poll options table
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  multiple_choice BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id)
);

-- Poll options
CREATE TABLE IF NOT EXISTS forum_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll votes
CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES forum_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Index for poll votes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON forum_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON forum_poll_votes(user_id);

-- =====================================================
-- 2. AWARDS/TIPPING SYSTEM (Reddit Style with AP Coins)
-- =====================================================

-- Award types definition
CREATE TABLE IF NOT EXISTS forum_award_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL, -- emoji or icon name
  color TEXT NOT NULL DEFAULT '#FFD700',
  ap_cost INTEGER NOT NULL DEFAULT 100, -- Cost in AP Coins
  ap_reward INTEGER NOT NULL DEFAULT 50, -- AP reward for receiver
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default award types
INSERT INTO forum_award_types (name, description, icon, color, ap_cost, ap_reward) VALUES
  ('Visionario', 'Para predicciones que demuestran una visión excepcional', '🔮', '#9B59B6', 500, 250),
  ('Profeta', 'Premio para los que aciertan predicciones imposibles', '⚡', '#F39C12', 1000, 500),
  ('Apocaliptyx', 'El máximo honor en predicciones', '🌟', '#E74C3C', 2500, 1250),
  ('Fuego', 'Contenido que está en llamas', '🔥', '#E74C3C', 100, 50),
  ('Brillante', 'Idea brillante', '💡', '#F1C40F', 200, 100),
  ('Aplausos', 'Merece una ovación', '👏', '#3498DB', 150, 75),
  ('Mente Expandida', 'Contenido que expande la mente', '🧠', '#9B59B6', 300, 150),
  ('Diamante', 'Contenido de valor incalculable', '💎', '#00D4FF', 2000, 1000)
ON CONFLICT (name) DO NOTHING;

-- Awards given to posts
CREATE TABLE IF NOT EXISTS forum_post_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  award_type_id UUID NOT NULL REFERENCES forum_award_types(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT, -- Optional message with award
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Awards given to comments
CREATE TABLE IF NOT EXISTS forum_comment_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
  award_type_id UUID NOT NULL REFERENCES forum_award_types(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for awards
CREATE INDEX IF NOT EXISTS idx_post_awards_post ON forum_post_awards(post_id);
CREATE INDEX IF NOT EXISTS idx_post_awards_receiver ON forum_post_awards(receiver_id);
CREATE INDEX IF NOT EXISTS idx_comment_awards_comment ON forum_comment_awards(comment_id);

-- =====================================================
-- 3. THREADS/HILOS SYSTEM (Twitter/X Threads)
-- =====================================================

-- Thread container
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  total_posts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link posts to threads
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES forum_threads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS thread_position INTEGER DEFAULT NULL;

-- Index for thread posts
CREATE INDEX IF NOT EXISTS idx_posts_thread ON forum_posts(thread_id, thread_position);

-- =====================================================
-- 4. STORIES SYSTEM (Instagram/Facebook 24h Content)
-- =====================================================

-- Stories table
CREATE TABLE IF NOT EXISTS forum_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'gif')),
  background_color TEXT DEFAULT '#1a1a2e',
  text_color TEXT DEFAULT '#ffffff',
  font_style TEXT DEFAULT 'normal',
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_highlight BOOLEAN DEFAULT false, -- Permanent highlights
  highlight_name TEXT
);

-- Story views
CREATE TABLE IF NOT EXISTS forum_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES forum_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Story reactions (quick reactions)
CREATE TABLE IF NOT EXISTS forum_story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES forum_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL, -- emoji reaction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Story highlights (permanent collections)
CREATE TABLE IF NOT EXISTS forum_story_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for stories
CREATE INDEX IF NOT EXISTS idx_stories_user ON forum_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON forum_stories(expires_at) WHERE is_highlight = false;
CREATE INDEX IF NOT EXISTS idx_story_views_story ON forum_story_views(story_id);

-- =====================================================
-- 5. MENTIONS SYSTEM (@mentions)
-- =====================================================

-- Mentions in posts and comments
CREATE TABLE IF NOT EXISTS forum_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentioner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- Index for mentions
CREATE INDEX IF NOT EXISTS idx_mentions_user ON forum_mentions(mentioned_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_mentions_post ON forum_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON forum_mentions(comment_id);

-- =====================================================
-- 6. VERIFIED BADGES SYSTEM
-- =====================================================

-- Badge types
DO $$ BEGIN
  CREATE TYPE badge_type AS ENUM (
    'verified',      -- Blue check - verified identity
    'creator',       -- Gold badge - content creator
    'prophet',       -- Purple badge - high prediction accuracy
    'og',            -- Green badge - early adopter
    'moderator',     -- Red badge - community moderator
    'apocaliptyx'    -- Special badge - Apocaliptyx team
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_by UUID REFERENCES profiles(id),
  reason TEXT,
  UNIQUE(user_id, badge_type)
);

-- Add prediction stats to profiles for prophet badge calculation
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_predictions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_predictions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prediction_accuracy DECIMAL(5,2) DEFAULT 0;

-- Index for badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- =====================================================
-- 7. HOT/RISING/CONTROVERSIAL SCORING (Reddit Style)
-- =====================================================

-- Add scoring columns to posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS hot_score DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rising_score DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS controversy_score DECIMAL(10,4) DEFAULT 0;

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_posts_hot ON forum_posts(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_rising ON forum_posts(rising_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_controversy ON forum_posts(controversy_score DESC);

-- =====================================================
-- 8. GIF SUPPORT
-- =====================================================

-- Add GIF URL field to posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS gif_url TEXT,
ADD COLUMN IF NOT EXISTS gif_width INTEGER,
ADD COLUMN IF NOT EXISTS gif_height INTEGER;

-- =====================================================
-- 9. NOTIFICATIONS SYSTEM (Unified)
-- =====================================================

-- Notification types
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'mention',
    'reply',
    'reaction',
    'award',
    'follow',
    'repost',
    'poll_ended',
    'story_view',
    'story_reaction',
    'badge_awarded',
    'thread_reply'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- who triggered
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  story_id UUID REFERENCES forum_stories(id) ON DELETE CASCADE,
  content TEXT, -- Additional context
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON forum_notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Function: Vote on a poll
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
    'total_votes', (SELECT SUM(votes_count) FROM forum_poll_options WHERE poll_id = p_poll_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function: Give award to a post
CREATE OR REPLACE FUNCTION give_post_award(
  p_post_id UUID,
  p_award_type_id UUID,
  p_giver_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_award_type forum_award_types;
  v_post forum_posts;
  v_giver_coins INTEGER;
BEGIN
  -- Get award type
  SELECT * INTO v_award_type FROM forum_award_types WHERE id = p_award_type_id;
  IF v_award_type IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Award type not found');
  END IF;

  -- Get post and receiver
  SELECT * INTO v_post FROM forum_posts WHERE id = p_post_id;
  IF v_post IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Post not found');
  END IF;

  -- Check giver has enough coins
  SELECT ap_coins INTO v_giver_coins FROM profiles WHERE id = p_giver_id;
  IF v_giver_coins < v_award_type.ap_cost THEN
    RETURN json_build_object('success', false, 'error', 'Not enough AP Coins');
  END IF;

  -- Deduct coins from giver
  UPDATE profiles SET ap_coins = ap_coins - v_award_type.ap_cost WHERE id = p_giver_id;

  -- Add reward to receiver
  UPDATE profiles SET ap_coins = ap_coins + v_award_type.ap_reward WHERE id = v_post.user_id;

  -- Create award record
  INSERT INTO forum_post_awards (post_id, award_type_id, giver_id, receiver_id, message)
  VALUES (p_post_id, p_award_type_id, p_giver_id, v_post.user_id, p_message);

  -- Create notification
  INSERT INTO forum_notifications (user_id, type, actor_id, post_id, content)
  VALUES (v_post.user_id, 'award', p_giver_id, p_post_id, v_award_type.name);

  RETURN json_build_object(
    'success', true,
    'award_name', v_award_type.name,
    'ap_spent', v_award_type.ap_cost,
    'receiver_earned', v_award_type.ap_reward
  );
END;
$$;

-- Function: Create a story
CREATE OR REPLACE FUNCTION create_story(
  p_user_id UUID,
  p_content TEXT DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL,
  p_media_type TEXT DEFAULT NULL,
  p_background_color TEXT DEFAULT '#1a1a2e',
  p_text_color TEXT DEFAULT '#ffffff'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_story forum_stories;
BEGIN
  INSERT INTO forum_stories (user_id, content, media_url, media_type, background_color, text_color)
  VALUES (p_user_id, p_content, p_media_url, p_media_type, p_background_color, p_text_color)
  RETURNING * INTO v_story;

  RETURN json_build_object(
    'success', true,
    'story_id', v_story.id,
    'expires_at', v_story.expires_at
  );
END;
$$;

-- Function: View a story
CREATE OR REPLACE FUNCTION view_story(
  p_story_id UUID,
  p_viewer_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_story forum_stories;
BEGIN
  -- Get story
  SELECT * INTO v_story FROM forum_stories WHERE id = p_story_id;
  IF v_story IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Story not found');
  END IF;

  -- Record view (if not own story)
  IF v_story.user_id != p_viewer_id THEN
    INSERT INTO forum_story_views (story_id, viewer_id)
    VALUES (p_story_id, p_viewer_id)
    ON CONFLICT (story_id, viewer_id) DO NOTHING;

    -- Update view count
    UPDATE forum_stories SET views_count = views_count + 1 WHERE id = p_story_id;

    -- Notify story owner
    INSERT INTO forum_notifications (user_id, type, actor_id, story_id)
    VALUES (v_story.user_id, 'story_view', p_viewer_id, p_story_id);
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Function: React to a story
CREATE OR REPLACE FUNCTION react_to_story(
  p_story_id UUID,
  p_user_id UUID,
  p_reaction TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_story forum_stories;
BEGIN
  SELECT * INTO v_story FROM forum_stories WHERE id = p_story_id;
  IF v_story IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Story not found');
  END IF;

  INSERT INTO forum_story_reactions (story_id, user_id, reaction)
  VALUES (p_story_id, p_user_id, p_reaction)
  ON CONFLICT (story_id, user_id)
  DO UPDATE SET reaction = p_reaction;

  -- Notify story owner
  IF v_story.user_id != p_user_id THEN
    INSERT INTO forum_notifications (user_id, type, actor_id, story_id, content)
    VALUES (v_story.user_id, 'story_reaction', p_user_id, p_story_id, p_reaction);
  END IF;

  RETURN json_build_object('success', true, 'reaction', p_reaction);
END;
$$;

-- Function: Get active stories from followed users
CREATE OR REPLACE FUNCTION get_following_stories(p_user_id UUID)
RETURNS TABLE (
  story_id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  background_color TEXT,
  text_color TEXT,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  has_viewed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as story_id,
    s.user_id,
    p.username,
    p.avatar_url,
    s.content,
    s.media_url,
    s.media_type,
    s.background_color,
    s.text_color,
    s.views_count,
    s.created_at,
    s.expires_at,
    EXISTS(SELECT 1 FROM forum_story_views sv WHERE sv.story_id = s.id AND sv.viewer_id = p_user_id) as has_viewed
  FROM forum_stories s
  JOIN profiles p ON s.user_id = p.id
  WHERE s.is_highlight = false
    AND s.expires_at > NOW()
    AND (s.user_id = p_user_id OR s.user_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = p_user_id
    ))
  ORDER BY
    s.user_id = p_user_id DESC, -- Own stories first
    has_viewed ASC, -- Unwatched first
    s.created_at DESC;
END;
$$;

-- Function: Create a thread (multiple connected posts)
CREATE OR REPLACE FUNCTION create_thread(
  p_user_id UUID,
  p_title TEXT,
  p_posts JSONB -- Array of {content, media_url?, gif_url?, tags?}
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_thread forum_threads;
  v_post_data JSONB;
  v_post forum_posts;
  v_position INTEGER := 1;
  v_post_ids UUID[] := '{}';
BEGIN
  -- Create thread container
  INSERT INTO forum_threads (user_id, title, total_posts)
  VALUES (p_user_id, p_title, jsonb_array_length(p_posts))
  RETURNING * INTO v_thread;

  -- Create each post in the thread
  FOR v_post_data IN SELECT * FROM jsonb_array_elements(p_posts)
  LOOP
    INSERT INTO forum_posts (
      user_id,
      content,
      thread_id,
      thread_position,
      gif_url,
      tags
    )
    VALUES (
      p_user_id,
      v_post_data->>'content',
      v_thread.id,
      v_position,
      v_post_data->>'gif_url',
      COALESCE((SELECT array_agg(t::text) FROM jsonb_array_elements_text(v_post_data->'tags') t), '{}')
    )
    RETURNING * INTO v_post;

    v_post_ids := array_append(v_post_ids, v_post.id);
    v_position := v_position + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'thread_id', v_thread.id,
    'post_ids', v_post_ids
  );
END;
$$;

-- Function: Get thread posts
CREATE OR REPLACE FUNCTION get_thread_posts(p_thread_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  content TEXT,
  gif_url TEXT,
  tags TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  thread_position INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fp.id,
    fp.user_id,
    p.username,
    p.avatar_url,
    fp.content,
    fp.gif_url,
    fp.tags,
    fp.likes_count,
    fp.comments_count,
    fp.thread_position,
    fp.created_at
  FROM forum_posts fp
  JOIN profiles p ON fp.user_id = p.id
  WHERE fp.thread_id = p_thread_id
  ORDER BY fp.thread_position ASC;
END;
$$;

-- Function: Calculate hot score (Reddit algorithm)
CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_likes INTEGER,
  p_comments INTEGER,
  p_reposts INTEGER,
  p_created_at TIMESTAMPTZ
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_score INTEGER;
  v_order DECIMAL;
  v_sign INTEGER;
  v_seconds DECIMAL;
  v_epoch TIMESTAMPTZ := '1970-01-01 00:00:00'::TIMESTAMPTZ;
BEGIN
  v_score := p_likes + (p_comments * 2) + (p_reposts * 3);

  IF v_score > 0 THEN
    v_sign := 1;
  ELSIF v_score < 0 THEN
    v_sign := -1;
  ELSE
    v_sign := 0;
  END IF;

  v_order := log(greatest(abs(v_score), 1));
  v_seconds := EXTRACT(EPOCH FROM (p_created_at - v_epoch)) - 1134028003;

  RETURN round((v_sign * v_order + v_seconds / 45000)::DECIMAL, 7);
END;
$$;

-- Function: Calculate controversy score
CREATE OR REPLACE FUNCTION calculate_controversy_score(
  p_upvotes INTEGER,
  p_downvotes INTEGER
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_magnitude INTEGER;
  v_balance DECIMAL;
BEGIN
  IF p_upvotes = 0 OR p_downvotes = 0 THEN
    RETURN 0;
  END IF;

  v_magnitude := p_upvotes + p_downvotes;
  v_balance := CASE
    WHEN p_upvotes > p_downvotes THEN p_downvotes::DECIMAL / p_upvotes
    ELSE p_upvotes::DECIMAL / p_downvotes
  END;

  RETURN v_magnitude * v_balance;
END;
$$;

-- Function: Update post scores (run periodically)
CREATE OR REPLACE FUNCTION update_post_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_posts
  SET
    hot_score = calculate_hot_score(likes_count, comments_count, COALESCE(reposts_count, 0), created_at),
    rising_score = (likes_count + comments_count * 2) / (EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 + 2)
  WHERE created_at > NOW() - INTERVAL '7 days';
END;
$$;

-- Function: Process mentions in content
CREATE OR REPLACE FUNCTION process_mentions(
  p_content TEXT,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_mentioner_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mention TEXT;
  v_username TEXT;
  v_mentioned_user_id UUID;
BEGIN
  -- Find all @mentions in content
  FOR v_mention IN
    SELECT DISTINCT (regexp_matches(p_content, '@([a-zA-Z0-9_]+)', 'g'))[1]
  LOOP
    v_username := v_mention;

    -- Find user by username
    SELECT id INTO v_mentioned_user_id FROM profiles WHERE LOWER(username) = LOWER(v_username);

    IF v_mentioned_user_id IS NOT NULL AND v_mentioned_user_id != p_mentioner_id THEN
      -- Create mention record
      INSERT INTO forum_mentions (post_id, comment_id, mentioned_user_id, mentioner_id)
      VALUES (p_post_id, p_comment_id, v_mentioned_user_id, p_mentioner_id)
      ON CONFLICT DO NOTHING;

      -- Create notification
      INSERT INTO forum_notifications (user_id, type, actor_id, post_id, comment_id)
      VALUES (v_mentioned_user_id, 'mention', p_mentioner_id, p_post_id, p_comment_id);
    END IF;
  END LOOP;
END;
$$;

-- Function: Get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_unread_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  type notification_type,
  actor_username TEXT,
  actor_avatar TEXT,
  post_id UUID,
  post_preview TEXT,
  comment_id UUID,
  story_id UUID,
  content TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.type,
    p.username as actor_username,
    p.avatar_url as actor_avatar,
    n.post_id,
    CASE WHEN fp.id IS NOT NULL THEN LEFT(fp.content, 100) END as post_preview,
    n.comment_id,
    n.story_id,
    n.content,
    n.is_read,
    n.created_at
  FROM forum_notifications n
  LEFT JOIN profiles p ON n.actor_id = p.id
  LEFT JOIN forum_posts fp ON n.post_id = fp.id
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all as read
    UPDATE forum_notifications SET is_read = true WHERE user_id = p_user_id;
  ELSE
    -- Mark specific ones as read
    UPDATE forum_notifications SET is_read = true
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
END;
$$;

-- Function: Search users for mentions autocomplete
CREATE OR REPLACE FUNCTION search_users_for_mention(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  badges badge_type[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    COALESCE(array_agg(ub.badge_type) FILTER (WHERE ub.badge_type IS NOT NULL), '{}') as badges
  FROM profiles p
  LEFT JOIN user_badges ub ON p.id = ub.user_id
  WHERE p.username ILIKE p_query || '%'
  GROUP BY p.id, p.username, p.avatar_url
  ORDER BY
    p.username = p_query DESC, -- Exact match first
    p.username ILIKE p_query || '%' DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_award_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comment_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_story_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view polls" ON forum_polls FOR SELECT USING (true);
CREATE POLICY "Anyone can view poll options" ON forum_poll_options FOR SELECT USING (true);
CREATE POLICY "Users can vote on polls" ON forum_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their votes" ON forum_poll_votes FOR SELECT USING (auth.uid() = user_id);

-- Award types policies
CREATE POLICY "Anyone can view award types" ON forum_award_types FOR SELECT USING (true);

-- Post awards policies
CREATE POLICY "Anyone can view post awards" ON forum_post_awards FOR SELECT USING (true);
CREATE POLICY "Users can give awards" ON forum_post_awards FOR INSERT WITH CHECK (auth.uid() = giver_id);

-- Comment awards policies
CREATE POLICY "Anyone can view comment awards" ON forum_comment_awards FOR SELECT USING (true);
CREATE POLICY "Users can give comment awards" ON forum_comment_awards FOR INSERT WITH CHECK (auth.uid() = giver_id);

-- Threads policies
CREATE POLICY "Anyone can view threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Anyone can view active stories" ON forum_stories
  FOR SELECT USING (expires_at > NOW() OR is_highlight = true OR user_id = auth.uid());
CREATE POLICY "Users can create stories" ON forum_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their stories" ON forum_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their stories" ON forum_stories FOR DELETE USING (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Story owners can view who viewed" ON forum_story_views
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM forum_stories s WHERE s.id = story_id AND s.user_id = auth.uid())
    OR viewer_id = auth.uid()
  );
CREATE POLICY "Users can record views" ON forum_story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Story reactions policies
CREATE POLICY "Anyone can view story reactions" ON forum_story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react to stories" ON forum_story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reactions" ON forum_story_reactions FOR UPDATE USING (auth.uid() = user_id);

-- Story highlights policies
CREATE POLICY "Anyone can view highlights" ON forum_story_highlights FOR SELECT USING (true);
CREATE POLICY "Users can manage their highlights" ON forum_story_highlights
  FOR ALL USING (auth.uid() = user_id);

-- Mentions policies
CREATE POLICY "Users can view mentions to them" ON forum_mentions
  FOR SELECT USING (mentioned_user_id = auth.uid() OR mentioner_id = auth.uid());
CREATE POLICY "Users can create mentions" ON forum_mentions FOR INSERT WITH CHECK (auth.uid() = mentioner_id);
CREATE POLICY "Users can update their mentions read status" ON forum_mentions
  FOR UPDATE USING (mentioned_user_id = auth.uid());

-- Badges policies
CREATE POLICY "Anyone can view badges" ON user_badges FOR SELECT USING (true);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON forum_notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON forum_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Process mentions when post is created
CREATE OR REPLACE FUNCTION trigger_process_post_mentions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM process_mentions(NEW.content, NEW.id, NULL, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_created_mentions ON forum_posts;
CREATE TRIGGER on_post_created_mentions
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_post_mentions();

-- Trigger: Process mentions when comment is created
CREATE OR REPLACE FUNCTION trigger_process_comment_mentions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM process_mentions(NEW.content, NULL, NEW.id, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_created_mentions ON forum_comments;
CREATE TRIGGER on_comment_created_mentions
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_comment_mentions();

-- Trigger: Clean up expired stories (can be run by a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM forum_stories
  WHERE expires_at < NOW() AND is_highlight = false;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION vote_on_poll(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION give_post_award(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_story(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION view_story(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION react_to_story(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_following_stories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_thread(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_thread_posts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION search_users_for_mention(TEXT, INTEGER) TO authenticated, anon;
