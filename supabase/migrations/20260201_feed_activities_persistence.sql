-- =====================================================
-- FEED ACTIVITIES PERSISTENCE MIGRATION
-- Creates a dedicated table for feed activities
-- with automatic triggers for activity insertion
-- =====================================================

-- 1. Create feed_activities table
CREATE TABLE IF NOT EXISTS feed_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'scenario_created', 'scenario_stolen', 'scenario_protected', 'scenario_vote', 'scenario_resolved', 'scenario_closed', 'live_stream', 'achievement'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Metadata fields (denormalized for fast queries)
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  scenario_title TEXT,
  amount NUMERIC,
  vote_type TEXT, -- 'YES' or 'NO'
  outcome BOOLEAN,
  previous_holder_id UUID REFERENCES users(id) ON DELETE SET NULL,
  achievement_id UUID,
  stream_id UUID,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_feed_activities_created_at ON feed_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_activities_user_id ON feed_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_activities_type ON feed_activities(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_activities_scenario_id ON feed_activities(scenario_id) WHERE scenario_id IS NOT NULL;

-- Enable RLS
ALTER TABLE feed_activities ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read feed activities
CREATE POLICY "Anyone can view feed activities" ON feed_activities FOR SELECT USING (true);

-- Only system can insert/update/delete
CREATE POLICY "System can manage feed activities" ON feed_activities FOR ALL USING (true);

-- =====================================================
-- 2. TRIGGER: Scenario Created
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_scenario_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO feed_activities (
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
    'scenario_created',
    'Nuevo escenario creado',
    NEW.title,
    '🎯',
    NEW.creator_id,
    NEW.id,
    NEW.title,
    NEW.total_pool,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_scenario_created ON scenarios;
CREATE TRIGGER feed_on_scenario_created
  AFTER INSERT ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_scenario_created();

-- =====================================================
-- 3. TRIGGER: Scenario Stolen/Protected (Transactions)
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scenario scenarios;
  v_activity_type TEXT;
  v_title TEXT;
  v_icon TEXT;
BEGIN
  -- Only process STEAL and PROTECT transactions with scenario reference
  IF NEW.type NOT IN ('STEAL', 'PROTECT') OR NEW.reference_type != 'scenario' THEN
    RETURN NEW;
  END IF;

  -- Get scenario info
  SELECT * INTO v_scenario FROM scenarios WHERE id = NEW.reference_id;

  IF v_scenario IS NULL THEN
    RETURN NEW;
  END IF;

  -- Set activity details based on transaction type
  IF NEW.type = 'STEAL' THEN
    v_activity_type := 'scenario_stolen';
    v_title := 'Escenario robado';
    v_icon := '🦹';
  ELSE
    v_activity_type := 'scenario_protected';
    v_title := 'Escenario protegido';
    v_icon := '🛡️';
  END IF;

  INSERT INTO feed_activities (
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
    v_activity_type,
    v_title,
    v_scenario.title,
    v_icon,
    NEW.user_id,
    v_scenario.id,
    v_scenario.title,
    NEW.amount,
    NEW.created_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_transaction ON transactions;
CREATE TRIGGER feed_on_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_transaction();

-- =====================================================
-- 4. TRIGGER: Prediction/Vote Created
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_prediction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scenario scenarios;
  v_vote_type TEXT;
  v_title TEXT;
  v_icon TEXT;
BEGIN
  -- Get scenario info
  SELECT * INTO v_scenario FROM scenarios WHERE id = NEW.scenario_id;

  IF v_scenario IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine vote type
  IF NEW.prediction = 'YES' OR NEW.prediction::text = 'true' THEN
    v_vote_type := 'YES';
    v_title := 'Voto SI';
    v_icon := '👍';
  ELSE
    v_vote_type := 'NO';
    v_title := 'Voto NO';
    v_icon := '👎';
  END IF;

  INSERT INTO feed_activities (
    type,
    title,
    description,
    icon,
    user_id,
    scenario_id,
    scenario_title,
    amount,
    vote_type,
    created_at
  ) VALUES (
    'scenario_vote',
    v_title,
    v_scenario.title,
    v_icon,
    NEW.user_id,
    v_scenario.id,
    v_scenario.title,
    NEW.amount,
    v_vote_type,
    NEW.created_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_prediction ON predictions;
CREATE TRIGGER feed_on_prediction
  AFTER INSERT ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_prediction();

-- =====================================================
-- 5. TRIGGER: Scenario Resolved/Closed
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_scenario_resolved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_type TEXT;
  v_title TEXT;
  v_description TEXT;
  v_icon TEXT;
BEGIN
  -- Only process when resolved_at is newly set
  IF OLD.resolved_at IS NOT NULL OR NEW.resolved_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine if resolved or just closed
  IF NEW.outcome IS NOT NULL THEN
    v_activity_type := 'scenario_resolved';
    v_title := 'Escenario resuelto';
    v_description := NEW.title || ' - Resultado: ' || CASE WHEN NEW.outcome THEN 'SI sucedio' ELSE 'NO sucedio' END;
    v_icon := '✅';
  ELSE
    v_activity_type := 'scenario_closed';
    v_title := 'Escenario cerrado';
    v_description := NEW.title || ' fue cerrado';
    v_icon := '🔒';
  END IF;

  INSERT INTO feed_activities (
    type,
    title,
    description,
    icon,
    user_id,
    scenario_id,
    scenario_title,
    amount,
    outcome,
    created_at
  ) VALUES (
    v_activity_type,
    v_title,
    v_description,
    v_icon,
    NEW.creator_id,
    NEW.id,
    NEW.title,
    NEW.total_pool,
    NEW.outcome,
    NEW.resolved_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_scenario_resolved ON scenarios;
CREATE TRIGGER feed_on_scenario_resolved
  AFTER UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_scenario_resolved();

-- =====================================================
-- 6. TRIGGER: Achievement Unlocked
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  -- Only process when achievement is unlocked
  IF NEW.is_unlocked IS NOT TRUE OR NEW.unlocked_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get achievement info
  SELECT * INTO v_achievement FROM achievement_definitions WHERE id = NEW.achievement_id;

  IF v_achievement IS NULL THEN
    -- Try achievements table (old schema)
    SELECT * INTO v_achievement FROM achievements WHERE id = NEW.achievement_id;
  END IF;

  IF v_achievement IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO feed_activities (
    type,
    title,
    description,
    icon,
    user_id,
    achievement_id,
    created_at
  ) VALUES (
    'achievement',
    'Logro desbloqueado',
    COALESCE(v_achievement.name_es, v_achievement.name, 'Logro'),
    COALESCE(v_achievement.icon, '🏆'),
    NEW.user_id,
    NEW.achievement_id,
    NEW.unlocked_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_achievement ON user_achievements;
CREATE TRIGGER feed_on_achievement
  AFTER INSERT OR UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_achievement();

-- =====================================================
-- 7. TRIGGER: Live Stream Started
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_feed_live_stream()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only process when stream goes live
  IF NEW.status != 'live' THEN
    RETURN NEW;
  END IF;

  -- Don't create duplicate if already exists for this stream
  IF EXISTS (SELECT 1 FROM feed_activities WHERE stream_id = NEW.id AND type = 'live_stream') THEN
    RETURN NEW;
  END IF;

  INSERT INTO feed_activities (
    type,
    title,
    description,
    icon,
    user_id,
    stream_id,
    created_at
  ) VALUES (
    'live_stream',
    'En vivo ahora',
    NEW.title,
    '🔴',
    NEW.user_id,
    NEW.id,
    COALESCE(NEW.started_at, NOW())
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_on_live_stream ON live_streams;
CREATE TRIGGER feed_on_live_stream
  AFTER INSERT OR UPDATE ON live_streams
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feed_live_stream();

-- =====================================================
-- 8. BACKFILL: Populate feed_activities with existing data
-- =====================================================

-- Backfill scenario creations (last 7 days)
INSERT INTO feed_activities (type, title, description, icon, user_id, scenario_id, scenario_title, amount, created_at)
SELECT
  'scenario_created',
  'Nuevo escenario creado',
  s.title,
  '🎯',
  s.creator_id,
  s.id,
  s.title,
  s.total_pool,
  s.created_at
FROM scenarios s
WHERE s.created_at > NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM feed_activities fa
    WHERE fa.scenario_id = s.id AND fa.type = 'scenario_created'
  )
ON CONFLICT DO NOTHING;

-- Backfill predictions (last 7 days)
INSERT INTO feed_activities (type, title, description, icon, user_id, scenario_id, scenario_title, amount, vote_type, created_at)
SELECT
  'scenario_vote',
  CASE WHEN p.prediction = 'YES' OR p.prediction::text = 'true' THEN 'Voto SI' ELSE 'Voto NO' END,
  s.title,
  CASE WHEN p.prediction = 'YES' OR p.prediction::text = 'true' THEN '👍' ELSE '👎' END,
  p.user_id,
  p.scenario_id,
  s.title,
  p.amount,
  CASE WHEN p.prediction = 'YES' OR p.prediction::text = 'true' THEN 'YES' ELSE 'NO' END,
  p.created_at
FROM predictions p
JOIN scenarios s ON s.id = p.scenario_id
WHERE p.created_at > NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM feed_activities fa
    WHERE fa.scenario_id = p.scenario_id
      AND fa.user_id = p.user_id
      AND fa.type = 'scenario_vote'
      AND fa.created_at = p.created_at
  )
ON CONFLICT DO NOTHING;

-- Backfill steal/protect transactions (last 7 days)
INSERT INTO feed_activities (type, title, description, icon, user_id, scenario_id, scenario_title, amount, created_at)
SELECT
  CASE WHEN t.type = 'STEAL' THEN 'scenario_stolen' ELSE 'scenario_protected' END,
  CASE WHEN t.type = 'STEAL' THEN 'Escenario robado' ELSE 'Escenario protegido' END,
  s.title,
  CASE WHEN t.type = 'STEAL' THEN '🦹' ELSE '🛡️' END,
  t.user_id,
  s.id,
  s.title,
  t.amount,
  t.created_at
FROM transactions t
JOIN scenarios s ON s.id = t.reference_id
WHERE t.type IN ('STEAL', 'PROTECT')
  AND t.reference_type = 'scenario'
  AND t.created_at > NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM feed_activities fa
    WHERE fa.scenario_id = s.id
      AND fa.user_id = t.user_id
      AND fa.type = CASE WHEN t.type = 'STEAL' THEN 'scenario_stolen' ELSE 'scenario_protected' END
      AND fa.created_at = t.created_at
  )
ON CONFLICT DO NOTHING;

-- Backfill resolved scenarios (last 7 days)
INSERT INTO feed_activities (type, title, description, icon, user_id, scenario_id, scenario_title, amount, outcome, created_at)
SELECT
  CASE WHEN s.outcome IS NOT NULL THEN 'scenario_resolved' ELSE 'scenario_closed' END,
  CASE WHEN s.outcome IS NOT NULL THEN 'Escenario resuelto' ELSE 'Escenario cerrado' END,
  CASE WHEN s.outcome IS NOT NULL
    THEN s.title || ' - Resultado: ' || CASE WHEN s.outcome THEN 'SI sucedio' ELSE 'NO sucedio' END
    ELSE s.title || ' fue cerrado'
  END,
  CASE WHEN s.outcome IS NOT NULL THEN '✅' ELSE '🔒' END,
  s.creator_id,
  s.id,
  s.title,
  s.total_pool,
  s.outcome,
  s.resolved_at
FROM scenarios s
WHERE s.resolved_at IS NOT NULL
  AND s.resolved_at > NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM feed_activities fa
    WHERE fa.scenario_id = s.id
      AND fa.type IN ('scenario_resolved', 'scenario_closed')
  )
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT ON feed_activities TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON feed_activities TO service_role;
