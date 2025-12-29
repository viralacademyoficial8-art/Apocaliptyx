// src/services/scenarios.service.ts

import { getSupabaseClient } from '@/lib/supabase';

// Tipo simplificado para escenarios
interface ScenarioData {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  result: string | null;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  participant_count: number;
  min_bet: number;
  max_bet: number;
  is_featured: boolean;
  is_hot: boolean;
  resolution_date: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const scenariosService = {
  // Obtener todos los escenarios activos
  async getActive(limit = 20, offset = 0): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
    return data || [];
  },

  // Obtener escenarios destacados
  async getFeatured(): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('is_featured', true)
      .order('total_pool', { ascending: false })
      .limit(6);
    
    if (error) {
      console.error('Error fetching featured scenarios:', error);
      return [];
    }
    return data || [];
  },

  // Obtener escenarios hot
  async getHot(): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('is_hot', true)
      .order('participant_count', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching hot scenarios:', error);
      return [];
    }
    return data || [];
  },

  // Obtener por categoría
  async getByCategory(category: string, limit = 20): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('category', category)
      .order('total_pool', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching scenarios by category:', error);
      return [];
    }
    return data || [];
  },

  // Obtener por ID
  async getById(id: string): Promise<ScenarioData | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching scenario:', error);
      return null;
    }
    return data;
  },

  // Buscar escenarios
  async search(query: string): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);
    
    if (error) {
      console.error('Error searching scenarios:', error);
      return [];
    }
    return data || [];
  },

  // Obtener escenarios de un usuario
  async getByUser(userId: string): Promise<ScenarioData[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user scenarios:', error);
      return [];
    }
    return data || [];
  },
};