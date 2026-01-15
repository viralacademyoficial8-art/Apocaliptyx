-- Migration: Add category column to community_posts
-- Description: Allow posts to be categorized

-- Add category column to community_posts (using text to store category name directly)
ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);

-- Update existing posts to have 'general' category
UPDATE community_posts SET category = 'general' WHERE category IS NULL;
