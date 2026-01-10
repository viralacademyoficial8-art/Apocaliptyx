-- =====================================================
-- SETUP POLLS - Ejecutar en Supabase SQL Editor
-- Este script configura las tablas y permisos para encuestas
-- =====================================================

-- 1. Crear tablas si no existen
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  multiple_choice BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id)
);

CREATE TABLE IF NOT EXISTS forum_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES forum_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON forum_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON forum_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_polls_post ON forum_polls(post_id);

-- 3. Habilitar RLS
ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes (para recrearlas)
DROP POLICY IF EXISTS "Anyone can view polls" ON forum_polls;
DROP POLICY IF EXISTS "Users can create polls" ON forum_polls;
DROP POLICY IF EXISTS "Anyone can view poll options" ON forum_poll_options;
DROP POLICY IF EXISTS "Users can create poll options" ON forum_poll_options;
DROP POLICY IF EXISTS "Anyone can view all votes" ON forum_poll_votes;
DROP POLICY IF EXISTS "Users can vote on polls" ON forum_poll_votes;
DROP POLICY IF EXISTS "Users can view their votes" ON forum_poll_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON forum_poll_votes;

-- 5. Crear políticas RLS

-- POLLS: Todos pueden ver, usuarios autenticados pueden crear
CREATE POLICY "Anyone can view polls" ON forum_polls
  FOR SELECT USING (true);

CREATE POLICY "Users can create polls" ON forum_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_posts
      WHERE forum_posts.id = post_id
      AND forum_posts.author_id = auth.uid()
    )
  );

-- POLL OPTIONS: Todos pueden ver, usuarios autenticados pueden crear
CREATE POLICY "Anyone can view poll options" ON forum_poll_options
  FOR SELECT USING (true);

CREATE POLICY "Users can create poll options" ON forum_poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_polls p
      JOIN forum_posts fp ON fp.id = p.post_id
      WHERE p.id = poll_id
      AND fp.author_id = auth.uid()
    )
  );

-- POLL VOTES: Todos pueden ver, usuarios pueden votar y cambiar votos
CREATE POLICY "Anyone can view all votes" ON forum_poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on polls" ON forum_poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON forum_poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Crear función para votar (con SECURITY DEFINER para bypass RLS)
CREATE OR REPLACE FUNCTION vote_on_poll(
  p_poll_id UUID,
  p_option_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_poll forum_polls;
  v_existing forum_poll_votes;
  v_result JSON;
BEGIN
  -- Verificar que la encuesta existe y no ha expirado
  SELECT * INTO v_poll FROM forum_polls WHERE id = p_poll_id;

  IF v_poll IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Poll not found');
  END IF;

  IF v_poll.ends_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Poll has ended');
  END IF;

  -- Para encuestas de opción única, eliminar voto anterior
  IF NOT v_poll.multiple_choice THEN
    SELECT * INTO v_existing
    FROM forum_poll_votes
    WHERE poll_id = p_poll_id AND user_id = p_user_id;

    IF v_existing IS NOT NULL THEN
      DELETE FROM forum_poll_votes WHERE id = v_existing.id;
      UPDATE forum_poll_options SET votes_count = votes_count - 1 WHERE id = v_existing.option_id;
    END IF;
  END IF;

  -- Agregar nuevo voto
  INSERT INTO forum_poll_votes (poll_id, option_id, user_id)
  VALUES (p_poll_id, p_option_id, p_user_id)
  ON CONFLICT (poll_id, user_id, option_id) DO NOTHING;

  -- Actualizar contador de votos
  UPDATE forum_poll_options SET votes_count = votes_count + 1 WHERE id = p_option_id;

  -- Retornar datos actualizados
  SELECT json_build_object(
    'success', true,
    'options', (
      SELECT json_agg(json_build_object(
        'id', po.id,
        'option_text', po.option_text,
        'votes_count', po.votes_count
      ) ORDER BY po.option_order)
      FROM forum_poll_options po
      WHERE po.poll_id = p_poll_id
    ),
    'total_votes', (SELECT COALESCE(SUM(votes_count), 0) FROM forum_poll_options WHERE poll_id = p_poll_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 7. Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION vote_on_poll(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION vote_on_poll(UUID, UUID, UUID) TO anon;

-- 8. Verificar que todo está creado correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas de encuestas creadas/verificadas';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Función vote_on_poll creada';
  RAISE NOTICE '✅ Setup de encuestas completado!';
END $$;
