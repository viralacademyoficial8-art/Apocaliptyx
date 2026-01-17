-- Migration: Add is_featured and is_hot columns to scenarios table
-- These columns were referenced in code but missing from the database schema

-- Add is_featured column (default false)
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add is_hot column (default false)
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT false;

-- Create index for better performance when filtering featured/hot scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_is_featured ON scenarios(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_scenarios_is_hot ON scenarios(is_hot) WHERE is_hot = true;

-- Update some existing popular scenarios to be featured/hot based on engagement
-- Mark scenarios with high participation as "hot"
UPDATE scenarios
SET is_hot = true
WHERE participant_count >= 2
  AND status = 'ACTIVE'
  AND is_hot = false;

-- Mark scenarios with high total pool as "featured"
UPDATE scenarios
SET is_featured = true
WHERE total_pool >= 100
  AND status = 'ACTIVE'
  AND is_featured = false;

-- Comment explaining the columns
COMMENT ON COLUMN scenarios.is_featured IS 'Whether this scenario is featured (shown prominently in the UI)';
COMMENT ON COLUMN scenarios.is_hot IS 'Whether this scenario is currently trending/hot';
