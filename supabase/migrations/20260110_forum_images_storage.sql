-- =====================================================
-- FORUM IMAGES STORAGE SETUP
-- =====================================================

-- Create storage bucket for forum images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-images',
  'forum-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for forum-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'forum-images');

-- Allow anyone to view forum images (public)
CREATE POLICY "Anyone can view forum images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'forum-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own forum images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- FORUM POST MEDIA TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forum_post_media_post_id ON forum_post_media(post_id);

-- RLS for forum_post_media
ALTER TABLE forum_post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post media" ON forum_post_media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert media" ON forum_post_media
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can delete own media" ON forum_post_media
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forum_posts
      WHERE id = forum_post_media.post_id
      AND author_id = auth.uid()
    )
  );
