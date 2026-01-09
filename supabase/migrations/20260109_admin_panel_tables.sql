-- =====================================================
-- ADMIN PANEL COMPLETE TABLES
-- Migration for all admin functionality
-- =====================================================

-- =====================================================
-- CHAT SYSTEM (Base Tables)
-- =====================================================

-- Chat conversations (direct and group)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct', -- 'direct' or 'group'
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  -- Group fields
  group_name TEXT,
  group_avatar TEXT,
  group_description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE,
  invite_enabled BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 256,
  -- Timestamps
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- File attachments
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  -- Reply system
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Indexes for chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participants ON chat_conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- =====================================================
-- ANNOUNCEMENTS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'update'
  priority INTEGER DEFAULT 0, -- Higher = more important
  -- Targeting
  target_audience TEXT DEFAULT 'all', -- 'all', 'active', 'premium', 'new', specific role
  target_roles TEXT[] DEFAULT '{}',
  -- Display
  is_banner BOOLEAN DEFAULT false,
  is_modal BOOLEAN DEFAULT false,
  is_dismissible BOOLEAN DEFAULT true,
  -- Scheduling
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  -- Status
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  -- Metadata
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User announcement reads
CREATE TABLE IF NOT EXISTS user_announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  UNIQUE(user_id, announcement_id)
);

-- =====================================================
-- PROMO CODES SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  -- Type and value
  type TEXT NOT NULL DEFAULT 'free_coins', -- 'free_coins', 'percentage', 'fixed'
  value INTEGER NOT NULL DEFAULT 0, -- Amount or percentage
  -- Limits
  min_purchase INTEGER,
  max_discount INTEGER,
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  -- Targeting
  applicable_to TEXT DEFAULT 'all', -- 'all', 'new_users', 'premium', specific items
  applicable_items UUID[] DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'expired'
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo code usage tracking
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_saved INTEGER DEFAULT 0,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id)
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- 'general', 'gamification', 'moderation', 'features'
  is_public BOOLEAN DEFAULT false, -- Can be read by clients
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system config
INSERT INTO system_config (key, value, description, category, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'general', true),
  ('maintenance_message', '"We are performing scheduled maintenance"', 'Message shown during maintenance', 'general', true),
  ('registration_enabled', 'true', 'Allow new user registrations', 'general', true),
  ('default_ap_coins', '100', 'AP Coins given to new users', 'gamification', false),
  ('daily_login_bonus', '10', 'Daily login AP Coins bonus', 'gamification', false),
  ('max_predictions_per_day', '50', 'Max predictions per day for free users', 'gamification', false),
  ('prediction_min_stake', '10', 'Minimum AP Coins to stake on prediction', 'gamification', true),
  ('prediction_max_stake', '10000', 'Maximum AP Coins to stake on prediction', 'gamification', true),
  ('steal_fee_percent', '10', 'Fee percentage for scenario stealing', 'gamification', true),
  ('xp_per_level', '100', 'XP required per level', 'gamification', false),
  ('content_moderation_enabled', 'true', 'Enable AI content moderation', 'moderation', false),
  ('profanity_filter_enabled', 'true', 'Enable profanity filter', 'moderation', false),
  ('spam_detection_enabled', 'true', 'Enable spam detection', 'moderation', false),
  ('max_reports_before_review', '3', 'Reports needed for auto-review', 'moderation', false),
  ('feature_reels', 'true', 'Enable reels feature', 'features', true),
  ('feature_live_streaming', 'true', 'Enable live streaming', 'features', true),
  ('feature_audio_posts', 'true', 'Enable audio posts', 'features', true),
  ('feature_stories', 'true', 'Enable stories', 'features', true),
  ('feature_communities', 'true', 'Enable communities', 'features', true),
  ('feature_tournaments', 'true', 'Enable tournaments', 'features', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- SCENARIO REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS scenario_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  -- Resolution
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  action_taken TEXT, -- 'none', 'warning', 'edited', 'hidden', 'deleted', 'user_banned'
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Content reports (generic for posts, comments, etc.)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'post', 'comment', 'reel', 'audio', 'message', 'user'
  content_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  -- Resolution
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  action_taken TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'ban', 'unban', etc.
  entity_type TEXT NOT NULL, -- 'user', 'scenario', 'post', 'promo_code', etc.
  entity_id UUID,
  -- Details
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- NOTIFICATION BROADCASTS
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  -- Targeting
  target_audience TEXT DEFAULT 'all',
  target_roles TEXT[] DEFAULT '{}',
  -- Options
  notification_type TEXT DEFAULT 'push', -- 'push', 'in_app', 'email', 'all'
  link_url TEXT,
  image_url TEXT,
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIO POSTS (if not exists with correct name)
-- =====================================================

CREATE TABLE IF NOT EXISTS audio_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  duration INTEGER DEFAULT 0,
  waveform_data JSONB,
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log AP transactions
CREATE OR REPLACE FUNCTION log_ap_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update user balance
  UPDATE users
  SET ap_coins = ap_coins + p_amount
  WHERE id = p_user_id
  RETURNING ap_coins INTO v_new_balance;

  -- Log transaction
  INSERT INTO ap_coins_transactions (user_id, amount, balance_after, transaction_type, description, reference_id)
  VALUES (p_user_id, p_amount, v_new_balance, p_type, p_description, p_reference_id);
END;
$$ LANGUAGE plpgsql;

-- Function to update login streak
CREATE OR REPLACE FUNCTION update_login_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, total_days INTEGER) AS $$
DECLARE
  v_last_login DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_days INTEGER;
BEGIN
  -- Get or create streak record
  INSERT INTO user_streaks (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current streak data
  SELECT
    last_login_date,
    current_login_streak,
    longest_login_streak,
    total_login_days
  INTO v_last_login, v_current_streak, v_longest_streak, v_total_days
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Calculate new streak
  IF v_last_login IS NULL OR v_last_login < v_today - INTERVAL '1 day' THEN
    -- Streak broken or first login
    v_current_streak := 1;
  ELSIF v_last_login = v_today - INTERVAL '1 day' THEN
    -- Consecutive day
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_login = v_today THEN
    -- Already logged in today
    RETURN QUERY SELECT v_current_streak, v_longest_streak, v_total_days;
    RETURN;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Increment total days
  v_total_days := v_total_days + 1;

  -- Update record
  UPDATE user_streaks
  SET
    current_login_streak = v_current_streak,
    longest_login_streak = v_longest_streak,
    total_login_days = v_total_days,
    last_login_date = v_today,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_total_days;
END;
$$ LANGUAGE plpgsql;

-- Function to assign daily missions
CREATE OR REPLACE FUNCTION assign_daily_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_mission RECORD;
BEGIN
  -- Check if already assigned today
  IF EXISTS (
    SELECT 1 FROM user_missions
    WHERE user_id = p_user_id
    AND assigned_at::DATE = v_today
  ) THEN
    RETURN;
  END IF;

  -- Assign active daily missions
  FOR v_mission IN
    SELECT id FROM mission_definitions
    WHERE mission_type = 'daily'
    AND is_active = true
    ORDER BY RANDOM()
    LIMIT 5
  LOOP
    INSERT INTO user_missions (user_id, mission_id, expires_at)
    VALUES (p_user_id, v_mission.id, v_today + INTERVAL '1 day')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Audit logs: Only admins can view
CREATE POLICY IF NOT EXISTS "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
    )
  );

-- System config: Public configs are readable by all, rest by admins only
CREATE POLICY IF NOT EXISTS "Public configs are readable" ON system_config
  FOR SELECT USING (is_public = true OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  ));

-- Promo codes: Only admins can manage
CREATE POLICY IF NOT EXISTS "Admins can manage promo codes" ON promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_scenario_reports_status ON scenario_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_broadcasts_status ON notification_broadcasts(status, scheduled_at);
