-- ==============================================
-- BACKFILL EXISTING DATA TO FEED_ACTIVITIES
-- ==============================================
-- Run this AFTER the fix_feed_triggers.sql
-- This adds historical predictions and steals to the feed

-- 1. BACKFILL PREDICTIONS (Me gusta / No me gusta)
-- ==============================================

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
)
SELECT
  gen_random_uuid(),
  'scenario_vote',
  CASE WHEN p.prediction = 'YES' THEN 'Me gusta' ELSE 'No me gusta' END,
  s.title,
  CASE WHEN p.prediction = 'YES' THEN '👍' ELSE '👎' END,
  p.user_id,
  p.scenario_id,
  s.title,
  p.prediction,
  COALESCE(p.amount, 0),
  p.created_at
FROM predictions p
LEFT JOIN scenarios s ON s.id = p.scenario_id
WHERE NOT EXISTS (
  -- Don't insert duplicates
  SELECT 1 FROM feed_activities fa
  WHERE fa.type = 'scenario_vote'
    AND fa.user_id = p.user_id
    AND fa.scenario_id = p.scenario_id
    AND fa.vote_type = p.prediction
);


-- 2. BACKFILL STEALS (Robar escenario)
-- ==============================================

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
)
SELECT
  gen_random_uuid(),
  'scenario_stolen',
  'Escenario robado',
  s.title,
  '🦹',
  ssh.thief_id,
  ssh.scenario_id,
  s.title,
  COALESCE(ssh.price_paid, 0),
  ssh.stolen_at
FROM scenario_steal_history ssh
LEFT JOIN scenarios s ON s.id = ssh.scenario_id
WHERE NOT EXISTS (
  -- Don't insert duplicates
  SELECT 1 FROM feed_activities fa
  WHERE fa.type = 'scenario_stolen'
    AND fa.user_id = ssh.thief_id
    AND fa.scenario_id = ssh.scenario_id
    AND fa.created_at = ssh.stolen_at
);


-- 3. VERIFY BACKFILL
-- ==============================================

-- Show counts by type
SELECT type, COUNT(*) as count
FROM feed_activities
GROUP BY type
ORDER BY count DESC;

-- Show most recent activities
SELECT
  type,
  title,
  description,
  user_id,
  created_at
FROM feed_activities
ORDER BY created_at DESC
LIMIT 20;
