-- =====================================================
-- ADMIN SYSTEM COMPLETE MIGRATION
-- All admin tables and functions for Apocaliptyx
-- =====================================================

-- =====================================================
-- PART 1: ADMIN WARNINGS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  warning_type TEXT NOT NULL, -- 'content', 'behavior', 'spam', 'harassment', 'fraud', 'other'
  details TEXT,
  expires_at TIMESTAMPTZ, -- null = permanent
  is_active BOOLEAN DEFAULT true,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_user ON user_warnings(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_warnings_admin ON user_warnings(admin_id);

-- =====================================================
-- PART 2: ADMIN ANNOUNCEMENTS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_es TEXT NOT NULL,
  content TEXT NOT NULL,
  content_es TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'maintenance', 'event'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience TEXT DEFAULT 'all', -- 'all', 'premium', 'new_users', 'active_users', 'specific'
  target_user_ids UUID[] DEFAULT '{}',
  image_url TEXT,
  action_url TEXT,
  action_label TEXT,
  is_dismissible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  dismissals_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track user dismissals
CREATE TABLE IF NOT EXISTS announcement_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES admin_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON admin_announcements(is_active, starts_at, ends_at);

-- =====================================================
-- PART 3: PROMOTIONS & DISCOUNT CODES
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'ap_coins', 'item', 'collectible'
  discount_value INTEGER NOT NULL, -- percentage or amount
  item_reward_id UUID, -- for item/collectible rewards
  max_uses INTEGER, -- null = unlimited
  uses_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  min_purchase_amount INTEGER DEFAULT 0,
  applicable_items TEXT[] DEFAULT '{}', -- specific items, empty = all
  is_active BOOLEAN DEFAULT true,
  requires_premium BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track code redemptions
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discount_applied INTEGER NOT NULL,
  order_id UUID, -- reference to purchase
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON promo_code_redemptions(user_id);

-- =====================================================
-- PART 4: ADMIN AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'ban', 'unban', 'resolve', 'warn', etc.
  entity_type TEXT NOT NULL, -- 'user', 'scenario', 'report', 'announcement', 'promo', 'collectible', etc.
  entity_id TEXT NOT NULL,
  entity_name TEXT, -- readable name for display
  changes JSONB DEFAULT '{}', -- what changed
  previous_values JSONB DEFAULT '{}', -- original values
  reason TEXT, -- reason for the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON admin_audit_logs(created_at DESC);

-- =====================================================
-- PART 5: HELP ARTICLES CMS
-- =====================================================

CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_es TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  content_es TEXT NOT NULL,
  excerpt TEXT,
  excerpt_es TEXT,
  keywords TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track article feedback
CREATE TABLE IF NOT EXISTS help_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_helpful BOOLEAN NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);

-- Insert default help categories
INSERT INTO help_categories (name, name_es, slug, description, icon, display_order) VALUES
  ('Getting Started', 'Primeros Pasos', 'getting-started', 'Learn the basics of Apocaliptyx', '🚀', 1),
  ('Predictions', 'Predicciones', 'predictions', 'How to make and manage predictions', '🎯', 2),
  ('AP Coins', 'AP Coins', 'ap-coins', 'Understanding the in-app currency', '💰', 3),
  ('Account', 'Cuenta', 'account', 'Manage your account settings', '👤', 4),
  ('Social Features', 'Funciones Sociales', 'social', 'Communities, followers, and more', '👥', 5),
  ('Tournaments', 'Torneos', 'tournaments', 'Compete in prediction tournaments', '🏆', 6),
  ('Troubleshooting', 'Solución de Problemas', 'troubleshooting', 'Common issues and solutions', '🔧', 7)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PART 6: SYSTEM SETTINGS / CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'economy', 'gamification', 'limits', 'features', 'moderation'
  label TEXT NOT NULL,
  description TEXT,
  value_type TEXT NOT NULL, -- 'boolean', 'number', 'string', 'json', 'array'
  is_public BOOLEAN DEFAULT false, -- visible to users
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value, category, label, description, value_type, is_public) VALUES
  -- Economy settings
  ('initial_ap_coins', '1000', 'economy', 'Initial AP Coins', 'AP coins given to new users', 'number', true),
  ('daily_login_bonus', '10', 'economy', 'Daily Login Bonus', 'AP coins for daily login', 'number', true),
  ('steal_cost_percentage', '20', 'economy', 'Steal Cost Percentage', 'Percentage of scenario price to steal', 'number', true),
  ('shield_cost', '50', 'economy', 'Shield Cost', 'Cost to apply shield protection', 'number', true),
  ('shield_duration_hours', '24', 'economy', 'Shield Duration', 'Hours of shield protection', 'number', true),

  -- Gamification settings
  ('xp_per_prediction', '10', 'gamification', 'XP per Prediction', 'Experience points per prediction', 'number', false),
  ('xp_per_correct_prediction', '25', 'gamification', 'XP per Correct', 'Extra XP for correct predictions', 'number', false),
  ('xp_per_level', '100', 'gamification', 'XP per Level', 'Experience needed per level', 'number', false),
  ('max_daily_missions', '5', 'gamification', 'Max Daily Missions', 'Maximum daily missions per user', 'number', false),

  -- Limits
  ('max_scenarios_per_day', '10', 'limits', 'Max Scenarios/Day', 'Maximum scenarios user can create per day', 'number', false),
  ('max_predictions_per_day', '50', 'limits', 'Max Predictions/Day', 'Maximum predictions per day', 'number', false),
  ('max_steals_per_day', '5', 'limits', 'Max Steals/Day', 'Maximum steals per day', 'number', false),
  ('min_scenario_price', '10', 'limits', 'Min Scenario Price', 'Minimum price for creating scenario', 'number', true),
  ('max_scenario_price', '10000', 'limits', 'Max Scenario Price', 'Maximum price for scenarios', 'number', true),

  -- Feature flags
  ('feature_tournaments', 'true', 'features', 'Tournaments Enabled', 'Enable tournament feature', 'boolean', false),
  ('feature_streaming', 'true', 'features', 'Streaming Enabled', 'Enable live streaming', 'boolean', false),
  ('feature_reels', 'true', 'features', 'Reels Enabled', 'Enable short video reels', 'boolean', false),
  ('feature_trading', 'true', 'features', 'Trading Enabled', 'Enable collectible trading', 'boolean', false),
  ('maintenance_mode', 'false', 'features', 'Maintenance Mode', 'Put site in maintenance', 'boolean', true),

  -- Moderation settings
  ('auto_ban_warnings', '3', 'moderation', 'Auto-Ban After Warnings', 'Warnings before auto-ban', 'number', false),
  ('report_threshold_hide', '5', 'moderation', 'Report Threshold', 'Reports before auto-hide content', 'number', false),
  ('profanity_filter', 'true', 'moderation', 'Profanity Filter', 'Enable profanity filter', 'boolean', false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PART 7: CONTENT REPORTS ENHANCEMENT
-- =====================================================

-- Scenario reports (if not exists)
CREATE TABLE IF NOT EXISTS scenario_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scenario_id, reporter_id)
);

-- User reports (if not exists)
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  action_taken TEXT, -- 'none', 'warning', 'ban', 'content_removed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reported_user_id, reporter_id)
);

-- Content reports (for posts, comments, reels, etc.)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'post', 'comment', 'reel', 'stream', 'story', 'community'
  content_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_type ON content_reports(content_type, content_id);

-- =====================================================
-- PART 8: FORUM STORIES (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS forum_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  background_color TEXT,
  font_style TEXT,
  views_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES forum_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

CREATE TABLE IF NOT EXISTS forum_story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES forum_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- 'fire', 'love', 'clap', 'mindblown', 'sad', 'laugh'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON forum_stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_active ON forum_stories(is_active, expires_at);

-- =====================================================
-- PART 9: STREAM LIKES (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS stream_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

-- =====================================================
-- PART 10: RLS POLICIES
-- =====================================================

-- Warnings
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own warnings" ON user_warnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage warnings" ON user_warnings FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR'))
);

-- Announcements
ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active announcements" ON admin_announcements FOR SELECT USING (
  is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW())
);
CREATE POLICY "Admins can manage announcements" ON admin_announcements FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Dismissals
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own dismissals" ON announcement_dismissals FOR ALL USING (auth.uid() = user_id);

-- Promo codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promo codes" ON promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Redemptions
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON promo_code_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem codes" ON promo_code_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs FOR SELECT USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "System can insert audit logs" ON admin_audit_logs FOR INSERT WITH CHECK (true);

-- Help categories
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view help categories" ON help_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage help categories" ON help_categories FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Help articles
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view help articles" ON help_articles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage help articles" ON help_articles FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Help feedback
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can give feedback" ON help_article_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view feedback" ON help_article_feedback FOR SELECT USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- System settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public settings" ON system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can view all settings" ON system_settings FOR SELECT USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "Admins can update settings" ON system_settings FOR UPDATE USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Content reports
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON content_reports FOR ALL USING (
  EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR'))
);

-- Stories
ALTER TABLE forum_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active stories" ON forum_stories FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own stories" ON forum_stories FOR ALL USING (auth.uid() = user_id);

ALTER TABLE forum_story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view story views" ON forum_story_views FOR SELECT USING (true);
CREATE POLICY "Users can track views" ON forum_story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

ALTER TABLE forum_story_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reactions" ON forum_story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react" ON forum_story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unreact" ON forum_story_reactions FOR DELETE USING (auth.uid() = user_id);

-- Stream likes
ALTER TABLE stream_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stream likes" ON stream_likes FOR SELECT USING (true);
CREATE POLICY "Users can like streams" ON stream_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike streams" ON stream_likes FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PART 11: USEFUL ADMIN FUNCTIONS
-- =====================================================

-- Function: Log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT '{}',
  p_previous_values JSONB DEFAULT '{}',
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, entity_name, changes, previous_values, reason)
  VALUES (p_admin_id, p_action, p_entity_type, p_entity_id, p_entity_name, p_changes, p_previous_values, p_reason)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Function: Warn user
CREATE OR REPLACE FUNCTION warn_user(
  p_admin_id UUID,
  p_user_id UUID,
  p_reason TEXT,
  p_warning_type TEXT,
  p_severity TEXT DEFAULT 'low',
  p_details TEXT DEFAULT NULL,
  p_expires_days INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_warning_count INTEGER;
  v_auto_ban_threshold INTEGER;
  v_warning_id UUID;
BEGIN
  -- Insert warning
  INSERT INTO user_warnings (user_id, admin_id, reason, warning_type, severity, details, expires_at)
  VALUES (
    p_user_id,
    p_admin_id,
    p_reason,
    p_warning_type,
    p_severity,
    p_details,
    CASE WHEN p_expires_days IS NOT NULL THEN NOW() + (p_expires_days || ' days')::INTERVAL ELSE NULL END
  )
  RETURNING id INTO v_warning_id;

  -- Count active warnings
  SELECT COUNT(*) INTO v_warning_count
  FROM user_warnings
  WHERE user_id = p_user_id AND is_active = true;

  -- Get auto-ban threshold
  SELECT (value)::INTEGER INTO v_auto_ban_threshold
  FROM system_settings WHERE key = 'auto_ban_warnings';

  -- Auto-ban if threshold reached
  IF v_auto_ban_threshold IS NOT NULL AND v_warning_count >= v_auto_ban_threshold THEN
    UPDATE users SET is_banned = true, banned_at = NOW(), banned_reason = 'Auto-banned: exceeded warning limit'
    WHERE id = p_user_id;

    -- Log the auto-ban
    PERFORM log_admin_action(p_admin_id, 'auto_ban', 'user', p_user_id::TEXT, NULL,
      jsonb_build_object('warnings_count', v_warning_count), '{}', 'Exceeded warning limit');
  END IF;

  -- Log the warning
  PERFORM log_admin_action(p_admin_id, 'warn', 'user', p_user_id::TEXT, NULL,
    jsonb_build_object('warning_type', p_warning_type, 'severity', p_severity), '{}', p_reason);

  RETURN json_build_object(
    'success', true,
    'warning_id', v_warning_id,
    'total_warnings', v_warning_count,
    'auto_banned', v_warning_count >= COALESCE(v_auto_ban_threshold, 999)
  );
END;
$$;

-- Function: Redeem promo code
CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo promo_codes;
  v_user users;
  v_redemption_count INTEGER;
  v_result JSON;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo FROM promo_codes WHERE UPPER(code) = UPPER(p_code);

  IF v_promo IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Código no válido');
  END IF;

  IF NOT v_promo.is_active THEN
    RETURN json_build_object('success', false, 'error', 'Código inactivo');
  END IF;

  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Código expirado');
  END IF;

  IF v_promo.starts_at > NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Código aún no disponible');
  END IF;

  IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Código agotado');
  END IF;

  -- Check user eligibility
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF v_promo.requires_premium AND NOT COALESCE(v_user.is_premium, false) THEN
    RETURN json_build_object('success', false, 'error', 'Solo para usuarios premium');
  END IF;

  -- Check user redemption count
  SELECT COUNT(*) INTO v_redemption_count
  FROM promo_code_redemptions
  WHERE code_id = v_promo.id AND user_id = p_user_id;

  IF v_redemption_count >= v_promo.max_uses_per_user THEN
    RETURN json_build_object('success', false, 'error', 'Ya has usado este código');
  END IF;

  -- Apply reward based on type
  IF v_promo.discount_type = 'ap_coins' THEN
    UPDATE users SET ap_coins = ap_coins + v_promo.discount_value WHERE id = p_user_id;

    -- Log transaction
    INSERT INTO ap_coins_transactions (user_id, amount, balance_after, transaction_type, description, reference_id)
    VALUES (p_user_id, v_promo.discount_value, v_user.ap_coins + v_promo.discount_value, 'promo_code', 'Código promocional: ' || v_promo.code, v_promo.id);
  END IF;

  -- Record redemption
  INSERT INTO promo_code_redemptions (code_id, user_id, discount_applied)
  VALUES (v_promo.id, p_user_id, v_promo.discount_value);

  -- Update uses count
  UPDATE promo_codes SET uses_count = uses_count + 1 WHERE id = v_promo.id;

  RETURN json_build_object(
    'success', true,
    'discount_type', v_promo.discount_type,
    'discount_value', v_promo.discount_value,
    'message', 'Código canjeado exitosamente'
  );
END;
$$;

-- Function: Get system setting
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT value INTO v_value FROM system_settings WHERE key = p_key;
  RETURN v_value;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION log_admin_action(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION warn_user(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_promo_code(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_setting(TEXT) TO authenticated, anon;
