-- ==============================================
-- FIX FEED TRIGGERS FOR PERSISTENCE
-- ==============================================
-- Execute this SQL in Supabase SQL Editor
-- Fixes: Me gusta/No me gusta and Robar escenario

-- 1. TRIGGER FOR PREDICTIONS (Me gusta / No me gusta)
-- ==============================================

CREATE OR REPLACE FUNCTION insert_prediction_to_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scenario_title TEXT;
  v_vote_display TEXT;
BEGIN
  -- Get scenario title
  SELECT title INTO v_scenario_title
  FROM scenarios
  WHERE id = NEW.scenario_id;

  -- Determine vote display text
  IF NEW.prediction = 'YES' THEN
    v_vote_display := 'Me gusta';
  ELSE
    v_vote_display := 'No me gusta';
  END IF;

  -- Insert feed activity
  INSERT INTO feed_activities (
    id,
    type,
    title,
    description,
    icon,
    user_id,
    scenario_id,
    scenario_title,
    vote_type,
    amount,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'scenario_vote',
    v_vote_display,
    COALESCE(v_scenario_title, 'Escenario'),
    CASE WHEN NEW.prediction = 'YES' THEN '👍' ELSE '👎' END,
    NEW.user_id,
    NEW.scenario_id,
    v_scenario_title,
    NEW.prediction,
    COALESCE(NEW.amount, 0),
    COALESCE(NEW.created_at, NOW())
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the original insert
  RAISE WARNING 'Error inserting prediction to feed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_prediction_to_feed ON predictions;

-- Create the trigger
CREATE TRIGGER trg_prediction_to_feed
AFTER INSERT ON predictions
FOR EACH ROW
EXECUTE FUNCTION insert_prediction_to_feed();


-- 2. TRIGGER FOR SCENARIO STEALS (Robar escenario)
-- ==============================================

CREATE OR REPLACE FUNCTION insert_steal_to_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scenario_title TEXT;
  v_victim_username TEXT;
BEGIN
  -- Get scenario title
  SELECT title INTO v_scenario_title
  FROM scenarios
  WHERE id = NEW.scenario_id;

  -- Get victim username (optional)
  IF NEW.victim_id IS NOT NULL THEN
    SELECT COALESCE(display_name, username, 'Usuario')
    INTO v_victim_username
    FROM users
    WHERE id = NEW.victim_id;
  END IF;

  -- Insert feed activity
  INSERT INTO feed_activities (
    id,
    type,
    title,
    description,
    icon,
    user_id,
    scenario_id,
    scenario_title,
    amount,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'scenario_stolen',
    'Escenario robado',
    COALESCE(v_scenario_title, 'Escenario'),
    '🦹',
    NEW.thief_id,
    NEW.scenario_id,
    v_scenario_title,
    COALESCE(NEW.price_paid, 0),
    COALESCE(NEW.stolen_at, NOW())
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the original insert
  RAISE WARNING 'Error inserting steal to feed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_steal_to_feed ON scenario_steal_history;

-- Create the trigger
CREATE TRIGGER trg_steal_to_feed
AFTER INSERT ON scenario_steal_history
FOR EACH ROW
EXECUTE FUNCTION insert_steal_to_feed();


-- 3. VERIFY EXISTING TRIGGERS
-- ==============================================

-- Check if feed_activities table exists and has correct structure
DO $$
BEGIN
  -- Add vote_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_activities' AND column_name = 'vote_type'
  ) THEN
    ALTER TABLE feed_activities ADD COLUMN vote_type TEXT;
    RAISE NOTICE 'Added vote_type column to feed_activities';
  END IF;
END $$;


-- 4. ENSURE RLS IS PROPERLY CONFIGURED
-- ==============================================

-- Enable RLS
ALTER TABLE feed_activities ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "feed_activities_select_all" ON feed_activities;
DROP POLICY IF EXISTS "feed_activities_insert_all" ON feed_activities;

-- Anyone can read feed activities
CREATE POLICY "feed_activities_select_all" ON feed_activities
FOR SELECT USING (true);

-- Service role and triggers can insert
CREATE POLICY "feed_activities_insert_all" ON feed_activities
FOR INSERT WITH CHECK (true);


-- 5. GRANT PERMISSIONS
-- ==============================================

GRANT SELECT ON feed_activities TO anon;
GRANT SELECT ON feed_activities TO authenticated;
GRANT ALL ON feed_activities TO service_role;


-- 6. VERIFICATION QUERIES
-- ==============================================

-- Check triggers exist
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname LIKE 'trg_%_to_feed';

-- Show recent feed activities
SELECT type, title, created_at
FROM feed_activities
ORDER BY created_at DESC
LIMIT 10;
