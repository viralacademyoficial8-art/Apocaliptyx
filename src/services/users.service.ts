// src/services/users.service.ts

import { getSupabaseClient } from '@/lib/supabase';
import { notificationsService } from './notifications.service';

// Tipo simplificado para usuarios
interface UserData {
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

interface FollowRecord {
  follower_id: string;
  following_id: string;
}

export const usersService = {
  // ============================================
  // OBTENER USUARIOS
  // ============================================

  // Obtener usuario por ID
  async getById(id: string): Promise<UserData | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  // Obtener usuario por username
  async getByUsername(username: string): Promise<UserData | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  // Obtener usuario por email
  async getByEmail(email: string): Promise<UserData | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  // Obtener leaderboard
  async getLeaderboard(limit = 10): Promise<UserData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('ap_coins', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    return data || [];
  },

  // Verificar si username existe
  async usernameExists(username: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    return !!data;
  },

  // Verificar si email existe
  async emailExists(email: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    return !!data;
  },

  // ============================================
  // SISTEMA DE SEGUIR/SEGUIDOS
  // ============================================

  // Seguir a un usuario
  async followUser(followerId: string, followingId: string, followerUsername: string, followerAvatar?: string): Promise<{ success: boolean; error?: string }> {
    // No puedes seguirte a ti mismo
    if (followerId === followingId) {
      return { success: false, error: 'No puedes seguirte a ti mismo' };
    }

    const supabase = getSupabaseClient();

    // Verificar si ya lo sigue
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return { success: false, error: 'Ya sigues a este usuario' };
    }

    // Crear el follow
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      } as never);

    if (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }

    // 🔔 Crear notificación para el usuario seguido
    await notificationsService.notifyNewFollower(
      followingId,
      followerUsername,
      followerAvatar
    );

    return { success: true };
  },

  // Dejar de seguir a un usuario
  async unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !!data;
  },

  // Obtener seguidores de un usuario
  async getFollowers(userId: string): Promise<UserData[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error || !data) {
      console.error('Error fetching followers:', error);
      return [];
    }

    // Obtener los datos de cada seguidor
    const followerIds = (data as unknown as FollowRecord[]).map(f => f.follower_id);
    if (followerIds.length === 0) return [];

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .in('id', followerIds);

    return (users as UserData[]) || [];
  },

  // Obtener usuarios que sigue
  async getFollowing(userId: string): Promise<UserData[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error || !data) {
      console.error('Error fetching following:', error);
      return [];
    }

    // Obtener los datos de cada usuario seguido
    const followingIds = (data as unknown as FollowRecord[]).map(f => f.following_id);
    if (followingIds.length === 0) return [];

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .in('id', followingIds);

    return (users as UserData[]) || [];
  },

  // Contar seguidores
  async countFollowers(userId: string): Promise<number> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('following_id', userId);

    return data?.length || 0;
  },

  // Contar seguidos
  async countFollowing(userId: string): Promise<number> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId);

    return data?.length || 0;
  },
};