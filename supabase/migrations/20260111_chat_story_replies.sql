-- Add story reference fields to messages table for story replies
-- This allows chat messages to reference a story (like Instagram/Facebook story replies)

-- Add story_id column to reference the story being replied to
ALTER TABLE messages ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES forum_stories(id) ON DELETE SET NULL;

-- Add story_preview JSONB to store story preview data (in case story expires/is deleted)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS story_preview JSONB;

-- Index for finding messages by story
CREATE INDEX IF NOT EXISTS idx_messages_story_id ON messages(story_id) WHERE story_id IS NOT NULL;

-- Comment explaining the fields
COMMENT ON COLUMN messages.story_id IS 'Reference to the forum_stories table when this message is a reply to a story';
COMMENT ON COLUMN messages.story_preview IS 'Cached preview of the story at the time of reply (content, mediaUrl, username, avatarUrl, etc.)';
