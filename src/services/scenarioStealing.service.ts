// src/services/scenarioStealing.service.ts

import { getSupabaseAdmin } from '@/lib/supabase-server';
import type {
  Scenario,
  ScenarioHolding,
  ScenarioStealHistory,
  ScenarioPool,
  ScenarioShield
} from '@/lib/supabase/database.types';

// Tipos de respuesta
export interface StealResult {
  success: boolean;
  error?: string;
  stealPrice?: number;
  nextPrice?: number;
  poolTotal?: number;
  stealNumber?: number;
}

export interface ShieldResult {
  success: boolean;
  error?: string;
  protectedUntil?: string;
  shieldType?: string;
}

export interface ScenarioStealInfo {
  scenarioId: string;
  title: string;
  currentHolderId: string | null;
  currentHolderUsername?: string;
  creatorId: string;
  creatorUsername?: string;
  currentPrice: number;
  stealCount: number;
  theftPool: number;
  isProtected: boolean;
  protectedUntil: string | null;
  canBeStolen: boolean;
  stealHistory: ScenarioStealHistory[];
}

// Tipos de escudo disponibles
export const SHIELD_TYPES = {
  basic: {
    id: 'basic',
    name: 'Escudo Básico',
    description: 'Protege tu escenario por 6 horas',
    durationHours: 6,
    price: 15,
    icon: '🛡️'
  },
  premium: {
    id: 'premium',
    name: 'Escudo Premium',
    description: 'Protege tu escenario por 24 horas',
    durationHours: 24,
    price: 40,
    icon: '🛡️✨'
  },
  ultimate: {
    id: 'ultimate',
    name: 'Escudo Supremo',
    description: 'Protege tu escenario por 72 horas',
    durationHours: 72,
    price: 100,
    icon: '🔰'
  }
} as const;

class ScenarioStealingService {
  // Using admin client to bypass RLS for RPC functions that need to update users table
  private supabase() {
    return getSupabaseAdmin();
  }

  /**
   * Calcula el precio del próximo robo
   * Fórmula: 10 + numero_de_robo = 11 + steal_count
   * Robo 1 (steal_count=0): 11 AP
   * Robo 2 (steal_count=1): 12 AP
   * Robo 3 (steal_count=2): 13 AP
   * Robo 4 (steal_count=3): 14 AP
   * etc.
   */
  calculateStealPrice(stealCount: number): number {
    return 11 + stealCount;
  }

  /**
   * Obtener información de robo de un escenario
   */
  async getScenarioStealInfo(scenarioId: string): Promise<ScenarioStealInfo | null> {
    try {
      // Obtener escenario con información del holder y creador
      const { data: scenario, error: scenarioError } = await this.supabase()
        .from('scenarios')
        .select(`
          *,
          creator:users!scenarios_creator_id_fkey(id, username, display_name, avatar_url),
          holder:users!scenarios_current_holder_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('id', scenarioId)
        .single();

      if (scenarioError || !scenario) {
        console.error('Error fetching scenario:', scenarioError);
        return null;
      }

      // Obtener historial de robos
      const { data: history } = await this.supabase()
        .from('scenario_steal_history')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('stolen_at', { ascending: false })
        .limit(20);

      const creator = scenario.creator as { id: string; username: string; display_name: string; avatar_url: string } | null;
      const holder = scenario.holder as { id: string; username: string; display_name: string; avatar_url: string } | null;

      return {
        scenarioId: scenario.id,
        title: scenario.title,
        currentHolderId: scenario.current_holder_id,
        currentHolderUsername: holder?.display_name || holder?.username || 'Desconocido',
        creatorId: scenario.creator_id,
        creatorUsername: creator?.display_name || creator?.username || 'Desconocido',
        currentPrice: scenario.current_price || this.calculateStealPrice(scenario.steal_count || 0),
        stealCount: scenario.steal_count || 0,
        theftPool: scenario.theft_pool || 0,
        isProtected: scenario.is_protected || false,
        protectedUntil: scenario.protected_until,
        canBeStolen: scenario.can_be_stolen ?? true,
        stealHistory: (history || []) as ScenarioStealHistory[]
      };
    } catch (error) {
      console.error('Error in getScenarioStealInfo:', error);
      return null;
    }
  }

  /**
   * Robar un escenario (llama a la función RPC de Supabase)
   */
  async stealScenario(scenarioId: string, thiefId: string): Promise<StealResult> {
    try {
      // Llamar a la función steal_scenario de PostgreSQL
      const { data, error } = await this.supabase()
        .rpc('steal_scenario', {
          p_scenario_id: scenarioId,
          p_thief_id: thiefId
        });

      if (error) {
        console.error('Error stealing scenario:', error);
        return {
          success: false,
          error: error.message || 'Error al robar el escenario'
        };
      }

      // El resultado viene como JSONB
      const result = data as {
        success: boolean;
        error?: string;
        steal_price?: number;
        next_price?: number;
        pool_total?: number;
        steal_number?: number;
      };

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error desconocido'
        };
      }

      return {
        success: true,
        stealPrice: result.steal_price,
        nextPrice: result.next_price,
        poolTotal: result.pool_total,
        stealNumber: result.steal_number
      };
    } catch (error: any) {
      console.error('Error in stealScenario:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }

  /**
   * Aplicar escudo a un escenario
   */
  async applyShield(
    scenarioId: string,
    userId: string,
    shieldType: keyof typeof SHIELD_TYPES
  ): Promise<ShieldResult> {
    try {
      const shield = SHIELD_TYPES[shieldType];
      if (!shield) {
        return { success: false, error: 'Tipo de escudo no válido' };
      }

      // Llamar a la función apply_shield de PostgreSQL
      const { data, error } = await this.supabase()
        .rpc('apply_shield', {
          p_scenario_id: scenarioId,
          p_user_id: userId,
          p_shield_type: shieldType,
          p_duration_hours: shield.durationHours,
          p_price: shield.price
        });

      if (error) {
        console.error('Error applying shield:', error);
        return {
          success: false,
          error: error.message || 'Error al aplicar escudo'
        };
      }

      const result = data as {
        success: boolean;
        error?: string;
        protected_until?: string;
        shield_type?: string;
      };

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error desconocido'
        };
      }

      return {
        success: true,
        protectedUntil: result.protected_until,
        shieldType: result.shield_type
      };
    } catch (error: any) {
      console.error('Error in applyShield:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }

  /**
   * Obtener el pool de un escenario
   */
  async getScenarioPool(scenarioId: string): Promise<ScenarioPool | null> {
    try {
      const { data, error } = await this.supabase()
        .from('scenario_pools')
        .select('*')
        .eq('scenario_id', scenarioId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe, retornar pool vacío
          return null;
        }
        console.error('Error fetching pool:', error);
        return null;
      }

      return data as ScenarioPool;
    } catch (error) {
      console.error('Error in getScenarioPool:', error);
      return null;
    }
  }

  /**
   * Obtener historial de robos de un escenario
   */
  async getStealHistory(scenarioId: string, limit = 50): Promise<ScenarioStealHistory[]> {
    try {
      const { data, error } = await this.supabase()
        .from('scenario_steal_history')
        .select(`
          *,
          thief:users!scenario_steal_history_thief_id_fkey(id, username, display_name, avatar_url),
          victim:users!scenario_steal_history_victim_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('scenario_id', scenarioId)
        .order('stolen_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching steal history:', error);
        return [];
      }

      return data as ScenarioStealHistory[];
    } catch (error) {
      console.error('Error in getStealHistory:', error);
      return [];
    }
  }

  /**
   * Obtener escenarios que un usuario puede robar
   */
  async getStealableScenarios(userId: string, limit = 20): Promise<Scenario[]> {
    try {
      const { data, error } = await this.supabase()
        .from('scenarios')
        .select('*')
        .eq('status', 'ACTIVE')
        .eq('can_be_stolen', true)
        .neq('current_holder_id', userId)
        .neq('creator_id', userId) // No puede robar sus propios escenarios no robados
        .or('is_protected.eq.false,protected_until.lt.now()')
        .order('theft_pool', { ascending: false }) // Los más jugosos primero
        .limit(limit);

      if (error) {
        console.error('Error fetching stealable scenarios:', error);
        return [];
      }

      return data as Scenario[];
    } catch (error) {
      console.error('Error in getStealableScenarios:', error);
      return [];
    }
  }

  /**
   * Obtener escenarios de un holder
   */
  async getHolderScenarios(userId: string): Promise<Scenario[]> {
    try {
      const { data, error } = await this.supabase()
        .from('scenarios')
        .select('*')
        .eq('current_holder_id', userId)
        .eq('status', 'ACTIVE')
        .order('theft_pool', { ascending: false });

      if (error) {
        console.error('Error fetching holder scenarios:', error);
        return [];
      }

      return data as Scenario[];
    } catch (error) {
      console.error('Error in getHolderScenarios:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de robo de un usuario
   */
  async getUserStealStats(userId: string) {
    try {
      // Robos exitosos como ladrón
      const { count: stealsAsThief } = await this.supabase()
        .from('scenario_steal_history')
        .select('*', { count: 'exact', head: true })
        .eq('thief_id', userId);

      // Veces robado
      const { count: timesRobbed } = await this.supabase()
        .from('scenario_steal_history')
        .select('*', { count: 'exact', head: true })
        .eq('victim_id', userId);

      // Total gastado en robos
      const { data: spentData } = await this.supabase()
        .from('scenario_steal_history')
        .select('price_paid')
        .eq('thief_id', userId);

      const totalSpent = spentData?.reduce((sum, s) => sum + s.price_paid, 0) || 0;

      // Pools ganados
      const { data: wonPools } = await this.supabase()
        .from('scenario_pools')
        .select('total_pool')
        .eq('winner_id', userId);

      const totalWon = wonPools?.reduce((sum, p) => sum + p.total_pool, 0) || 0;

      // Escenarios actualmente en posesión
      const { count: currentHoldings } = await this.supabase()
        .from('scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('current_holder_id', userId)
        .eq('status', 'ACTIVE');

      return {
        stealsAsThief: stealsAsThief || 0,
        timesRobbed: timesRobbed || 0,
        totalSpent,
        totalWon,
        currentHoldings: currentHoldings || 0,
        netProfit: totalWon - totalSpent
      };
    } catch (error) {
      console.error('Error in getUserStealStats:', error);
      return {
        stealsAsThief: 0,
        timesRobbed: 0,
        totalSpent: 0,
        totalWon: 0,
        currentHoldings: 0,
        netProfit: 0
      };
    }
  }

  /**
   * Obtener top ladrones (leaderboard)
   */
  async getTopThieves(limit = 10) {
    try {
      // Usando una consulta agregada
      const { data, error } = await this.supabase()
        .from('scenario_steal_history')
        .select('thief_id')
        .limit(1000); // Obtener suficientes registros

      if (error || !data) {
        return [];
      }

      // Contar robos por usuario
      const stealCounts: Record<string, number> = {};
      data.forEach(row => {
        stealCounts[row.thief_id] = (stealCounts[row.thief_id] || 0) + 1;
      });

      // Ordenar y limitar
      const topThieves = Object.entries(stealCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      // Obtener info de usuarios
      if (topThieves.length === 0) return [];

      const userIds = topThieves.map(t => t[0]);
      const { data: users } = await this.supabase()
        .from('users')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      const userMap = new Map(users?.map(u => [u.id, u]));

      return topThieves.map(([userId, count]) => ({
        userId,
        username: userMap.get(userId)?.display_name || userMap.get(userId)?.username || 'Desconocido',
        avatarUrl: userMap.get(userId)?.avatar_url,
        stealCount: count
      }));
    } catch (error) {
      console.error('Error in getTopThieves:', error);
      return [];
    }
  }
}

export const scenarioStealingService = new ScenarioStealingService();
