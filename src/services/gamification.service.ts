// src/services/gamification.service.ts
// Gamification Service - Ranks, Missions, Achievements, Streaks

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==================== TYPES ====================

export interface UserRank {
  id: string;
  name: string;
  name_es: string;
  min_level: number;
  max_level: number | null;
  icon: string;
  color: string;
  perks: Record<string, any>;
}

export interface TitleDefinition {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  icon: string;
  color: string;
  unlock_condition: Record<string, any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface UserTitle {
  id: string;
  user_id: string;
  title_id: string;
  unlocked_at: string;
  is_active: boolean;
  title?: TitleDefinition;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_login_streak: number;
  longest_login_streak: number;
  current_prediction_streak: number;
  longest_prediction_streak: number;
  current_correct_streak: number;
  longest_correct_streak: number;
  last_login_date: string;
  total_login_days: number;
}

export interface Mission {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  mission_type: 'daily' | 'weekly' | 'monthly' | 'special' | 'seasonal';
  category: string;
  requirements: Record<string, any>;
  rewards: { ap_coins?: number; xp?: number; items?: string[] };
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  progress: Record<string, any>;
  is_completed: boolean;
  completed_at: string | null;
  claimed_at: string | null;
  assigned_at: string;
  expires_at: string;
  mission?: Mission;
}

export interface Achievement {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  category: string;
  icon: string;
  icon_locked: string;
  color: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  is_secret: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  progress_max: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  is_claimed: boolean;
  achievement?: Achievement;
}

export interface CategoryExpertise {
  id: string;
  user_id: string;
  category_id: string;
  total_predictions: number;
  correct_predictions: number;
  accuracy: number;
  expertise_level: number;
  expertise_xp: number;
  category?: {
    name: string;
    name_es: string;
    icon: string;
    color: string;
  };
}

// ==================== SERVICE ====================

export const gamificationService = {
  // ============================================
  // RANKS
  // ============================================

  async getAllRanks(): Promise<UserRank[]> {
    const { data, error } = await supabase
      .from('user_ranks')
      .select('*')
      .order('min_level');

    if (error) return [];
    return data || [];
  },

  async getRankForLevel(level: number): Promise<UserRank | null> {
    const { data, error } = await supabase
      .from('user_ranks')
      .select('*')
      .lte('min_level', level)
      .or(`max_level.gte.${level},max_level.is.null`)
      .single();

    if (error) return null;
    return data;
  },

  async getUserRank(userId: string): Promise<UserRank | null> {
    const { data: user } = await supabase
      .from('users')
      .select('level')
      .eq('id', userId)
      .single();

    if (!user) return null;
    return this.getRankForLevel(user.level);
  },

  // ============================================
  // TITLES
  // ============================================

  async getAllTitles(): Promise<TitleDefinition[]> {
    const { data, error } = await supabase
      .from('title_definitions')
      .select('*')
      .order('rarity');

    if (error) return [];
    return data || [];
  },

  async getUserTitles(userId: string): Promise<UserTitle[]> {
    const { data, error } = await supabase
      .from('user_titles')
      .select('*, title:title_definitions(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async setActiveTitle(userId: string, titleId: string | null): Promise<boolean> {
    // Unset current active
    await supabase
      .from('user_titles')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Update user
    const { error } = await supabase
      .from('users')
      .update({ active_title_id: titleId })
      .eq('id', userId);

    if (!error && titleId) {
      await supabase
        .from('user_titles')
        .update({ is_active: true })
        .eq('user_id', userId)
        .eq('title_id', titleId);
    }

    return !error;
  },

  async unlockTitle(userId: string, titleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_titles')
      .insert({ user_id: userId, title_id: titleId })
      .single();

    return !error;
  },

  // ============================================
  // STREAKS
  // ============================================

  async getUserStreak(userId: string): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  },

  async updateLoginStreak(userId: string): Promise<{ current_streak: number; longest_streak: number; total_days: number } | null> {
    const { data, error } = await supabase.rpc('update_login_streak', {
      p_user_id: userId
    });

    if (error) return null;
    return data;
  },

  async updatePredictionStreak(userId: string, isCorrect: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Get current streak
    let { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) {
      // Create if doesn't exist
      const { data: newStreak } = await supabase
        .from('user_streaks')
        .insert({ user_id: userId })
        .select()
        .single();
      streak = newStreak;
    }

    if (!streak) return;

    const newPredictionStreak = streak.current_prediction_streak + 1;
    const newCorrectStreak = isCorrect ? streak.current_correct_streak + 1 : 0;

    await supabase
      .from('user_streaks')
      .update({
        current_prediction_streak: newPredictionStreak,
        longest_prediction_streak: Math.max(streak.longest_prediction_streak, newPredictionStreak),
        current_correct_streak: newCorrectStreak,
        longest_correct_streak: Math.max(streak.longest_correct_streak, newCorrectStreak),
        last_prediction_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  },

  // ============================================
  // MISSIONS
  // ============================================

  async getDailyMissions(userId: string): Promise<UserMission[]> {
    // First assign daily missions if needed
    await supabase.rpc('assign_daily_missions', { p_user_id: userId });

    const { data, error } = await supabase
      .from('user_missions')
      .select('*, mission:mission_definitions(*)')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('is_completed')
      .order('assigned_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getWeeklyMissions(userId: string): Promise<UserMission[]> {
    const { data, error } = await supabase
      .from('user_missions')
      .select('*, mission:mission_definitions!inner(*)')
      .eq('user_id', userId)
      .eq('mission_definitions.mission_type', 'weekly')
      .gte('expires_at', new Date().toISOString());

    if (error) return [];
    return data || [];
  },

  async updateMissionProgress(
    userId: string,
    missionId: string,
    progress: Record<string, any>
  ): Promise<boolean> {
    const { data: userMission } = await supabase
      .from('user_missions')
      .select('*, mission:mission_definitions(*)')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .single();

    if (!userMission) return false;

    const mission = userMission.mission as Mission;
    const currentProgress = { ...userMission.progress, ...progress };

    // Check if mission is completed
    let isCompleted = true;
    for (const [key, required] of Object.entries(mission.requirements)) {
      if ((currentProgress[key] || 0) < (required as number)) {
        isCompleted = false;
        break;
      }
    }

    const { error } = await supabase
      .from('user_missions')
      .update({
        progress: currentProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', userMission.id);

    return !error;
  },

  async claimMissionReward(userId: string, userMissionId: string): Promise<{ success: boolean; rewards?: any; error?: string }> {
    const { data: userMission } = await supabase
      .from('user_missions')
      .select('*, mission:mission_definitions(*)')
      .eq('id', userMissionId)
      .eq('user_id', userId)
      .single();

    if (!userMission) {
      return { success: false, error: 'Mission not found' };
    }

    if (!userMission.is_completed) {
      return { success: false, error: 'Mission not completed' };
    }

    if (userMission.claimed_at) {
      return { success: false, error: 'Reward already claimed' };
    }

    const rewards = (userMission.mission as Mission).rewards;

    // Apply rewards
    if (rewards.ap_coins) {
      await supabase.rpc('log_ap_transaction', {
        p_user_id: userId,
        p_amount: rewards.ap_coins,
        p_type: 'mission',
        p_description: `Mission completed: ${(userMission.mission as Mission).name}`,
        p_reference_id: userMission.mission_id
      });
    }

    if (rewards.xp) {
      await supabase
        .from('users')
        .update({ xp: supabase.rpc('increment_value', { x: rewards.xp }) })
        .eq('id', userId);
    }

    // Mark as claimed
    await supabase
      .from('user_missions')
      .update({ claimed_at: new Date().toISOString() })
      .eq('id', userMissionId);

    return { success: true, rewards };
  },

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('category')
      .order('points');

    if (error) return [];
    return data || [];
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_definitions(*)')
      .eq('user_id', userId)
      .order('is_unlocked', { ascending: false })
      .order('unlocked_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_definitions(*)')
      .eq('user_id', userId)
      .eq('is_unlocked', true)
      .order('unlocked_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<{ unlocked: boolean }> {
    const { data: achievement } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (!achievement) return { unlocked: false };

    // Get or create user achievement
    let { data: userAchievement } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (!userAchievement) {
      const { data: newAchievement } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          progress: 0,
          progress_max: 100
        })
        .select()
        .single();
      userAchievement = newAchievement;
    }

    if (!userAchievement || userAchievement.is_unlocked) {
      return { unlocked: userAchievement?.is_unlocked || false };
    }

    const newProgress = Math.min(progress, userAchievement.progress_max);
    const isUnlocked = newProgress >= userAchievement.progress_max;

    await supabase
      .from('user_achievements')
      .update({
        progress: newProgress,
        is_unlocked: isUnlocked,
        unlocked_at: isUnlocked ? new Date().toISOString() : null
      })
      .eq('id', userAchievement.id);

    if (isUnlocked) {
      // Add achievement points
      await supabase
        .from('users')
        .update({
          achievement_points: supabase.rpc('increment_value', { x: achievement.points })
        })
        .eq('id', userId);
    }

    return { unlocked: isUnlocked };
  },

  async claimAchievementReward(userId: string, userAchievementId: string): Promise<{ success: boolean; rewards?: any; error?: string }> {
    const { data: userAchievement } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_definitions(*)')
      .eq('id', userAchievementId)
      .eq('user_id', userId)
      .single();

    if (!userAchievement) {
      return { success: false, error: 'Achievement not found' };
    }

    if (!userAchievement.is_unlocked) {
      return { success: false, error: 'Achievement not unlocked' };
    }

    if (userAchievement.is_claimed) {
      return { success: false, error: 'Reward already claimed' };
    }

    const rewards = (userAchievement.achievement as Achievement).rewards;

    if (rewards.ap_coins) {
      await supabase.rpc('log_ap_transaction', {
        p_user_id: userId,
        p_amount: rewards.ap_coins,
        p_type: 'achievement',
        p_description: `Achievement unlocked: ${(userAchievement.achievement as Achievement).name}`,
        p_reference_id: userAchievement.achievement_id
      });
    }

    await supabase
      .from('user_achievements')
      .update({ is_claimed: true, claimed_at: new Date().toISOString() })
      .eq('id', userAchievementId);

    return { success: true, rewards };
  },

  // ============================================
  // CATEGORY EXPERTISE
  // ============================================

  async getUserExpertise(userId: string): Promise<CategoryExpertise[]> {
    const { data, error } = await supabase
      .from('user_category_expertise')
      .select('*, category:prediction_categories(*)')
      .eq('user_id', userId)
      .order('accuracy', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getTopExpertise(userId: string, limit: number = 3): Promise<CategoryExpertise[]> {
    const { data, error } = await supabase
      .from('user_category_expertise')
      .select('*, category:prediction_categories(*)')
      .eq('user_id', userId)
      .order('accuracy', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  async updateCategoryExpertise(
    userId: string,
    categoryId: string,
    isCorrect: boolean
  ): Promise<void> {
    // Get or create expertise record
    let { data: expertise } = await supabase
      .from('user_category_expertise')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    if (!expertise) {
      const { data: newExpertise } = await supabase
        .from('user_category_expertise')
        .insert({
          user_id: userId,
          category_id: categoryId,
          total_predictions: 0,
          correct_predictions: 0
        })
        .select()
        .single();
      expertise = newExpertise;
    }

    if (!expertise) return;

    const totalPredictions = expertise.total_predictions + 1;
    const correctPredictions = expertise.correct_predictions + (isCorrect ? 1 : 0);
    const accuracy = (correctPredictions / totalPredictions) * 100;

    // Calculate expertise level (1-10 based on total and accuracy)
    let expertiseLevel = Math.min(10, Math.floor(totalPredictions / 50) + 1);
    if (accuracy >= 70 && totalPredictions >= 50) expertiseLevel = Math.max(expertiseLevel, 5);
    if (accuracy >= 80 && totalPredictions >= 100) expertiseLevel = Math.max(expertiseLevel, 8);
    if (accuracy >= 85 && totalPredictions >= 200) expertiseLevel = 10;

    await supabase
      .from('user_category_expertise')
      .update({
        total_predictions: totalPredictions,
        correct_predictions: correctPredictions,
        accuracy: accuracy.toFixed(2),
        expertise_level: expertiseLevel,
        expertise_xp: expertise.expertise_xp + (isCorrect ? 20 : 5),
        updated_at: new Date().toISOString()
      })
      .eq('id', expertise.id);
  },

  // ============================================
  // LEADERBOARDS
  // ============================================

  async getLeaderboard(type: 'level' | 'accuracy' | 'achievements' | 'streak', limit: number = 10): Promise<any[]> {
    let query = supabase.from('users').select('id, username, avatar_url, level, ap_coins, achievement_points');

    switch (type) {
      case 'level':
        query = query.order('level', { ascending: false }).order('xp', { ascending: false });
        break;
      case 'accuracy':
        query = query.gt('total_predictions', 10).order('prediction_accuracy', { ascending: false });
        break;
      case 'achievements':
        query = query.order('achievement_points', { ascending: false });
        break;
      case 'streak':
        // Need to join with streaks table
        const { data } = await supabase
          .from('user_streaks')
          .select('user_id, current_login_streak, users(id, username, avatar_url, level)')
          .order('current_login_streak', { ascending: false })
          .limit(limit);
        return data || [];
    }

    const { data } = await query.limit(limit);
    return data || [];
  },

  // ============================================
  // XP & LEVEL
  // ============================================

  async addXP(userId: string, amount: number, reason: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const { data: user } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (!user) return { newXP: 0, newLevel: 1, leveledUp: false };

    const newXP = user.xp + amount;

    // XP required per level: level * 100
    const xpForNextLevel = (user.level + 1) * 100;
    const leveledUp = newXP >= xpForNextLevel;
    const newLevel = leveledUp ? user.level + 1 : user.level;
    const remainingXP = leveledUp ? newXP - xpForNextLevel : newXP;

    await supabase
      .from('users')
      .update({
        xp: remainingXP,
        level: newLevel
      })
      .eq('id', userId);

    return { newXP: remainingXP, newLevel, leveledUp };
  }
};
