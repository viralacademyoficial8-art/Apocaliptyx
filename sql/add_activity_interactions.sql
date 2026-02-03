-- ==============================================
-- ADD INTERACTIONS TO FEED ACTIVITIES
-- ==============================================
-- Execute this in Supabase SQL Editor

-- 1. ADD INTERACTION COLUMNS TO FEED_ACTIVITIES
-- ==============================================

ALTER TABLE feed_activities
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;


-- 2. CREATE ACTIVITY_LIKES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);


-- 3. CREATE ACTIVITY_COMMENTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);


-- 4. CREATE ACTIVITY_BOOKMARKS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS activity_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_bookmarks_activity_id ON activity_bookmarks(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookmarks_user_id ON activity_bookmarks(user_id);


-- 5. CREATE TRIGGERS TO UPDATE COUNTS
-- ==============================================

-- Trigger for likes count
CREATE OR REPLACE FUNCTION update_activity_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_activities SET likes_count = likes_count + 1 WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_activities SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_likes_count ON activity_likes;
CREATE TRIGGER trg_activity_likes_count
AFTER INSERT OR DELETE ON activity_likes
FOR EACH ROW EXECUTE FUNCTION update_activity_likes_count();

-- Trigger for comments count
CREATE OR REPLACE FUNCTION update_activity_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_activities SET comments_count = comments_count + 1 WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_activities SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_comments_count ON activity_comments;
CREATE TRIGGER trg_activity_comments_count
AFTER INSERT OR DELETE ON activity_comments
FOR EACH ROW EXECUTE FUNCTION update_activity_comments_count();

-- Trigger for bookmarks count
CREATE OR REPLACE FUNCTION update_activity_bookmarks_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_activities SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_activities SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_bookmarks_count ON activity_bookmarks;
CREATE TRIGGER trg_activity_bookmarks_count
AFTER INSERT OR DELETE ON activity_bookmarks
FOR EACH ROW EXECUTE FUNCTION update_activity_bookmarks_count();


-- 6. ENABLE RLS ON NEW TABLES
-- ==============================================

ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for activity_likes
CREATE POLICY "activity_likes_select_all" ON activity_likes FOR SELECT USING (true);
CREATE POLICY "activity_likes_insert_auth" ON activity_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "activity_likes_delete_own" ON activity_likes FOR DELETE USING (true);

-- Policies for activity_comments
CREATE POLICY "activity_comments_select_all" ON activity_comments FOR SELECT USING (true);
CREATE POLICY "activity_comments_insert_auth" ON activity_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "activity_comments_delete_own" ON activity_comments FOR DELETE USING (true);

-- Policies for activity_bookmarks
CREATE POLICY "activity_bookmarks_select_all" ON activity_bookmarks FOR SELECT USING (true);
CREATE POLICY "activity_bookmarks_insert_auth" ON activity_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "activity_bookmarks_delete_own" ON activity_bookmarks FOR DELETE USING (true);


-- 7. GRANT PERMISSIONS
-- ==============================================

GRANT SELECT ON activity_likes TO anon;
GRANT SELECT ON activity_likes TO authenticated;
GRANT ALL ON activity_likes TO service_role;

GRANT SELECT ON activity_comments TO anon;
GRANT SELECT ON activity_comments TO authenticated;
GRANT ALL ON activity_comments TO service_role;

GRANT SELECT ON activity_bookmarks TO anon;
GRANT SELECT ON activity_bookmarks TO authenticated;
GRANT ALL ON activity_bookmarks TO service_role;


-- 8. VERIFY
-- ==============================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'feed_activities'
AND column_name IN ('likes_count', 'comments_count', 'bookmarks_count', 'views_count');
