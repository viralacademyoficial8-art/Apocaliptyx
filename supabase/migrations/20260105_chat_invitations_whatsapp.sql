-- Migración: Sistema de Invitaciones y Mejoras WhatsApp-like
-- Fecha: 2026-01-05

-- =============================================
-- 1. Agregar código de invitación a conversaciones
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'invite_code') THEN
    ALTER TABLE conversations ADD COLUMN invite_code VARCHAR(20) UNIQUE;
    ALTER TABLE conversations ADD COLUMN invite_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE conversations ADD COLUMN max_members INTEGER DEFAULT NULL; -- NULL = ilimitado
  END IF;
END $$;

-- Generar códigos únicos para grupos existentes
UPDATE conversations
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE type = 'group' AND invite_code IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_invite_code ON conversations(invite_code);

-- =============================================
-- 2. Tabla de invitaciones a grupos
-- =============================================

CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(conversation_id, invited_user_id, status)
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_user ON group_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status) WHERE status = 'pending';

-- =============================================
-- 3. Estado en línea y última conexión
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_online') THEN
    ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- =============================================
-- 4. Confirmación de lectura (doble check)
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'delivered_at') THEN
    ALTER TABLE messages ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- =============================================
-- 5. Estados/Historias (como WhatsApp Status)
-- =============================================

CREATE TABLE IF NOT EXISTS user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(20), -- 'image', 'video', 'text'
  background_color VARCHAR(20) DEFAULT '#6366f1',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_user_status_user ON user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_expires ON user_status(expires_at);

-- Tabla de vistas de estados
CREATE TABLE IF NOT EXISTS status_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id UUID NOT NULL REFERENCES user_status(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(status_id, viewer_id)
);

-- =============================================
-- 6. Mensajes fijados en conversaciones
-- =============================================

CREATE TABLE IF NOT EXISTS pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, message_id)
);

-- =============================================
-- 7. Mensajes destacados/guardados
-- =============================================

CREATE TABLE IF NOT EXISTS saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- =============================================
-- 8. Bloqueo de usuarios en chat
-- =============================================

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);

-- =============================================
-- 9. Configuración de privacidad del chat
-- =============================================

CREATE TABLE IF NOT EXISTS chat_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  show_last_seen BOOLEAN DEFAULT TRUE,
  show_read_receipts BOOLEAN DEFAULT TRUE,
  who_can_message VARCHAR(20) DEFAULT 'everyone' CHECK (who_can_message IN ('everyone', 'followers', 'nobody')),
  who_can_add_to_groups VARCHAR(20) DEFAULT 'everyone' CHECK (who_can_add_to_groups IN ('everyone', 'followers', 'nobody')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. Mensajes de voz (preparación)
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'voice_duration') THEN
    ALTER TABLE messages ADD COLUMN voice_duration INTEGER; -- duración en segundos
    ALTER TABLE messages ADD COLUMN is_voice_message BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- =============================================
-- 11. Etiquetas/Labels para conversaciones
-- =============================================

CREATE TABLE IF NOT EXISTS conversation_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS conversation_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES conversation_labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, label_id, user_id)
);

-- =============================================
-- 12. RLS Policies
-- =============================================

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_label_assignments ENABLE ROW LEVEL SECURITY;

-- Policies para group_invitations
DROP POLICY IF EXISTS "Users can view their invitations" ON group_invitations;
CREATE POLICY "Users can view their invitations" ON group_invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create invitations" ON group_invitations;
CREATE POLICY "Users can create invitations" ON group_invitations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update invitations" ON group_invitations;
CREATE POLICY "Users can update invitations" ON group_invitations FOR UPDATE USING (true);

-- Policies para user_status
DROP POLICY IF EXISTS "Anyone can view status" ON user_status;
CREATE POLICY "Anyone can view status" ON user_status FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create status" ON user_status;
CREATE POLICY "Users can create status" ON user_status FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own status" ON user_status;
CREATE POLICY "Users can delete own status" ON user_status FOR DELETE USING (true);

-- Policies para otras tablas
DROP POLICY IF EXISTS "status_views_policy" ON status_views;
CREATE POLICY "status_views_policy" ON status_views FOR ALL USING (true);

DROP POLICY IF EXISTS "pinned_messages_policy" ON pinned_messages;
CREATE POLICY "pinned_messages_policy" ON pinned_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "saved_messages_policy" ON saved_messages;
CREATE POLICY "saved_messages_policy" ON saved_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "blocked_users_policy" ON blocked_users;
CREATE POLICY "blocked_users_policy" ON blocked_users FOR ALL USING (true);

DROP POLICY IF EXISTS "chat_privacy_policy" ON chat_privacy_settings;
CREATE POLICY "chat_privacy_policy" ON chat_privacy_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "labels_policy" ON conversation_labels;
CREATE POLICY "labels_policy" ON conversation_labels FOR ALL USING (true);

DROP POLICY IF EXISTS "label_assignments_policy" ON conversation_label_assignments;
CREATE POLICY "label_assignments_policy" ON conversation_label_assignments FOR ALL USING (true);

-- =============================================
-- 13. Función para limpiar estados expirados
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_expired_status()
RETURNS void AS $$
BEGIN
  DELETE FROM user_status WHERE expires_at < NOW();
  DELETE FROM group_invitations WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Done!
-- =============================================
