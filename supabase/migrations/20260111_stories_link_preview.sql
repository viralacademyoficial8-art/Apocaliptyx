-- Add link preview support to forum_stories table

-- Add link_url column for storing the URL
ALTER TABLE forum_stories
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Add link_preview column for storing the preview metadata as JSON
ALTER TABLE forum_stories
ADD COLUMN IF NOT EXISTS link_preview JSONB;

-- Create index for stories with links
CREATE INDEX IF NOT EXISTS idx_forum_stories_link_url
ON forum_stories(link_url)
WHERE link_url IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN forum_stories.link_url IS 'URL shared in the story';
COMMENT ON COLUMN forum_stories.link_preview IS 'Cached Open Graph metadata for the link (title, description, image, siteName)';
