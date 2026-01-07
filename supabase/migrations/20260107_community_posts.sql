-- Migration: Community Posts System
-- Description: Add tables for community posts and likes

-- =====================================================
-- COMMUNITY POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY POST LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =====================================================
-- COMMUNITY POST COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user ON community_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post ON community_post_comments(post_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- Community Posts Policies
CREATE POLICY "Anyone can view community posts" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
      AND is_banned = false
    )
  );

CREATE POLICY "Authors can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete posts" ON community_posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'moderator')
    )
  );

-- Community Post Likes Policies
CREATE POLICY "Anyone can view post likes" ON community_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON community_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON community_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Community Post Comments Policies
CREATE POLICY "Anyone can view comments" ON community_post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON community_post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments" ON community_post_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON community_post_comments
  FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- ADDITIONAL POLICIES FOR COMMUNITIES TABLE
-- =====================================================
-- Allow authenticated users to create communities
DROP POLICY IF EXISTS "Users can create communities" ON communities;
CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Allow owners/admins to update communities
DROP POLICY IF EXISTS "Owners can update communities" ON communities;
CREATE POLICY "Owners can update communities" ON communities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Allow owners to delete communities
DROP POLICY IF EXISTS "Owners can delete communities" ON communities;
CREATE POLICY "Owners can delete communities" ON communities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- =====================================================
-- FUNCTIONS FOR INCREMENTING/DECREMENTING COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION increment_community_posts(community_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE communities SET posts_count = posts_count + 1 WHERE id = community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_community_posts(community_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE communities SET posts_count = GREATEST(0, posts_count - 1) WHERE id = community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_comments(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_comments(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_community_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_posts_timestamp ON community_posts;
CREATE TRIGGER update_community_posts_timestamp
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_timestamp();

DROP TRIGGER IF EXISTS update_community_post_comments_timestamp ON community_post_comments;
CREATE TRIGGER update_community_post_comments_timestamp
  BEFORE UPDATE ON community_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_timestamp();
