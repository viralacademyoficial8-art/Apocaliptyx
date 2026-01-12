-- Create forum_categories table if not exists
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (everyone can read)
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
CREATE POLICY "Anyone can view categories" ON forum_categories
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON forum_categories TO anon;
GRANT SELECT ON forum_categories TO authenticated;

-- Insert default categories if they don't exist
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order, is_active)
VALUES
  ('General', 'general', 'Discusiones generales sobre cualquier tema', '💬', 'gray', 1, true),
  ('Predicciones', 'predicciones', 'Comparte y discute predicciones del futuro', '🔮', 'purple', 2, true),
  ('Ayuda', 'ayuda', 'Preguntas y respuestas de la comunidad', '❓', 'blue', 3, true),
  ('Sugerencias', 'sugerencias', 'Ideas y sugerencias para mejorar la plataforma', '💡', 'yellow', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Make sure forum_posts has category_id column
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
