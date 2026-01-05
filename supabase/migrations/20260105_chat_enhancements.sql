-- Migración: Chat Enhancements (Grupos, Favoritos, Reacciones)
-- Fecha: 2026-01-05

-- =============================================
-- 1. Actualizar tabla conversations para soportar grupos
-- =============================================

-- Agregar columna type si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'type') THEN
    ALTER TABLE conversations ADD COLUMN type VARCHAR(20) DEFAULT 'direct';
  END IF;
END $$;

-- Agregar columnas para grupos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'group_name') THEN
    ALTER TABLE conversations ADD COLUMN group_name VARCHAR(100);
    ALTER TABLE conversations ADD COLUMN group_description TEXT;
    ALTER TABLE conversations ADD COLUMN group_avatar TEXT;
    ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;
END $$;

-- Índice para tipo de conversación
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);

-- =============================================
-- 2. Tabla para miembros de grupo
-- =============================================

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_conversation ON group_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- =============================================
-- 3. Tabla para preferencias de conversación
-- =============================================

CREATE TABLE IF NOT EXISTS conversation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_prefs_user ON conversation_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_prefs_favorite ON conversation_preferences(is_favorite) WHERE is_favorite = TRUE;

-- =============================================
-- 4. Actualizar tabla messages para respuestas y sistema
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
    ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
    ALTER TABLE messages ADD COLUMN is_system BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Permitir sender_id NULL para mensajes de sistema
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- =============================================
-- 5. Tabla para reacciones de mensajes
-- =============================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

-- =============================================
-- 6. RLS Policies
-- =============================================

-- Habilitar RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies para group_members
CREATE POLICY IF NOT EXISTS "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.conversation_id = group_members.conversation_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage group members"
  ON group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.conversation_id = group_members.conversation_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'moderator')
    )
  );

-- Policies para conversation_preferences
CREATE POLICY IF NOT EXISTS "Users can manage their own preferences"
  ON conversation_preferences FOR ALL
  USING (user_id = auth.uid());

-- Policies para message_reactions
CREATE POLICY IF NOT EXISTS "Users can view reactions"
  ON message_reactions FOR SELECT
  USING (TRUE);

CREATE POLICY IF NOT EXISTS "Users can add their own reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- 7. Función para actualizar timestamp
-- =============================================

CREATE OR REPLACE FUNCTION update_conversation_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_preferences_timestamp ON conversation_preferences;
CREATE TRIGGER update_conversation_preferences_timestamp
  BEFORE UPDATE ON conversation_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_preferences_updated_at();

-- =============================================
-- Done!
-- =============================================
