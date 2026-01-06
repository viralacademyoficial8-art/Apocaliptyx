// src/services/profile.service.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UserProfileFromDB {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  ap_coins: number;
  level: number;
  xp: number;
  is_verified: boolean;
  is_premium: boolean;
  is_banned: boolean;
  total_predictions: number;
  correct_predictions: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface UserStatsFromDB {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalEarnings: number;
  scenariosCreated: number;
  followersCount: number;
  followingCount: number;
}

class ProfileService {
  /**
   * Obtener perfil por ID de usuario
   */
  async getById(userId: string): Promise<UserProfileFromDB | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as UserProfileFromDB;
    } catch (error) {
      console.error("Error in getById:", error);
      return null;
    }
  }

  /**
   * Obtener perfil por username
   */
  async getByUsername(username: string): Promise<UserProfileFromDB | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.toLowerCase())
        .single();

      if (error) {
        console.error("Error fetching profile by username:", error);
        return null;
      }

      return data as UserProfileFromDB;
    } catch (error) {
      console.error("Error in getByUsername:", error);
      return null;
    }
  }

  /**
   * Actualizar perfil
   */
  async update(
    userId: string,
    data: Partial<{
      display_name: string;
      bio: string;
      avatar_url: string;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in update:", error);
      return false;
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getStats(userId: string): Promise<UserStatsFromDB> {
    try {
      // Obtener datos básicos del usuario
      const { data: user } = await supabase
        .from("users")
        .select("total_predictions, correct_predictions, total_earnings")
        .eq("id", userId)
        .single();

      // Contar escenarios creados
      const { count: scenariosCreated } = await supabase
        .from("scenarios")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", userId);

      // Contar seguidores
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      // Contar siguiendo
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      const totalPredictions = user?.total_predictions || 0;
      const correctPredictions = user?.correct_predictions || 0;
      const accuracy = totalPredictions > 0 
        ? Math.round((correctPredictions / totalPredictions) * 100) 
        : 0;

      return {
        totalPredictions,
        correctPredictions,
        accuracy,
        totalEarnings: user?.total_earnings || 0,
        scenariosCreated: scenariosCreated || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        totalEarnings: 0,
        scenariosCreated: 0,
        followersCount: 0,
        followingCount: 0,
      };
    }
  }

  /**
   * Obtener historial de predicciones del usuario
   */
  async getPredictionHistory(userId: string, limit = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select(`
          id,
          prediction,
          amount,
          status,
          profit,
          created_at,
          scenarios (
            id,
            title,
            category
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching prediction history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPredictionHistory:", error);
      return [];
    }
  }

  /**
   * Obtener escenarios creados por el usuario
   */
  async getCreatedScenarios(userId: string, limit = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching created scenarios:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCreatedScenarios:", error);
      return [];
    }
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Seguir a un usuario
   */
  async follow(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("follows").insert({
        follower_id: followerId,
        following_id: followingId,
      });

      if (error) {
        console.error("Error following user:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in follow:", error);
      return false;
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

      if (error) {
        console.error("Error unfollowing user:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in unfollow:", error);
      return false;
    }
  }

  /**
   * Obtener seguidores de un usuario
   */
  async getFollowers(userId: string, limit = 50): Promise<UserProfileFromDB[]> {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower:users!follows_follower_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            level,
            is_verified
          )
        `)
        .eq("following_id", userId)
        .limit(limit);

      if (error) {
        console.error("Error fetching followers:", error);
        return [];
      }

      return (data?.map((d: any) => d.follower) || []) as UserProfileFromDB[];
    } catch (error) {
      console.error("Error in getFollowers:", error);
      return [];
    }
  }

  /**
   * Obtener usuarios que sigue
   */
  async getFollowing(userId: string, limit = 50): Promise<UserProfileFromDB[]> {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          following:users!follows_following_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            level,
            is_verified
          )
        `)
        .eq("follower_id", userId)
        .limit(limit);

      if (error) {
        console.error("Error fetching following:", error);
        return [];
      }

      return (data?.map((d: any) => d.following) || []) as UserProfileFromDB[];
    } catch (error) {
      console.error("Error in getFollowing:", error);
      return [];
    }
  }
}

// ==================== EXTENDED TYPES ====================

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface PinnedPost {
  id: string;
  user_id: string;
  post_id: string;
  pin_order: number;
  pinned_at: string;
  post?: any;
}

export interface ProfileTheme {
  primary_color: string;
  secondary_color: string;
  background: string;
}

export interface ActivityLogEntry {
  activity_date: string;
  activity_count: number;
  activity_type: string;
}

export interface StatsHistoryEntry {
  stat_date: string;
  accuracy: number;
  total_predictions: number;
  correct_predictions: number;
  ap_coins_earned: number;
  followers_gained: number;
}

export interface APTransaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

// Extended Profile Service
class ExtendedProfileService extends ProfileService {
  // ============================================
  // PROFILE CUSTOMIZATION
  // ============================================

  async getCompleteProfile(username: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_complete_user_profile', {
      p_username: username
    });

    if (error) {
      console.error('Error getting complete profile:', error);
      return null;
    }

    return data;
  }

  async updateBanner(userId: string, bannerUrl: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ banner_url: bannerUrl })
      .eq('id', userId);

    return !error;
  }

  async updateProfileMusic(
    userId: string,
    musicUrl: string,
    title: string,
    artist: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        profile_music_url: musicUrl,
        profile_music_title: title,
        profile_music_artist: artist
      })
      .eq('id', userId);

    return !error;
  }

  async removeProfileMusic(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        profile_music_url: null,
        profile_music_title: null,
        profile_music_artist: null
      })
      .eq('id', userId);

    return !error;
  }

  async updateTheme(userId: string, theme: ProfileTheme): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        theme_primary_color: theme.primary_color,
        theme_secondary_color: theme.secondary_color,
        theme_background: theme.background
      })
      .eq('id', userId);

    return !error;
  }

  async updatePrivacySettings(
    userId: string,
    showOnline: boolean,
    showActivity: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        show_online_status: showOnline,
        show_activity_status: showActivity
      })
      .eq('id', userId);

    return !error;
  }

  // ============================================
  // SOCIAL LINKS
  // ============================================

  async getSocialLinks(userId: string): Promise<SocialLink[]> {
    const { data, error } = await supabase
      .from('user_social_links')
      .select('*')
      .eq('user_id', userId)
      .order('display_order');

    if (error) return [];
    return data || [];
  }

  async addSocialLink(userId: string, platform: string, url: string): Promise<SocialLink | null> {
    const { data, error } = await supabase
      .from('user_social_links')
      .upsert({ user_id: userId, platform, url }, { onConflict: 'user_id,platform' })
      .select()
      .single();

    if (error) return null;
    return data;
  }

  async removeSocialLink(userId: string, platform: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_social_links')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    return !error;
  }

  // ============================================
  // PINNED POSTS
  // ============================================

  async getPinnedPosts(userId: string): Promise<PinnedPost[]> {
    const { data, error } = await supabase
      .from('user_pinned_posts')
      .select('*, post:forum_posts(*)')
      .eq('user_id', userId)
      .order('pin_order');

    if (error) return [];
    return data || [];
  }

  async pinPost(userId: string, postId: string): Promise<{ success: boolean; error?: string }> {
    const { data: existing } = await supabase
      .from('user_pinned_posts')
      .select('id')
      .eq('user_id', userId);

    if (existing && existing.length >= 3) {
      return { success: false, error: 'Maximum 3 pinned posts allowed' };
    }

    const { error } = await supabase
      .from('user_pinned_posts')
      .insert({ user_id: userId, post_id: postId, pin_order: existing?.length || 0 });

    if (error) {
      return { success: false, error: error.code === '23505' ? 'Post already pinned' : error.message };
    }

    return { success: true };
  }

  async unpinPost(userId: string, postId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_pinned_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    return !error;
  }

  // ============================================
  // ACTIVITY & STATS
  // ============================================

  async getActivityHeatmap(userId: string): Promise<ActivityLogEntry[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data, error } = await supabase
      .from('user_activity_log')
      .select('activity_date, activity_count, activity_type')
      .eq('user_id', userId)
      .gte('activity_date', oneYearAgo.toISOString().split('T')[0])
      .order('activity_date');

    if (error) return [];
    return data || [];
  }

  async getStatsHistory(userId: string, days: number = 30): Promise<StatsHistoryEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('user_stats_history')
      .select('*')
      .eq('user_id', userId)
      .gte('stat_date', startDate.toISOString().split('T')[0])
      .order('stat_date');

    if (error) return [];
    return data || [];
  }

  async getAPTransactions(userId: string, limit: number = 50): Promise<APTransaction[]> {
    const { data, error } = await supabase
      .from('ap_coins_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  }

  async logActivity(userId: string, activityType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('user_activity_log')
      .upsert({
        user_id: userId,
        activity_type: activityType,
        activity_date: today,
        activity_count: 1
      }, { onConflict: 'user_id,activity_type,activity_date' });
  }

  async updateLoginStreak(userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('update_login_streak', { p_user_id: userId });
    if (error) return null;
    return data;
  }

  // ============================================
  // EQUIPPED ITEMS
  // ============================================

  async equipCollectible(userId: string, collectibleId: string, slot: 'frame' | 'effect' | 'background'): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ [`equipped_${slot}`]: collectibleId })
      .eq('id', userId);

    return !error;
  }

  async unequipCollectible(userId: string, slot: 'frame' | 'effect' | 'background'): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ [`equipped_${slot}`]: null })
      .eq('id', userId);

    return !error;
  }

  // ============================================
  // TITLES
  // ============================================

  async setActiveTitle(userId: string, titleId: string | null): Promise<boolean> {
    await supabase
      .from('user_titles')
      .update({ is_active: false })
      .eq('user_id', userId);

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
  }

  async getUnlockedTitles(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_titles')
      .select('*, title:title_definitions(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) return [];
    return data || [];
  }
}

export const profileService = new ExtendedProfileService();