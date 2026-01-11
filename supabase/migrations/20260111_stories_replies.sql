-- Create table for story replies/messages
CREATE TABLE IF NOT EXISTS forum_story_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES forum_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for faster queries
  CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES forum_stories(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for getting replies by story
CREATE INDEX IF NOT EXISTS idx_story_replies_story_id ON forum_story_replies(story_id);

-- Index for getting replies by user (replier)
CREATE INDEX IF NOT EXISTS idx_story_replies_user_id ON forum_story_replies(user_id);

-- Index for unread replies
CREATE INDEX IF NOT EXISTS idx_story_replies_unread ON forum_story_replies(story_id, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE forum_story_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own replies
CREATE POLICY "Users can insert their own replies" ON forum_story_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Story owners can read replies to their stories
CREATE POLICY "Story owners can read replies" ON forum_story_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_stories
      WHERE forum_stories.id = forum_story_replies.story_id
      AND forum_stories.user_id = auth.uid()
    )
  );

-- Policy: Users can read their own sent replies
CREATE POLICY "Users can read their own replies" ON forum_story_replies
  FOR SELECT USING (auth.uid() = user_id);
