// src/services/publicProfile.service.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PublicProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: string;
  level: number;
  xp: number;
  ap_coins: number;
  is_verified: boolean;
  is_premium: boolean;
  is_banned: boolean;
  total_predictions: number;
  correct_predictions: number;
  total_earnings: number;
  created_at: string;
  // Calculated fields
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  accuracy: number;
  rank: number;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

class PublicProfileService {
  // Obtener perfil por username
  async getByUsername(username: string): Promise<PublicProfile | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Obtener contadores de seguidores
    const [followersResult, followingResult, rankResult] = await Promise.all([
      supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user.id),
      supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', user.id),
      this.getUserRank(user.id),
    ]);

    const accuracy = user.total_predictions > 0
      ? (user.correct_predictions / user.total_predictions) * 100
      : 0;

    return {
      ...user,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      accuracy: Math.round(accuracy * 10) / 10,
      rank: rankResult,
    };
  }

  // Obtener perfil por ID
  async getById(userId: string): Promise<PublicProfile | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    const [followersResult, followingResult, rankResult] = await Promise.all([
      supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user.id),
      supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', user.id),
      this.getUserRank(user.id),
    ]);

    const accuracy = user.total_predictions > 0
      ? (user.correct_predictions / user.total_predictions) * 100
      : 0;

    return {
      ...user,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      accuracy: Math.round(accuracy * 10) / 10,
      rank: rankResult,
    };
  }

  // Obtener ranking del usuario
  async getUserRank(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .order('ap_coins', { ascending: false });

    if (error || !data) return 0;

    const index = data.findIndex(u => u.id === userId);
    return index >= 0 ? index + 1 : 0;
  }

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !!data;
  }

  // Seguir a un usuario
  async follow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;

    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) {
      console.error('Error following user:', error);
      return false;
    }

    // Crear notificación
    await supabase.from('notifications').insert({
      user_id: followingId,
      type: 'new_follower',
      title: '¡Nuevo seguidor!',
      message: 'Alguien comenzó a seguirte',
      link_url: `/perfil/${followerId}`,
      is_read: false,
    });

    return true;
  }

  // Dejar de seguir
  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }

    return true;
  }

  // Obtener seguidores de un usuario
  async getFollowers(userId: string, limit = 50): Promise<PublicProfile[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        follower:users!user_follows_follower_id_fkey(
          id, username, display_name, avatar_url, level, is_verified, is_premium
        )
      `)
      .eq('following_id', userId)
      .limit(limit);

    if (error || !data) return [];

    return data.map((d: any) => d.follower).filter(Boolean);
  }

  // Obtener usuarios que sigue
  async getFollowing(userId: string, limit = 50): Promise<PublicProfile[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey(
          id, username, display_name, avatar_url, level, is_verified, is_premium
        )
      `)
      .eq('follower_id', userId)
      .limit(limit);

    if (error || !data) return [];

    return data.map((d: any) => d.following).filter(Boolean);
  }

  // Obtener predicciones del usuario
  async getPredictions(userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select(`
        *,
        scenario:scenarios(id, title, category, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }

    return data || [];
  }

  // Obtener escenarios creados por el usuario
  async getCreatedScenarios(userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }

    return data || [];
  }

  // Obtener logros del usuario
  async getAchievements(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data || [];
  }

  // Obtener actividad reciente
  async getActivity(userId: string, limit = 20): Promise<any[]> {
    // Por ahora retornamos las predicciones como actividad
    const predictions = await this.getPredictions(userId, limit);
    
    return predictions.map(p => ({
      id: p.id,
      type: 'prediction',
      title: p.prediction === 'YES' ? 'Predijo SÍ' : 'Predijo NO',
      description: p.scenario?.title || 'Escenario',
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
    }));
  }
}

export const publicProfileService = new PublicProfileService();