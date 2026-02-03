-- ==============================================
-- FIX ACTIVITY_COMMENTS TABLE
-- ==============================================
-- Execute this in Supabase SQL Editor
-- Fixes the user_id column type from TEXT to UUID

-- 1. Drop existing foreign key constraint and table
DROP TABLE IF EXISTS activity_comments CASCADE;

-- 2. Recreate with correct UUID type
CREATE TABLE activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user_id ON activity_comments(user_id);

-- 4. Recreate trigger for comments count
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

-- 5. Enable RLS
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- 6. Create policies
DROP POLICY IF EXISTS "activity_comments_select_all" ON activity_comments;
DROP POLICY IF EXISTS "activity_comments_insert_auth" ON activity_comments;
DROP POLICY IF EXISTS "activity_comments_delete_own" ON activity_comments;

CREATE POLICY "activity_comments_select_all" ON activity_comments FOR SELECT USING (true);
CREATE POLICY "activity_comments_insert_auth" ON activity_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "activity_comments_delete_own" ON activity_comments FOR DELETE USING (true);

-- 7. Grant permissions
GRANT SELECT ON activity_comments TO anon;
GRANT SELECT ON activity_comments TO authenticated;
GRANT ALL ON activity_comments TO service_role;

-- 8. Verify
SELECT 'activity_comments table fixed!' as status;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_comments';
