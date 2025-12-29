// src/services/users.service.ts

import { getSupabaseClient } from '@/lib/supabase';

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

export const usersService = {
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
};