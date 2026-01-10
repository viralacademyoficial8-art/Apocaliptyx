-- =====================================================
-- ADD REPLY SUPPORT TO COMMUNITY POST COMMENTS
-- =====================================================

-- Add parent_id column for threaded replies
ALTER TABLE community_post_comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE;

-- Add reply_to_username for mentioning who you're replying to
ALTER TABLE community_post_comments
ADD COLUMN IF NOT EXISTS reply_to_username TEXT;

-- Add replies_count to track number of replies
ALTER TABLE community_post_comments
ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;

-- Add index for faster queries on replies
CREATE INDEX IF NOT EXISTS idx_community_post_comments_parent
ON community_post_comments(parent_id);

-- Function to increment replies count
CREATE OR REPLACE FUNCTION increment_replies_count(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_post_comments
  SET replies_count = COALESCE(replies_count, 0) + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement replies count
CREATE OR REPLACE FUNCTION decrement_replies_count(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_post_comments
  SET replies_count = GREATEST(0, COALESCE(replies_count, 0) - 1)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;
