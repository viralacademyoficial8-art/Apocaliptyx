// =====================================================
// APPEALS SERVICE
// Sistema de apelaciones para verificaciones de escenarios
// =====================================================

import { getSupabaseClient } from '@/lib/supabase/client';

export interface Appeal {
  id: string;
  scenario_id: string;
  user_id: string;
  reason: string;
  evidence_urls: string[] | null;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  new_result: 'YES' | 'NO' | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  scenario?: {
    title: string;
    category: string;
    result: string;
  };
  user?: {
    username: string;
    avatar_url: string;
  };
}

export interface CreateAppealInput {
  scenarioId: string;
  userId: string;
  reason: string;
  evidenceUrls?: string[];
}

export interface ReviewAppealInput {
  appealId: string;
  reviewerId: string;
  status: 'approved' | 'rejected';
  notes: string;
  newResult?: 'YES' | 'NO';
}

export const appealsService = {
  // ============================================
  // CREAR APELACIÓN
  // ============================================

  async create(input: CreateAppealInput): Promise<{ success: boolean; appeal?: Appeal; error?: string }> {
    const supabase = getSupabaseClient();

    try {
      // Verificar que el escenario existe y está resuelto
      const { data: scenarioData } = await supabase
        .from('scenarios')
        .select('id, status, result, resolved_at')
        .eq('id', input.scenarioId)
        .single();

      if (!scenarioData) {
        return { success: false, error: 'Escenario no encontrado' };
      }

      const scenario = scenarioData as { id: string; status: string; result: string | null; resolved_at: string | null };

      if (scenario.status !== 'RESOLVED') {
        return { success: false, error: 'Solo se pueden apelar escenarios resueltos' };
      }

      // Verificar que no existe una apelación pendiente del mismo usuario
      const { data: existingAppeal } = await (supabase
        .from('scenario_appeals') as any)
        .select('id')
        .eq('scenario_id', input.scenarioId)
        .eq('user_id', input.userId)
        .in('status', ['pending', 'reviewing'])
        .single();

      if (existingAppeal) {
        return { success: false, error: 'Ya tienes una apelación pendiente para este escenario' };
      }

      // Verificar ventana de apelación (48 horas por defecto)
      const { data: config } = await (supabase
        .from('oracle_config') as any)
        .select('value')
        .eq('key', 'appeal_window_hours')
        .single();

      const configData = config as { value: string } | null;
      const appealWindowHours = configData ? parseInt(configData.value) : 48;

      // Verificar que tiene fecha de resolución
      if (!scenario.resolved_at) {
        return { success: false, error: 'El escenario no tiene fecha de resolución' };
      }

      const resolvedAt = new Date(scenario.resolved_at);
      const windowEnd = new Date(resolvedAt.getTime() + appealWindowHours * 60 * 60 * 1000);

      if (new Date() > windowEnd) {
        return { success: false, error: 'El periodo de apelación ha expirado' };
      }

      // Crear apelación
      const { data: appeal, error } = await (supabase
        .from('scenario_appeals') as any)
        .insert({
          scenario_id: input.scenarioId,
          user_id: input.userId,
          reason: input.reason,
          evidence_urls: input.evidenceUrls || [],
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Actualizar estado de apelación en escenario
      await (supabase
        .from('scenarios') as any)
        .update({ appeal_status: 'pending' })
        .eq('id', input.scenarioId);

      return { success: true, appeal: appeal as Appeal };
    } catch (error) {
      console.error('Error creating appeal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // ============================================
  // REVISAR APELACIÓN (Admin)
  // ============================================

  async review(input: ReviewAppealInput): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    try {
      // Obtener apelación
      const { data: appeal } = await (supabase
        .from('scenario_appeals') as any)
        .select('*, scenario:scenarios(id, title, status, result)')
        .eq('id', input.appealId)
        .single();

      if (!appeal) {
        return { success: false, error: 'Apelación no encontrada' };
      }

      const appealData = appeal as any;

      if (appealData.status !== 'pending' && appealData.status !== 'reviewing') {
        return { success: false, error: 'Esta apelación ya fue procesada' };
      }

      // Actualizar apelación
      const { error: updateError } = await (supabase
        .from('scenario_appeals') as any)
        .update({
          status: input.status,
          reviewed_by: input.reviewerId,
          review_notes: input.notes,
          reviewed_at: new Date().toISOString(),
          new_result: input.status === 'approved' ? input.newResult : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.appealId);

      if (updateError) {
        throw updateError;
      }

      // Si se aprobó, actualizar el escenario y reprocesar pago
      if (input.status === 'approved' && input.newResult) {
        const scenario = appealData.scenario as any;

        // Actualizar resultado del escenario
        await (supabase
          .from('scenarios') as any)
          .update({
            result: input.newResult,
            appeal_status: 'approved',
          })
          .eq('id', scenario.id);

        // Reprocesar pago si el resultado cambió
        if (scenario.result !== input.newResult) {
          await (supabase.rpc as any)('process_scenario_payout', {
            p_scenario_id: scenario.id,
            p_result: input.newResult,
          });
        }
      } else {
        // Actualizar estado de apelación en escenario
        await (supabase
          .from('scenarios') as any)
          .update({ appeal_status: input.status })
          .eq('id', appealData.scenario_id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // ============================================
  // OBTENER APELACIONES DEL USUARIO
  // ============================================

  async getUserAppeals(userId: string): Promise<Appeal[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await (supabase
      .from('scenario_appeals') as any)
      .select(`
        *,
        scenario:scenarios (
          title,
          category,
          result
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user appeals:', error);
      return [];
    }

    return (data || []) as Appeal[];
  },

  // ============================================
  // OBTENER TODAS LAS APELACIONES (Admin)
  // ============================================

  async getAllAppeals(status?: string): Promise<Appeal[]> {
    const supabase = getSupabaseClient();

    let query = (supabase
      .from('scenario_appeals') as any)
      .select(`
        *,
        scenario:scenarios (
          title,
          category,
          result
        ),
        user:users (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all appeals:', error);
      return [];
    }

    return ((data || []) as any[]).map(item => ({
      ...item,
      scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    }));
  },

  // ============================================
  // OBTENER APELACIÓN POR ID
  // ============================================

  async getById(appealId: string): Promise<Appeal | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await (supabase
      .from('scenario_appeals') as any)
      .select(`
        *,
        scenario:scenarios (
          title,
          category,
          result
        ),
        user:users (
          username,
          avatar_url
        )
      `)
      .eq('id', appealId)
      .single();

    if (error || !data) {
      return null;
    }

    const item = data as any;
    return {
      ...item,
      scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    };
  },

  // ============================================
  // MARCAR COMO EN REVISIÓN
  // ============================================

  async markAsReviewing(appealId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    const { error } = await (supabase
      .from('scenario_appeals') as any)
      .update({
        status: 'reviewing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appealId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },
};
