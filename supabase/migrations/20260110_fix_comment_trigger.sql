-- =====================================================
-- FIX: REMOVE INCORRECT TRIGGER ON community_post_comments
-- =====================================================
-- The error "record 'new' has no field 'user_id'" is caused by a trigger
-- that references user_id when community_post_comments uses author_id

-- Drop any mentions trigger that might be attached to community_post_comments
DROP TRIGGER IF EXISTS on_comment_created_mentions ON community_post_comments;
DROP TRIGGER IF EXISTS on_community_comment_created_mentions ON community_post_comments;
DROP TRIGGER IF EXISTS trigger_community_comment_mentions ON community_post_comments;

-- Create a proper function for community comment mentions using author_id
CREATE OR REPLACE FUNCTION trigger_process_community_comment_mentions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if process_mentions function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_mentions') THEN
    PERFORM process_mentions(NEW.content, NULL, NEW.id, NEW.author_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optionally add the mentions trigger with the correct function
-- Uncomment below if you want mentions support for community comments
-- DROP TRIGGER IF EXISTS on_community_comment_mentions ON community_post_comments;
-- CREATE TRIGGER on_community_comment_mentions
--   AFTER INSERT ON community_post_comments
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_process_community_comment_mentions();

-- Re-enable RLS on community_post_comments (if it was disabled)
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- Ensure correct policies exist
DROP POLICY IF EXISTS "Anyone can view comments" ON community_post_comments;
CREATE POLICY "Anyone can view comments" ON community_post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON community_post_comments;
CREATE POLICY "Users can create comments" ON community_post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own comments" ON community_post_comments;
CREATE POLICY "Authors can update own comments" ON community_post_comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own comments" ON community_post_comments;
CREATE POLICY "Authors can delete own comments" ON community_post_comments
  FOR DELETE USING (auth.uid() = author_id);
