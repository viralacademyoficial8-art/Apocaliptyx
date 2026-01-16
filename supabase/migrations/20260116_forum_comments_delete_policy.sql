-- Add UPDATE policy for forum_comments to allow authors to soft-delete their comments
-- This policy allows users to update their own comments (including changing status to 'deleted')

-- First, ensure RLS is enabled on the table
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update own comments" ON forum_comments;

-- Create policy to allow users to update their own comments
CREATE POLICY "Users can update own comments" ON forum_comments
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Also ensure there's a SELECT policy so users can see comments
DROP POLICY IF EXISTS "Anyone can view published comments" ON forum_comments;
CREATE POLICY "Anyone can view published comments" ON forum_comments
  FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

-- Ensure INSERT policy exists
DROP POLICY IF EXISTS "Users can create comments" ON forum_comments;
CREATE POLICY "Users can create comments" ON forum_comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ============================================
-- FORUM POSTS POLICIES
-- ============================================

-- Enable RLS on forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own posts (for soft delete)
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow anyone to view published posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON forum_posts;
CREATE POLICY "Anyone can view published posts" ON forum_posts
  FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

-- Allow users to create posts
DROP POLICY IF EXISTS "Users can create posts" ON forum_posts;
CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);
