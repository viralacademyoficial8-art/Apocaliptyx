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

export const profileService = new ProfileService();