-- Migration: Cookie Preferences System
-- Date: 2026-01-08
-- Description: Stores user cookie consent preferences for logged-in users

-- Create table for user cookie preferences
CREATE TABLE IF NOT EXISTS user_cookie_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  necessary BOOLEAN NOT NULL DEFAULT true,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  preferences BOOLEAN NOT NULL DEFAULT false,
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cookie_preferences_user_id ON user_cookie_preferences(user_id);

-- Enable RLS
ALTER TABLE user_cookie_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own preferences
CREATE POLICY "Users can read own cookie preferences"
  ON user_cookie_preferences
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IN (
    SELECT id FROM users WHERE id = user_id
  ));

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own cookie preferences"
  ON user_cookie_preferences
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own cookie preferences"
  ON user_cookie_preferences
  FOR UPDATE
  USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_cookie_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_update_cookie_preferences_updated_at ON user_cookie_preferences;
CREATE TRIGGER trigger_update_cookie_preferences_updated_at
  BEFORE UPDATE ON user_cookie_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_cookie_preferences_updated_at();

-- Function to upsert cookie preferences
CREATE OR REPLACE FUNCTION upsert_cookie_preferences(
  p_user_id UUID,
  p_necessary BOOLEAN DEFAULT true,
  p_analytics BOOLEAN DEFAULT false,
  p_marketing BOOLEAN DEFAULT false,
  p_preferences BOOLEAN DEFAULT false,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  INSERT INTO user_cookie_preferences (
    user_id,
    necessary,
    analytics,
    marketing,
    preferences,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    COALESCE(p_necessary, true),
    COALESCE(p_analytics, false),
    COALESCE(p_marketing, false),
    COALESCE(p_preferences, false),
    p_ip_address,
    p_user_agent
  )
  ON CONFLICT (user_id) DO UPDATE SET
    necessary = COALESCE(EXCLUDED.necessary, user_cookie_preferences.necessary),
    analytics = COALESCE(EXCLUDED.analytics, user_cookie_preferences.analytics),
    marketing = COALESCE(EXCLUDED.marketing, user_cookie_preferences.marketing),
    preferences = COALESCE(EXCLUDED.preferences, user_cookie_preferences.preferences),
    ip_address = COALESCE(EXCLUDED.ip_address, user_cookie_preferences.ip_address),
    user_agent = COALESCE(EXCLUDED.user_agent, user_cookie_preferences.user_agent),
    updated_at = NOW()
  RETURNING json_build_object(
    'success', true,
    'necessary', necessary,
    'analytics', analytics,
    'marketing', marketing,
    'preferences', preferences,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_cookie_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_cookie_preferences TO authenticated;

-- Comment for documentation
COMMENT ON TABLE user_cookie_preferences IS 'Stores cookie consent preferences for logged-in users';
COMMENT ON COLUMN user_cookie_preferences.necessary IS 'Essential cookies - always true';
COMMENT ON COLUMN user_cookie_preferences.analytics IS 'Analytics cookies (Google Analytics, etc.)';
COMMENT ON COLUMN user_cookie_preferences.marketing IS 'Marketing/advertising cookies';
COMMENT ON COLUMN user_cookie_preferences.preferences IS 'User preference cookies (theme, language, etc.)';
