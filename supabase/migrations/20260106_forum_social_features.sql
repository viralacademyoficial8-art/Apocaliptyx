-- =========================================
-- FORUM SOCIAL FEATURES MIGRATION
-- Add reactions, bookmarks, reposts, media, trending, following feed
-- Created: 2026-01-06
-- =========================================

-- =====================
-- 1. REACTIONS SYSTEM
-- =====================
-- Multiple reaction types like Twitter/Facebook (replaces simple likes)

-- Create reactions type enum
CREATE TYPE forum_reaction_type AS ENUM ('fire', 'love', 'clap', 'mindblown', 'sad', 'laugh');

-- Post reactions table (replaces/extends forum_post_likes)
CREATE TABLE IF NOT EXISTS forum_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type forum_reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Comment reactions table
CREATE TABLE IF NOT EXISTS forum_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type forum_reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Add reaction counters to posts table
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS reactions_count JSONB DEFAULT '{"fire":0,"love":0,"clap":0,"mindblown":0,"sad":0,"laugh":0}'::jsonb;

-- Add reaction counters to comments table
ALTER TABLE forum_comments
ADD COLUMN IF NOT EXISTS reactions_count JSONB DEFAULT '{"fire":0,"love":0,"clap":0,"mindblown":0,"sad":0,"laugh":0}'::jsonb;

-- Indexes for reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON forum_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON forum_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON forum_comment_reactions(comment_id);

-- =====================
-- 2. BOOKMARKS SYSTEM
-- =====================
-- Save posts for later (like Twitter bookmarks)

CREATE TABLE IF NOT EXISTS forum_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Add bookmark counter to posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER DEFAULT 0;

-- Index for quick bookmark lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON forum_bookmarks(post_id);

-- =====================
-- 3. REPOST/SHARE SYSTEM
-- =====================
-- Share posts with optional quote (like Twitter retweet/quote tweet)

CREATE TABLE IF NOT EXISTS forum_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  quote_content TEXT DEFAULT NULL, -- For quote reposts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, original_post_id) -- Can only repost once (without quote)
);

-- Add repost counter to posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- Add original_post_id to forum_posts for quote posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE;

-- Index for reposts
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON forum_reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original_post ON forum_reposts(original_post_id);

-- =====================
-- 4. MEDIA ATTACHMENTS
-- =====================
-- Images and media in posts (like Instagram/Twitter)

CREATE TABLE IF NOT EXISTS forum_post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image', -- 'image', 'video', 'gif'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add has_media flag to posts for quick filtering
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS has_media BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS media_count INTEGER DEFAULT 0;

-- Index for media
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON forum_post_media(post_id);

-- =====================
-- 5. TRENDING SYSTEM
-- =====================
-- Track trending tags and topics

CREATE TABLE IF NOT EXISTS forum_trending_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(50) NOT NULL,
  post_count INTEGER DEFAULT 1,
  engagement_score DECIMAL(10,2) DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(tag, period_start)
);

-- Aggregated tag stats
CREATE TABLE IF NOT EXISTS forum_tag_stats (
  tag VARCHAR(50) PRIMARY KEY,
  total_posts INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  weekly_posts INTEGER DEFAULT 0,
  weekly_engagement DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Index for trending queries
CREATE INDEX IF NOT EXISTS idx_trending_tags_score ON forum_trending_tags(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_tags_period ON forum_trending_tags(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tag_stats_weekly ON forum_tag_stats(weekly_engagement DESC);

-- =====================
-- 6. USER FOLLOWS SYSTEM
-- =====================
-- For "Following" feed filter

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add follower/following counts to users if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- =====================
-- 7. POST SHARES TRACKING
-- =====================
-- Track external shares (to clipboard, social media)

CREATE TABLE IF NOT EXISTS forum_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  share_type VARCHAR(20) NOT NULL DEFAULT 'clipboard', -- 'clipboard', 'twitter', 'whatsapp', 'facebook'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add share counter to posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Index for shares
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON forum_shares(post_id);

-- =====================
-- 8. RPC FUNCTIONS
-- =====================

-- Function to toggle reaction on post
CREATE OR REPLACE FUNCTION toggle_post_reaction(
  p_post_id UUID,
  p_user_id UUID,
  p_reaction_type forum_reaction_type
) RETURNS JSONB AS $$
DECLARE
  existing_reaction UUID;
  current_counts JSONB;
  new_counts JSONB;
  reaction_added BOOLEAN;
BEGIN
  -- Check if reaction exists
  SELECT id INTO existing_reaction
  FROM forum_post_reactions
  WHERE post_id = p_post_id AND user_id = p_user_id AND reaction_type = p_reaction_type;

  -- Get current counts
  SELECT reactions_count INTO current_counts
  FROM forum_posts WHERE id = p_post_id;

  IF current_counts IS NULL THEN
    current_counts := '{"fire":0,"love":0,"clap":0,"mindblown":0,"sad":0,"laugh":0}'::jsonb;
  END IF;

  IF existing_reaction IS NOT NULL THEN
    -- Remove reaction
    DELETE FROM forum_post_reactions WHERE id = existing_reaction;
    new_counts := jsonb_set(current_counts, ARRAY[p_reaction_type::text],
      to_jsonb(GREATEST(0, (current_counts->>p_reaction_type::text)::integer - 1)));
    reaction_added := FALSE;
  ELSE
    -- Add reaction
    INSERT INTO forum_post_reactions (post_id, user_id, reaction_type)
    VALUES (p_post_id, p_user_id, p_reaction_type);
    new_counts := jsonb_set(current_counts, ARRAY[p_reaction_type::text],
      to_jsonb((current_counts->>p_reaction_type::text)::integer + 1));
    reaction_added := TRUE;
  END IF;

  -- Update post counts
  UPDATE forum_posts SET reactions_count = new_counts WHERE id = p_post_id;

  RETURN jsonb_build_object(
    'added', reaction_added,
    'counts', new_counts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle bookmark
CREATE OR REPLACE FUNCTION toggle_bookmark(
  p_post_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  existing_bookmark UUID;
  new_count INTEGER;
  bookmarked BOOLEAN;
BEGIN
  SELECT id INTO existing_bookmark
  FROM forum_bookmarks WHERE post_id = p_post_id AND user_id = p_user_id;

  IF existing_bookmark IS NOT NULL THEN
    DELETE FROM forum_bookmarks WHERE id = existing_bookmark;
    UPDATE forum_posts SET bookmarks_count = GREATEST(0, bookmarks_count - 1)
    WHERE id = p_post_id RETURNING bookmarks_count INTO new_count;
    bookmarked := FALSE;
  ELSE
    INSERT INTO forum_bookmarks (post_id, user_id) VALUES (p_post_id, p_user_id);
    UPDATE forum_posts SET bookmarks_count = bookmarks_count + 1
    WHERE id = p_post_id RETURNING bookmarks_count INTO new_count;
    bookmarked := TRUE;
  END IF;

  RETURN jsonb_build_object('bookmarked', bookmarked, 'count', new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create repost
CREATE OR REPLACE FUNCTION create_repost(
  p_original_post_id UUID,
  p_user_id UUID,
  p_quote_content TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  existing_repost UUID;
  new_post_id UUID;
BEGIN
  -- Check for existing repost without quote
  IF p_quote_content IS NULL THEN
    SELECT id INTO existing_repost
    FROM forum_reposts
    WHERE original_post_id = p_original_post_id AND user_id = p_user_id AND quote_content IS NULL;

    IF existing_repost IS NOT NULL THEN
      RETURN jsonb_build_object('success', FALSE, 'error', 'Ya compartiste esta publicación');
    END IF;
  END IF;

  -- Create repost record
  INSERT INTO forum_reposts (original_post_id, user_id, quote_content)
  VALUES (p_original_post_id, p_user_id, p_quote_content)
  RETURNING id INTO new_post_id;

  -- Update repost counter
  UPDATE forum_posts SET reposts_count = reposts_count + 1 WHERE id = p_original_post_id;

  RETURN jsonb_build_object('success', TRUE, 'repost_id', new_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to follow user
CREATE OR REPLACE FUNCTION toggle_follow_user(
  p_follower_id UUID,
  p_following_id UUID
) RETURNS JSONB AS $$
DECLARE
  existing_follow UUID;
  is_following BOOLEAN;
BEGIN
  IF p_follower_id = p_following_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'No puedes seguirte a ti mismo');
  END IF;

  SELECT id INTO existing_follow
  FROM user_follows WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF existing_follow IS NOT NULL THEN
    -- Unfollow
    DELETE FROM user_follows WHERE id = existing_follow;
    UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = p_following_id;
    UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = p_follower_id;
    is_following := FALSE;
  ELSE
    -- Follow
    INSERT INTO user_follows (follower_id, following_id) VALUES (p_follower_id, p_following_id);
    UPDATE users SET followers_count = followers_count + 1 WHERE id = p_following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = p_follower_id;
    is_following := TRUE;
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'following', is_following);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending tags
CREATE OR REPLACE FUNCTION get_trending_tags(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(tag VARCHAR, post_count INTEGER, engagement_score DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT ts.tag, ts.weekly_posts, ts.weekly_engagement
  FROM forum_tag_stats ts
  WHERE ts.weekly_posts > 0
  ORDER BY ts.weekly_engagement DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posts from followed users
CREATE OR REPLACE FUNCTION get_following_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS SETOF forum_posts AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM forum_posts p
  INNER JOIN user_follows f ON f.following_id = p.author_id
  WHERE f.follower_id = p_user_id AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trending tags (call periodically)
CREATE OR REPLACE FUNCTION update_tag_stats() RETURNS void AS $$
DECLARE
  tag_record RECORD;
BEGIN
  -- Reset weekly counters
  UPDATE forum_tag_stats SET
    weekly_posts = 0,
    weekly_engagement = 0,
    last_updated = NOW();

  -- Calculate stats for each tag from recent posts
  FOR tag_record IN
    SELECT unnest(tags) as tag, COUNT(*) as count
    FROM forum_posts
    WHERE status = 'published'
    AND created_at > NOW() - INTERVAL '7 days'
    GROUP BY unnest(tags)
  LOOP
    INSERT INTO forum_tag_stats (tag, weekly_posts, total_posts)
    VALUES (tag_record.tag, tag_record.count, tag_record.count)
    ON CONFLICT (tag) DO UPDATE SET
      weekly_posts = tag_record.count,
      total_posts = forum_tag_stats.total_posts + tag_record.count,
      last_updated = NOW();
  END LOOP;

  -- Calculate engagement score
  UPDATE forum_tag_stats SET
    weekly_engagement = weekly_posts * 10 + total_reactions + total_comments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 9. ENABLE RLS
-- =====================

ALTER TABLE forum_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY "Anyone can view reactions" ON forum_post_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reactions" ON forum_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON forum_post_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment reactions" ON forum_comment_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated can add comment reactions" ON forum_comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment reactions" ON forum_comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for bookmarks (private to user)
CREATE POLICY "Users can view own bookmarks" ON forum_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add bookmarks" ON forum_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON forum_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Policies for reposts
CREATE POLICY "Anyone can view reposts" ON forum_reposts FOR SELECT USING (true);
CREATE POLICY "Users can create reposts" ON forum_reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reposts" ON forum_reposts FOR DELETE USING (auth.uid() = user_id);

-- Policies for media
CREATE POLICY "Anyone can view media" ON forum_post_media FOR SELECT USING (true);
CREATE POLICY "Authenticated can add media" ON forum_post_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own post media" ON forum_post_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND author_id = auth.uid())
);

-- Policies for shares
CREATE POLICY "Anyone can view shares" ON forum_shares FOR SELECT USING (true);
CREATE POLICY "Anyone can create shares" ON forum_shares FOR INSERT WITH CHECK (true);

-- Policies for follows
CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- =====================
-- 10. GRANT PERMISSIONS
-- =====================

GRANT ALL ON forum_post_reactions TO authenticated;
GRANT ALL ON forum_comment_reactions TO authenticated;
GRANT ALL ON forum_bookmarks TO authenticated;
GRANT ALL ON forum_reposts TO authenticated;
GRANT ALL ON forum_post_media TO authenticated;
GRANT ALL ON forum_shares TO authenticated;
GRANT ALL ON forum_trending_tags TO authenticated;
GRANT ALL ON forum_tag_stats TO authenticated;
GRANT ALL ON user_follows TO authenticated;

GRANT SELECT ON forum_post_reactions TO anon;
GRANT SELECT ON forum_comment_reactions TO anon;
GRANT SELECT ON forum_reposts TO anon;
GRANT SELECT ON forum_post_media TO anon;
GRANT SELECT ON forum_shares TO anon;
GRANT SELECT ON forum_trending_tags TO anon;
GRANT SELECT ON forum_tag_stats TO anon;
GRANT SELECT ON user_follows TO anon;

-- Grant function execution
GRANT EXECUTE ON FUNCTION toggle_post_reaction TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_bookmark TO authenticated;
GRANT EXECUTE ON FUNCTION create_repost TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_follow_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_tags TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_following_feed TO authenticated;
GRANT EXECUTE ON FUNCTION update_tag_stats TO authenticated;
