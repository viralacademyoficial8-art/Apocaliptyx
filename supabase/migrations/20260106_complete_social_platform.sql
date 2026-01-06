-- =====================================================
-- COMPLETE SOCIAL PLATFORM MIGRATION
-- All-in-One: Profile, Gamification, Communities, Content
-- For Apocaliptyx - The Ultimate Prediction Social Network
-- =====================================================

-- =====================================================
-- PART 1: ENHANCED PROFILE SYSTEM
-- =====================================================

-- 1.1 Profile customization
ALTER TABLE users
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS profile_music_url TEXT,
ADD COLUMN IF NOT EXISTS profile_music_title TEXT,
ADD COLUMN IF NOT EXISTS profile_music_artist TEXT,
ADD COLUMN IF NOT EXISTS theme_primary_color TEXT DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS theme_secondary_color TEXT DEFAULT '#8b5cf6',
ADD COLUMN IF NOT EXISTS theme_background TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_activity_status BOOLEAN DEFAULT true;

-- 1.2 Social links
CREATE TABLE IF NOT EXISTS user_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- instagram, twitter, tiktok, youtube, twitch, discord, website
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 1.3 Pinned posts
CREATE TABLE IF NOT EXISTS user_pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  pin_order INTEGER NOT NULL DEFAULT 0,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  CONSTRAINT max_pinned_posts CHECK (pin_order <= 3)
);

-- 1.4 Featured predictions/achievements showcase
CREATE TABLE IF NOT EXISTS user_featured_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'prediction', 'achievement', 'badge', 'collectible'
  item_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  featured_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 2: LEVELS, RANKS & TITLES SYSTEM
-- =====================================================

-- 2.1 Rank definitions
CREATE TABLE IF NOT EXISTS user_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL, -- Spanish name
  min_level INTEGER NOT NULL,
  max_level INTEGER,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  perks JSONB DEFAULT '{}', -- Special perks for this rank
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default ranks
INSERT INTO user_ranks (name, name_es, min_level, max_level, icon, color, perks) VALUES
  ('Novice', 'Novato', 1, 9, '🌱', '#9CA3AF', '{"max_predictions_day": 5}'),
  ('Apprentice', 'Aprendiz', 10, 24, '📚', '#60A5FA', '{"max_predictions_day": 10}'),
  ('Seer', 'Vidente', 25, 49, '👁️', '#34D399', '{"max_predictions_day": 20, "custom_reactions": true}'),
  ('Oracle', 'Oráculo', 50, 74, '🔮', '#A78BFA', '{"max_predictions_day": 50, "custom_reactions": true, "profile_effects": true}'),
  ('Prophet', 'Profeta', 75, 99, '⚡', '#FBBF24', '{"max_predictions_day": 100, "custom_reactions": true, "profile_effects": true, "exclusive_frames": true}'),
  ('Supreme Prophet', 'Profeta Supremo', 100, NULL, '👑', '#F59E0B', '{"unlimited_predictions": true, "all_perks": true}')
ON CONFLICT (name) DO NOTHING;

-- 2.2 User titles (unlockable)
CREATE TABLE IF NOT EXISTS title_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  description TEXT,
  description_es TEXT,
  icon TEXT,
  color TEXT DEFAULT '#FFFFFF',
  unlock_condition JSONB NOT NULL, -- conditions to unlock
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary, mythic
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default titles
INSERT INTO title_definitions (name, name_es, description, description_es, icon, color, unlock_condition, rarity) VALUES
  ('First Steps', 'Primeros Pasos', 'Made your first prediction', 'Hiciste tu primera predicción', '👣', '#9CA3AF', '{"predictions_made": 1}', 'common'),
  ('On Fire', 'En Llamas', '5 correct predictions in a row', '5 predicciones correctas seguidas', '🔥', '#EF4444', '{"streak": 5}', 'rare'),
  ('Unstoppable', 'Imparable', '10 correct predictions in a row', '10 predicciones correctas seguidas', '💫', '#F59E0B', '{"streak": 10}', 'epic'),
  ('Mind Reader', 'Lector de Mentes', '50% accuracy with 100+ predictions', '50% de precisión con 100+ predicciones', '🧠', '#8B5CF6', '{"accuracy": 50, "min_predictions": 100}', 'epic'),
  ('The Oracle', 'El Oráculo', '70% accuracy with 500+ predictions', '70% de precisión con 500+ predicciones', '🔮', '#6366F1', '{"accuracy": 70, "min_predictions": 500}', 'legendary'),
  ('Time Traveler', 'Viajero del Tiempo', '90% accuracy with 1000+ predictions', '90% de precisión con 1000+ predicciones', '⏳', '#EC4899', '{"accuracy": 90, "min_predictions": 1000}', 'mythic'),
  ('Social Butterfly', 'Mariposa Social', 'Gained 100 followers', 'Conseguiste 100 seguidores', '🦋', '#14B8A6', '{"followers": 100}', 'rare'),
  ('Influencer', 'Influencer', 'Gained 1000 followers', 'Conseguiste 1000 seguidores', '⭐', '#F59E0B', '{"followers": 1000}', 'epic'),
  ('Celebrity', 'Celebridad', 'Gained 10000 followers', 'Conseguiste 10000 seguidores', '🌟', '#EF4444', '{"followers": 10000}', 'legendary'),
  ('Generous Soul', 'Alma Generosa', 'Gave 50 awards to others', 'Diste 50 premios a otros', '💝', '#EC4899', '{"awards_given": 50}', 'rare'),
  ('Philanthropist', 'Filántropo', 'Gave 500 awards to others', 'Diste 500 premios a otros', '👑', '#F59E0B', '{"awards_given": 500}', 'legendary'),
  ('Early Bird', 'Madrugador', 'Joined in the first month', 'Te uniste en el primer mes', '🐦', '#60A5FA', '{"early_adopter": true}', 'epic'),
  ('Veteran', 'Veterano', 'Active for 1 year', 'Activo por 1 año', '🎖️', '#9CA3AF', '{"days_active": 365}', 'rare'),
  ('Legend', 'Leyenda', 'Active for 3 years', 'Activo por 3 años', '🏆', '#F59E0B', '{"days_active": 1095}', 'legendary'),
  ('Night Owl', 'Búho Nocturno', 'Made 100 predictions between 12am-6am', 'Hiciste 100 predicciones entre 12am-6am', '🦉', '#6366F1', '{"night_predictions": 100}', 'rare'),
  ('Streak Master', 'Maestro de Rachas', '30 day login streak', 'Racha de 30 días de login', '🔥', '#EF4444', '{"login_streak": 30}', 'epic'),
  ('Crypto Guru', 'Gurú Crypto', '80% accuracy in crypto predictions', '80% de precisión en predicciones crypto', '₿', '#F7931A', '{"category_accuracy": {"crypto": 80}}', 'legendary'),
  ('Sports Analyst', 'Analista Deportivo', '80% accuracy in sports predictions', '80% de precisión en predicciones deportivas', '⚽', '#22C55E', '{"category_accuracy": {"sports": 80}}', 'legendary'),
  ('Political Pundit', 'Experto Político', '80% accuracy in political predictions', '80% de precisión en predicciones políticas', '🏛️', '#3B82F6', '{"category_accuracy": {"politics": 80}}', 'legendary')
ON CONFLICT (name) DO NOTHING;

-- 2.3 User unlocked titles
CREATE TABLE IF NOT EXISTS user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES title_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false, -- currently displayed title
  UNIQUE(user_id, title_id)
);

-- Add active title to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS active_title_id UUID REFERENCES title_definitions(id),
ADD COLUMN IF NOT EXISTS current_rank_id UUID REFERENCES user_ranks(id);

-- =====================================================
-- PART 3: DAILY STREAKS & MISSIONS SYSTEM
-- =====================================================

-- 3.1 User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_login_streak INTEGER DEFAULT 0,
  longest_login_streak INTEGER DEFAULT 0,
  current_prediction_streak INTEGER DEFAULT 0,
  longest_prediction_streak INTEGER DEFAULT 0,
  current_correct_streak INTEGER DEFAULT 0,
  longest_correct_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  last_prediction_date DATE,
  total_login_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Mission definitions
CREATE TABLE IF NOT EXISTS mission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description TEXT,
  description_es TEXT,
  mission_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'special', 'seasonal'
  category TEXT DEFAULT 'general', -- 'predictions', 'social', 'content', 'community'
  requirements JSONB NOT NULL, -- what needs to be done
  rewards JSONB NOT NULL, -- AP coins, XP, items
  icon TEXT,
  difficulty TEXT DEFAULT 'easy', -- easy, medium, hard, extreme
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default daily missions
INSERT INTO mission_definitions (name, name_es, description, description_es, mission_type, category, requirements, rewards, icon, difficulty) VALUES
  ('Daily Login', 'Login Diario', 'Log in to the app', 'Inicia sesión en la app', 'daily', 'general', '{"action": "login"}', '{"ap_coins": 10, "xp": 5}', '📅', 'easy'),
  ('Make a Prediction', 'Haz una Predicción', 'Create at least 1 prediction', 'Crea al menos 1 predicción', 'daily', 'predictions', '{"predictions": 1}', '{"ap_coins": 20, "xp": 10}', '🎯', 'easy'),
  ('Social Butterfly', 'Mariposa Social', 'React to 5 posts', 'Reacciona a 5 posts', 'daily', 'social', '{"reactions": 5}', '{"ap_coins": 15, "xp": 8}', '🦋', 'easy'),
  ('Commenter', 'Comentarista', 'Leave 3 comments', 'Deja 3 comentarios', 'daily', 'social', '{"comments": 3}', '{"ap_coins": 25, "xp": 12}', '💬', 'medium'),
  ('Sharer', 'Compartidor', 'Share 2 posts', 'Comparte 2 posts', 'daily', 'social', '{"shares": 2}', '{"ap_coins": 20, "xp": 10}', '🔄', 'easy'),
  ('Prediction Streak', 'Racha de Predicciones', 'Get 3 predictions correct', 'Acierta 3 predicciones', 'daily', 'predictions', '{"correct_predictions": 3}', '{"ap_coins": 50, "xp": 25}', '🔥', 'hard'),
  ('Story Time', 'Hora del Story', 'Post a story', 'Publica un story', 'daily', 'content', '{"stories": 1}', '{"ap_coins": 15, "xp": 8}', '📸', 'easy'),
  ('Community Helper', 'Ayudante Comunitario', 'Help 2 users with answers', 'Ayuda a 2 usuarios con respuestas', 'daily', 'community', '{"helpful_answers": 2}', '{"ap_coins": 30, "xp": 15}', '🤝', 'medium')
ON CONFLICT DO NOTHING;

-- Insert default weekly missions
INSERT INTO mission_definitions (name, name_es, description, description_es, mission_type, category, requirements, rewards, icon, difficulty) VALUES
  ('Weekly Warrior', 'Guerrero Semanal', 'Log in 7 days in a row', 'Inicia sesión 7 días seguidos', 'weekly', 'general', '{"login_streak": 7}', '{"ap_coins": 100, "xp": 50}', '⚔️', 'medium'),
  ('Prediction Master', 'Maestro de Predicciones', 'Make 20 predictions this week', 'Haz 20 predicciones esta semana', 'weekly', 'predictions', '{"predictions": 20}', '{"ap_coins": 150, "xp": 75}', '🎯', 'medium'),
  ('Social Star', 'Estrella Social', 'Gain 10 new followers', 'Gana 10 nuevos seguidores', 'weekly', 'social', '{"new_followers": 10}', '{"ap_coins": 200, "xp": 100}', '⭐', 'hard'),
  ('Content Creator', 'Creador de Contenido', 'Create 5 posts with media', 'Crea 5 posts con media', 'weekly', 'content', '{"media_posts": 5}', '{"ap_coins": 175, "xp": 85}', '🎬', 'medium'),
  ('Award Giver', 'Dador de Premios', 'Give 3 awards to others', 'Da 3 premios a otros', 'weekly', 'social', '{"awards_given": 3}', '{"ap_coins": 100, "xp": 50}', '🏆', 'medium')
ON CONFLICT DO NOTHING;

-- 3.3 User mission progress
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission_definitions(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}', -- current progress
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ, -- when rewards were claimed
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id, assigned_at)
);

-- =====================================================
-- PART 4: ACHIEVEMENTS SYSTEM
-- =====================================================

-- 4.1 Achievement definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  description TEXT,
  description_es TEXT,
  category TEXT NOT NULL, -- 'predictions', 'social', 'content', 'community', 'special'
  icon TEXT NOT NULL,
  icon_locked TEXT DEFAULT '🔒',
  color TEXT DEFAULT '#6366F1',
  points INTEGER DEFAULT 10, -- achievement points
  rarity TEXT DEFAULT 'common',
  requirements JSONB NOT NULL,
  rewards JSONB DEFAULT '{}',
  is_secret BOOLEAN DEFAULT false, -- hidden until unlocked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert achievements
INSERT INTO achievement_definitions (name, name_es, description, description_es, category, icon, color, points, rarity, requirements, rewards) VALUES
  -- Prediction achievements
  ('First Prediction', 'Primera Predicción', 'Made your first prediction', 'Hiciste tu primera predicción', 'predictions', '🎯', '#22C55E', 10, 'common', '{"predictions": 1}', '{"ap_coins": 50}'),
  ('Prediction Novice', 'Novato en Predicciones', 'Made 10 predictions', 'Hiciste 10 predicciones', 'predictions', '📊', '#3B82F6', 25, 'common', '{"predictions": 10}', '{"ap_coins": 100}'),
  ('Prediction Expert', 'Experto en Predicciones', 'Made 100 predictions', 'Hiciste 100 predicciones', 'predictions', '📈', '#8B5CF6', 50, 'rare', '{"predictions": 100}', '{"ap_coins": 500}'),
  ('Prediction Master', 'Maestro en Predicciones', 'Made 1000 predictions', 'Hiciste 1000 predicciones', 'predictions', '🏆', '#F59E0B', 100, 'epic', '{"predictions": 1000}', '{"ap_coins": 2000}'),
  ('Prediction Legend', 'Leyenda en Predicciones', 'Made 10000 predictions', 'Hiciste 10000 predicciones', 'predictions', '👑', '#EF4444', 500, 'legendary', '{"predictions": 10000}', '{"ap_coins": 10000}'),

  -- Accuracy achievements
  ('Sharp Eye', 'Ojo Agudo', '50% accuracy (min 50 predictions)', '50% de precisión (mín 50 predicciones)', 'predictions', '👁️', '#22C55E', 50, 'rare', '{"accuracy": 50, "min_predictions": 50}', '{"ap_coins": 300}'),
  ('Eagle Eye', 'Ojo de Águila', '70% accuracy (min 100 predictions)', '70% de precisión (mín 100 predicciones)', 'predictions', '🦅', '#3B82F6', 100, 'epic', '{"accuracy": 70, "min_predictions": 100}', '{"ap_coins": 1000}'),
  ('Psychic', 'Psíquico', '85% accuracy (min 500 predictions)', '85% de precisión (mín 500 predicciones)', 'predictions', '🔮', '#8B5CF6', 250, 'legendary', '{"accuracy": 85, "min_predictions": 500}', '{"ap_coins": 5000}'),

  -- Streak achievements
  ('Hot Streak', 'Racha Caliente', '5 correct predictions in a row', '5 predicciones correctas seguidas', 'predictions', '🔥', '#EF4444', 30, 'rare', '{"correct_streak": 5}', '{"ap_coins": 200}'),
  ('On Fire', 'En Llamas', '10 correct predictions in a row', '10 predicciones correctas seguidas', 'predictions', '💥', '#F59E0B', 75, 'epic', '{"correct_streak": 10}', '{"ap_coins": 750}'),
  ('Unstoppable', 'Imparable', '25 correct predictions in a row', '25 predicciones correctas seguidas', 'predictions', '⚡', '#EC4899', 200, 'legendary', '{"correct_streak": 25}', '{"ap_coins": 2500}'),

  -- Social achievements
  ('First Friend', 'Primer Amigo', 'Got your first follower', 'Conseguiste tu primer seguidor', 'social', '🤝', '#22C55E', 10, 'common', '{"followers": 1}', '{"ap_coins": 25}'),
  ('Making Friends', 'Haciendo Amigos', 'Got 50 followers', 'Conseguiste 50 seguidores', 'social', '👥', '#3B82F6', 50, 'rare', '{"followers": 50}', '{"ap_coins": 250}'),
  ('Popular', 'Popular', 'Got 500 followers', 'Conseguiste 500 seguidores', 'social', '⭐', '#8B5CF6', 100, 'epic', '{"followers": 500}', '{"ap_coins": 1000}'),
  ('Famous', 'Famoso', 'Got 5000 followers', 'Conseguiste 5000 seguidores', 'social', '🌟', '#F59E0B', 250, 'legendary', '{"followers": 5000}', '{"ap_coins": 5000}'),
  ('Celebrity', 'Celebridad', 'Got 50000 followers', 'Conseguiste 50000 seguidores', 'social', '👑', '#EF4444', 500, 'mythic', '{"followers": 50000}', '{"ap_coins": 25000}'),

  -- Content achievements
  ('First Post', 'Primer Post', 'Created your first post', 'Creaste tu primer post', 'content', '📝', '#22C55E', 10, 'common', '{"posts": 1}', '{"ap_coins": 25}'),
  ('Storyteller', 'Narrador', 'Created 50 posts', 'Creaste 50 posts', 'content', '📖', '#3B82F6', 50, 'rare', '{"posts": 50}', '{"ap_coins": 250}'),
  ('Content Machine', 'Máquina de Contenido', 'Created 500 posts', 'Creaste 500 posts', 'content', '🎬', '#8B5CF6', 100, 'epic', '{"posts": 500}', '{"ap_coins": 1000}'),
  ('First Story', 'Primer Story', 'Posted your first story', 'Publicaste tu primer story', 'content', '📸', '#22C55E', 10, 'common', '{"stories": 1}', '{"ap_coins": 25}'),
  ('Story Star', 'Estrella de Stories', 'Posted 100 stories', 'Publicaste 100 stories', 'content', '✨', '#F59E0B', 75, 'epic', '{"stories": 100}', '{"ap_coins": 500}'),

  -- Community achievements
  ('Helpful', 'Servicial', 'Received 10 helpful votes', 'Recibiste 10 votos de útil', 'community', '💡', '#22C55E', 25, 'common', '{"helpful_votes": 10}', '{"ap_coins": 100}'),
  ('Community Pillar', 'Pilar de la Comunidad', 'Received 100 helpful votes', 'Recibiste 100 votos de útil', 'community', '🏛️', '#3B82F6', 75, 'epic', '{"helpful_votes": 100}', '{"ap_coins": 500}'),
  ('Award Collector', 'Coleccionista de Premios', 'Received 10 awards', 'Recibiste 10 premios', 'community', '🏅', '#F59E0B', 50, 'rare', '{"awards_received": 10}', '{"ap_coins": 300}'),
  ('Trophy Case', 'Vitrina de Trofeos', 'Received 100 awards', 'Recibiste 100 premios', 'community', '🏆', '#EC4899', 150, 'legendary', '{"awards_received": 100}', '{"ap_coins": 2000}'),

  -- Login streak achievements
  ('Week Warrior', 'Guerrero Semanal', '7 day login streak', 'Racha de 7 días de login', 'special', '📅', '#22C55E', 25, 'common', '{"login_streak": 7}', '{"ap_coins": 100}'),
  ('Month Master', 'Maestro Mensual', '30 day login streak', 'Racha de 30 días de login', 'special', '📆', '#3B82F6', 75, 'rare', '{"login_streak": 30}', '{"ap_coins": 500}'),
  ('Quarter Champion', 'Campeón Trimestral', '90 day login streak', 'Racha de 90 días de login', 'special', '🗓️', '#8B5CF6', 150, 'epic', '{"login_streak": 90}', '{"ap_coins": 1500}'),
  ('Year Legend', 'Leyenda Anual', '365 day login streak', 'Racha de 365 días de login', 'special', '🎊', '#F59E0B', 500, 'legendary', '{"login_streak": 365}', '{"ap_coins": 10000}'),

  -- Secret achievements
  ('Night Owl', 'Búho Nocturno', 'Made 50 predictions between 12am-5am', 'Hiciste 50 predicciones entre 12am-5am', 'special', '🦉', '#6366F1', 50, 'rare', '{"night_predictions": 50}', '{"ap_coins": 300}'),
  ('Early Bird', 'Madrugador', 'Made 50 predictions between 5am-8am', 'Hiciste 50 predicciones entre 5am-8am', 'special', '🐦', '#22C55E', 50, 'rare', '{"early_predictions": 50}', '{"ap_coins": 300}'),
  ('Perfectionist', 'Perfeccionista', '100% accuracy for a month (min 30 predictions)', '100% de precisión por un mes (mín 30 predicciones)', 'special', '💎', '#EC4899', 300, 'mythic', '{"perfect_month": true, "min_predictions": 30}', '{"ap_coins": 5000}')
ON CONFLICT (name) DO NOTHING;

-- 4.2 User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  progress_max INTEGER DEFAULT 100,
  unlocked_at TIMESTAMPTZ,
  is_unlocked BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- Add achievement points to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS achievement_points INTEGER DEFAULT 0;

-- =====================================================
-- PART 5: CATEGORY EXPERTISE SYSTEM
-- =====================================================

-- 5.1 Categories definition
CREATE TABLE IF NOT EXISTS prediction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert categories
INSERT INTO prediction_categories (name, name_es, icon, color, description) VALUES
  ('Sports', 'Deportes', '⚽', '#22C55E', 'Football, basketball, tennis, etc.'),
  ('Crypto', 'Criptomonedas', '₿', '#F7931A', 'Bitcoin, Ethereum, altcoins'),
  ('Politics', 'Política', '🏛️', '#3B82F6', 'Elections, policies, world events'),
  ('Entertainment', 'Entretenimiento', '🎬', '#EC4899', 'Movies, music, celebrities'),
  ('Technology', 'Tecnología', '💻', '#8B5CF6', 'Tech companies, gadgets, AI'),
  ('Economy', 'Economía', '📈', '#F59E0B', 'Stock market, business, finance'),
  ('Gaming', 'Videojuegos', '🎮', '#EF4444', 'Esports, game releases'),
  ('Weather', 'Clima', '🌤️', '#60A5FA', 'Weather predictions'),
  ('Science', 'Ciencia', '🔬', '#14B8A6', 'Scientific discoveries'),
  ('Other', 'Otros', '🎲', '#9CA3AF', 'Miscellaneous predictions')
ON CONFLICT (name) DO NOTHING;

-- 5.2 User expertise per category
CREATE TABLE IF NOT EXISTS user_category_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES prediction_categories(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  expertise_level INTEGER DEFAULT 1, -- 1-10
  expertise_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- =====================================================
-- PART 6: PROFILE STATISTICS & HISTORY
-- =====================================================

-- 6.1 User activity log (for heatmap)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'prediction', 'post', 'comment', 'reaction'
  activity_date DATE NOT NULL,
  activity_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, activity_type, activity_date)
);

-- Index for heatmap queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON user_activity_log(user_id, activity_date);

-- 6.2 User stats history (for graphs)
CREATE TABLE IF NOT EXISTS user_stats_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  accuracy DECIMAL(5,2) DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  ap_coins_earned INTEGER DEFAULT 0,
  ap_coins_spent INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  followers_lost INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  awards_received INTEGER DEFAULT 0,
  awards_given INTEGER DEFAULT 0,
  UNIQUE(user_id, stat_date)
);

-- 6.3 AP Coins transaction history
CREATE TABLE IF NOT EXISTS ap_coins_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earned, negative for spent
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'prediction_win', 'award_given', 'award_received', 'mission', 'purchase', 'daily_bonus'
  description TEXT,
  reference_id UUID, -- ID of related item (prediction, award, etc)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coins_transactions_user ON ap_coins_transactions(user_id, created_at DESC);

-- =====================================================
-- PART 7: REELS/VIDEO & AUDIO CONTENT
-- =====================================================

-- 7.1 Reels/Videos
CREATE TABLE IF NOT EXISTS user_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  duration INTEGER, -- in seconds
  width INTEGER,
  height INTEGER,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 Reel interactions
CREATE TABLE IF NOT EXISTS reel_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID NOT NULL REFERENCES user_reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reel_id, user_id)
);

CREATE TABLE IF NOT EXISTS reel_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID NOT NULL REFERENCES user_reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES reel_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.3 Audio posts
CREATE TABLE IF NOT EXISTS user_audio_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  duration INTEGER, -- in seconds
  waveform_data JSONB, -- for visualization
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reels_user ON user_reels(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_user ON user_audio_posts(user_id, created_at DESC);

-- =====================================================
-- PART 8: COMMUNITIES/GROUPS SYSTEM
-- =====================================================

-- 8.1 Communities
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#6366F1',
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  rules JSONB DEFAULT '[]',
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 Community membership
DO $$ BEGIN
  CREATE TYPE community_role AS ENUM ('member', 'moderator', 'admin', 'owner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role community_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_banned BOOLEAN DEFAULT false,
  banned_until TIMESTAMPTZ,
  ban_reason TEXT,
  UNIQUE(community_id, user_id)
);

-- 8.3 Community posts (link to forum_posts)
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE SET NULL;

-- 8.4 Community events
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general', -- 'general', 'prediction_contest', 'ama', 'live_stream'
  image_url TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT, -- virtual/physical location
  max_participants INTEGER,
  participants_count INTEGER DEFAULT 0,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.5 Event participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going', -- 'going', 'interested', 'not_going'
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes for communities
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON forum_posts(community_id) WHERE community_id IS NOT NULL;

-- =====================================================
-- PART 9: COLLECTIBLES & CUSTOMIZATION
-- =====================================================

-- 9.1 Collectible types
DO $$ BEGIN
  CREATE TYPE collectible_type AS ENUM ('frame', 'effect', 'background', 'badge_style', 'emoji_pack', 'theme');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE collectible_rarity AS ENUM ('common', 'rare', 'epic', 'legendary', 'mythic', 'exclusive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 9.2 Collectibles catalog
CREATE TABLE IF NOT EXISTS collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description TEXT,
  type collectible_type NOT NULL,
  rarity collectible_rarity DEFAULT 'common',
  asset_url TEXT NOT NULL, -- image/animation URL
  preview_url TEXT,
  ap_cost INTEGER, -- null = not purchasable
  is_tradeable BOOLEAN DEFAULT true,
  is_limited BOOLEAN DEFAULT false,
  max_supply INTEGER, -- null = unlimited
  current_supply INTEGER DEFAULT 0,
  unlock_condition JSONB, -- null = purchasable, otherwise earned
  season TEXT, -- for seasonal items
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default collectibles
INSERT INTO collectibles (name, name_es, description, type, rarity, asset_url, ap_cost, is_tradeable) VALUES
  -- Frames
  ('Golden Frame', 'Marco Dorado', 'A shiny golden frame for your avatar', 'frame', 'rare', '/frames/golden.png', 500, true),
  ('Diamond Frame', 'Marco Diamante', 'Sparkling diamond frame', 'frame', 'epic', '/frames/diamond.png', 1500, true),
  ('Fire Frame', 'Marco de Fuego', 'Animated fire frame', 'frame', 'legendary', '/frames/fire.gif', 3000, true),
  ('Rainbow Frame', 'Marco Arcoíris', 'Colorful animated rainbow', 'frame', 'epic', '/frames/rainbow.gif', 2000, true),
  ('Neon Frame', 'Marco Neón', 'Glowing neon effect', 'frame', 'rare', '/frames/neon.gif', 750, true),

  -- Effects
  ('Sparkle Effect', 'Efecto Brillante', 'Sparkles around your profile', 'effect', 'rare', '/effects/sparkle.gif', 400, true),
  ('Lightning Effect', 'Efecto Rayo', 'Lightning bolts effect', 'effect', 'epic', '/effects/lightning.gif', 1200, true),
  ('Galaxy Effect', 'Efecto Galaxia', 'Cosmic galaxy background', 'effect', 'legendary', '/effects/galaxy.gif', 2500, true),

  -- Backgrounds
  ('Gradient Blue', 'Gradiente Azul', 'Blue gradient background', 'background', 'common', '/backgrounds/blue.png', 100, true),
  ('Sunset', 'Atardecer', 'Beautiful sunset background', 'background', 'rare', '/backgrounds/sunset.png', 300, true),
  ('Space', 'Espacio', 'Deep space background', 'background', 'epic', '/backgrounds/space.png', 800, true),
  ('Matrix', 'Matrix', 'Digital rain effect', 'background', 'legendary', '/backgrounds/matrix.gif', 1800, true)
ON CONFLICT DO NOTHING;

-- 9.3 User collectibles (inventory)
CREATE TABLE IF NOT EXISTS user_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  acquired_method TEXT DEFAULT 'purchase', -- 'purchase', 'trade', 'reward', 'event'
  is_equipped BOOLEAN DEFAULT false,
  serial_number INTEGER, -- for limited items
  UNIQUE(user_id, collectible_id)
);

-- 9.4 Trading system
DO $$ BEGIN
  CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS collectible_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status trade_status DEFAULT 'pending',
  sender_items UUID[] DEFAULT '{}', -- collectible IDs from sender
  receiver_items UUID[] DEFAULT '{}', -- collectible IDs from receiver
  sender_ap_coins INTEGER DEFAULT 0,
  receiver_ap_coins INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Add equipped collectibles to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS equipped_frame UUID REFERENCES collectibles(id),
ADD COLUMN IF NOT EXISTS equipped_effect UUID REFERENCES collectibles(id),
ADD COLUMN IF NOT EXISTS equipped_background UUID REFERENCES collectibles(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_collectibles_user ON user_collectibles(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_sender ON collectible_trades(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_receiver ON collectible_trades(receiver_id, status);

-- =====================================================
-- PART 10: PREDICTION TOURNAMENTS
-- =====================================================

-- 10.1 Tournaments
CREATE TABLE IF NOT EXISTS prediction_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  creator_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  tournament_type TEXT DEFAULT 'open', -- 'open', 'invite_only', 'community'
  category_id UUID REFERENCES prediction_categories(id),
  entry_fee INTEGER DEFAULT 0, -- AP Coins
  prize_pool INTEGER DEFAULT 0,
  max_participants INTEGER,
  participants_count INTEGER DEFAULT 0,
  min_predictions INTEGER DEFAULT 5, -- minimum predictions to qualify
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended', 'cancelled'
  rules JSONB DEFAULT '{}',
  prizes JSONB DEFAULT '[]', -- prize distribution
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2 Tournament participants
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES prediction_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predictions_made INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  points INTEGER DEFAULT 0,
  rank INTEGER,
  prize_won INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- 10.3 Tournament predictions (link)
CREATE TABLE IF NOT EXISTS tournament_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES prediction_tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL, -- reference to actual prediction
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON prediction_tournaments(status, start_date);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id, points DESC);

-- =====================================================
-- PART 11: LIVE STREAMING (Basic Structure)
-- =====================================================

-- 11.1 Live streams
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE, -- for streaming software
  stream_url TEXT,
  playback_url TEXT,
  status TEXT DEFAULT 'offline', -- 'offline', 'live', 'ended'
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  is_recorded BOOLEAN DEFAULT true,
  recording_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11.2 Stream chat
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false, -- super chat
  highlight_amount INTEGER, -- AP coins for highlight
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11.3 Stream viewers
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_time INTEGER DEFAULT 0, -- in seconds
  UNIQUE(stream_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_streams_status ON live_streams(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_stream_chat ON stream_chat_messages(stream_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pinned_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audio_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectible_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view ranks" ON user_ranks FOR SELECT USING (true);
CREATE POLICY "Anyone can view titles" ON title_definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON prediction_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view collectibles" ON collectibles FOR SELECT USING (true);
CREATE POLICY "Anyone can view communities" ON communities FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can view tournaments" ON prediction_tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Anyone can view missions" ON mission_definitions FOR SELECT USING (is_active = true);

-- User-specific policies
CREATE POLICY "Users can view social links" ON user_social_links FOR SELECT USING (true);
CREATE POLICY "Users can manage own social links" ON user_social_links FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view pinned posts" ON user_pinned_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage own pinned posts" ON user_pinned_posts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view featured items" ON user_featured_items FOR SELECT USING (true);
CREATE POLICY "Users can manage own featured items" ON user_featured_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view user titles" ON user_titles FOR SELECT USING (true);
CREATE POLICY "System manages titles" ON user_titles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages streaks" ON user_streaks FOR ALL USING (true);

CREATE POLICY "Users can view own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages missions" ON user_missions FOR ALL USING (true);

CREATE POLICY "Anyone can view user achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "System manages achievements" ON user_achievements FOR ALL USING (true);

CREATE POLICY "Anyone can view expertise" ON user_category_expertise FOR SELECT USING (true);
CREATE POLICY "System manages expertise" ON user_category_expertise FOR ALL USING (true);

CREATE POLICY "Users can view own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System logs activity" ON user_activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own stats history" ON user_stats_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages stats" ON user_stats_history FOR ALL USING (true);

CREATE POLICY "Users can view own transactions" ON ap_coins_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages transactions" ON ap_coins_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view reels" ON user_reels FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage own reels" ON user_reels FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reel likes" ON reel_likes FOR SELECT USING (true);
CREATE POLICY "Users can like reels" ON reel_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike reels" ON reel_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reel comments" ON reel_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on reels" ON reel_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON reel_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view audio posts" ON user_audio_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage own audio" ON user_audio_posts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Members can view community" ON community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view events" ON community_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON community_events FOR ALL USING (
  EXISTS(SELECT 1 FROM community_members WHERE community_id = community_events.community_id AND user_id = auth.uid() AND role IN ('admin', 'owner'))
);

CREATE POLICY "Anyone can view participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can participate" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update participation" ON event_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view user collectibles" ON user_collectibles FOR SELECT USING (true);
CREATE POLICY "System manages collectibles" ON user_collectibles FOR ALL USING (true);

CREATE POLICY "Users can view their trades" ON collectible_trades FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create trades" ON collectible_trades FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can respond to trades" ON collectible_trades FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Anyone can view tournament participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view tournament predictions" ON tournament_predictions FOR SELECT USING (true);
CREATE POLICY "System manages tournament predictions" ON tournament_predictions FOR ALL USING (true);

CREATE POLICY "Anyone can view stream chat" ON stream_chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can chat in streams" ON stream_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view stream viewers" ON stream_viewers FOR SELECT USING (true);
CREATE POLICY "System manages viewers" ON stream_viewers FOR ALL USING (true);

-- =====================================================
-- USEFUL FUNCTIONS
-- =====================================================

-- Function: Update user login streak
CREATE OR REPLACE FUNCTION update_login_streak(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak user_streaks;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
  -- Get or create streak record
  INSERT INTO user_streaks (user_id, last_login_date, current_login_streak, total_login_days)
  VALUES (p_user_id, v_today, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_login_streak = CASE
      WHEN user_streaks.last_login_date = v_yesterday THEN user_streaks.current_login_streak + 1
      WHEN user_streaks.last_login_date = v_today THEN user_streaks.current_login_streak
      ELSE 1
    END,
    longest_login_streak = GREATEST(
      user_streaks.longest_login_streak,
      CASE
        WHEN user_streaks.last_login_date = v_yesterday THEN user_streaks.current_login_streak + 1
        ELSE 1
      END
    ),
    total_login_days = CASE
      WHEN user_streaks.last_login_date != v_today THEN user_streaks.total_login_days + 1
      ELSE user_streaks.total_login_days
    END,
    last_login_date = v_today,
    updated_at = NOW()
  RETURNING * INTO v_streak;

  -- Log activity
  INSERT INTO user_activity_log (user_id, activity_type, activity_date, activity_count)
  VALUES (p_user_id, 'login', v_today, 1)
  ON CONFLICT (user_id, activity_type, activity_date)
  DO UPDATE SET activity_count = user_activity_log.activity_count + 1;

  -- Update user online status
  UPDATE users SET last_seen = NOW(), is_online = true WHERE id = p_user_id;

  RETURN json_build_object(
    'current_streak', v_streak.current_login_streak,
    'longest_streak', v_streak.longest_login_streak,
    'total_days', v_streak.total_login_days
  );
END;
$$;

-- Function: Get user rank
CREATE OR REPLACE FUNCTION get_user_rank(p_level INTEGER)
RETURNS TABLE (
  rank_id UUID,
  rank_name TEXT,
  rank_name_es TEXT,
  rank_icon TEXT,
  rank_color TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, name_es, icon, color
  FROM user_ranks
  WHERE min_level <= p_level AND (max_level IS NULL OR max_level >= p_level)
  LIMIT 1;
END;
$$;

-- Function: Assign daily missions
CREATE OR REPLACE FUNCTION assign_daily_missions(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mission mission_definitions;
  v_count INTEGER := 0;
BEGIN
  -- Delete old expired missions
  DELETE FROM user_missions
  WHERE user_id = p_user_id
    AND expires_at < NOW()
    AND is_completed = false;

  -- Assign new daily missions (if not already assigned today)
  FOR v_mission IN
    SELECT * FROM mission_definitions
    WHERE mission_type = 'daily' AND is_active = true
    AND id NOT IN (
      SELECT mission_id FROM user_missions
      WHERE user_id = p_user_id
        AND assigned_at::date = CURRENT_DATE
    )
    ORDER BY random()
    LIMIT 5
  LOOP
    INSERT INTO user_missions (user_id, mission_id, expires_at)
    VALUES (p_user_id, v_mission.id, (CURRENT_DATE + 1)::timestamptz);
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('missions_assigned', v_count);
END;
$$;

-- Function: Log AP coins transaction
CREATE OR REPLACE FUNCTION log_ap_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

  RETURN json_build_object('new_balance', v_new_balance, 'amount', p_amount);
END;
$$;

-- Function: Purchase collectible
CREATE OR REPLACE FUNCTION purchase_collectible(
  p_user_id UUID,
  p_collectible_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_collectible collectibles;
  v_user_coins INTEGER;
  v_serial INTEGER;
BEGIN
  -- Get collectible
  SELECT * INTO v_collectible FROM collectibles WHERE id = p_collectible_id;

  IF v_collectible IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Collectible not found');
  END IF;

  IF v_collectible.ap_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'This collectible cannot be purchased');
  END IF;

  -- Check availability
  IF v_collectible.is_limited AND v_collectible.current_supply >= v_collectible.max_supply THEN
    RETURN json_build_object('success', false, 'error', 'Sold out');
  END IF;

  IF v_collectible.available_until IS NOT NULL AND v_collectible.available_until < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'No longer available');
  END IF;

  -- Check if already owned
  IF EXISTS(SELECT 1 FROM user_collectibles WHERE user_id = p_user_id AND collectible_id = p_collectible_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already owned');
  END IF;

  -- Check user balance
  SELECT ap_coins INTO v_user_coins FROM users WHERE id = p_user_id;

  IF v_user_coins < v_collectible.ap_cost THEN
    RETURN json_build_object('success', false, 'error', 'Not enough AP Coins');
  END IF;

  -- Process purchase
  v_serial := v_collectible.current_supply + 1;

  UPDATE users SET ap_coins = ap_coins - v_collectible.ap_cost WHERE id = p_user_id;
  UPDATE collectibles SET current_supply = current_supply + 1 WHERE id = p_collectible_id;

  INSERT INTO user_collectibles (user_id, collectible_id, acquired_method, serial_number)
  VALUES (p_user_id, p_collectible_id, 'purchase', CASE WHEN v_collectible.is_limited THEN v_serial ELSE NULL END);

  -- Log transaction
  PERFORM log_ap_transaction(p_user_id, -v_collectible.ap_cost, 'purchase', 'Purchased ' || v_collectible.name, p_collectible_id);

  RETURN json_build_object(
    'success', true,
    'collectible_name', v_collectible.name,
    'serial_number', v_serial,
    'cost', v_collectible.ap_cost
  );
END;
$$;

-- Function: Get user profile with all data
CREATE OR REPLACE FUNCTION get_complete_user_profile(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user users;
  v_result JSON;
BEGIN
  SELECT * INTO v_user FROM users WHERE username = p_username;

  IF v_user IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  SELECT json_build_object(
    'user', row_to_json(v_user),
    'rank', (SELECT row_to_json(r) FROM user_ranks r WHERE r.min_level <= v_user.level AND (r.max_level IS NULL OR r.max_level >= v_user.level)),
    'active_title', (SELECT row_to_json(t) FROM title_definitions t WHERE t.id = v_user.active_title_id),
    'badges', (SELECT json_agg(row_to_json(b)) FROM user_badges b WHERE b.user_id = v_user.id),
    'social_links', (SELECT json_agg(row_to_json(s) ORDER BY s.display_order) FROM user_social_links s WHERE s.user_id = v_user.id),
    'pinned_posts', (SELECT json_agg(p.post_id ORDER BY p.pin_order) FROM user_pinned_posts p WHERE p.user_id = v_user.id),
    'equipped_items', json_build_object(
      'frame', v_user.equipped_frame,
      'effect', v_user.equipped_effect,
      'background', v_user.equipped_background
    ),
    'streak', (SELECT row_to_json(s) FROM user_streaks s WHERE s.user_id = v_user.id),
    'stats', json_build_object(
      'followers', (SELECT COUNT(*) FROM user_follows WHERE following_id = v_user.id),
      'following', (SELECT COUNT(*) FROM user_follows WHERE follower_id = v_user.id),
      'posts', (SELECT COUNT(*) FROM forum_posts WHERE user_id = v_user.id),
      'predictions', v_user.total_predictions,
      'accuracy', v_user.prediction_accuracy,
      'achievement_points', v_user.achievement_points
    ),
    'top_categories', (
      SELECT json_agg(row_to_json(e) ORDER BY e.accuracy DESC)
      FROM user_category_expertise e
      WHERE e.user_id = v_user.id
      LIMIT 3
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION update_login_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION assign_daily_missions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_ap_transaction(UUID, INTEGER, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_collectible(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_complete_user_profile(TEXT) TO authenticated, anon;
