// src/services/predictions.service.ts

import { getSupabaseClient } from '@/lib/supabase';
import { notificationsService } from './notifications.service';

export type PredictionType = 'YES' | 'NO';
export type PredictionStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';

export interface Prediction {
  id: string;
  user_id: string;
  scenario_id: string;
  prediction: PredictionType;
  amount: number;
  status: PredictionStatus;
  profit: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePredictionInput {
  userId: string;
  scenarioId: string;
  prediction: PredictionType;
  amount: number;
}

export const predictionsService = {
  // ============================================
  // CREAR PREDICCIÓN (VOTAR)
  // ============================================

  async create(input: CreatePredictionInput): Promise<{ success: boolean; error?: string; data?: Prediction }> {
    const supabase = getSupabaseClient();

    // Verificar si ya votó en este escenario
    const { data: existing } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', input.userId)
      .eq('scenario_id', input.scenarioId)
      .single();

    if (existing) {
      return { success: false, error: 'Ya has votado en este escenario' };
    }

    // Crear la predicción
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: input.userId,
        scenario_id: input.scenarioId,
        prediction: input.prediction,
        amount: input.amount,
        status: 'PENDING',
        profit: 0,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating prediction:', error);
      return { success: false, error: error.message };
    }

    // Actualizar los pools del escenario después de crear la predicción
    const votes = await this.countVotes(input.scenarioId);
    const totalParticipants = votes.yes + votes.no;

    await supabase
      .from('scenarios')
      .update({
        yes_pool: votes.yes,
        no_pool: votes.no,
        total_pool: totalParticipants,
        participant_count: totalParticipants,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', input.scenarioId);

    return { success: true, data: data as Prediction };
  },

  // ============================================
  // OBTENER PREDICCIONES
  // ============================================

  // Obtener predicción de un usuario en un escenario específico
  async getUserPrediction(userId: string, scenarioId: string): Promise<Prediction | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('scenario_id', scenarioId)
      .single();

    if (error) {
      return null;
    }

    return data as Prediction;
  },

  // Obtener todas las predicciones de un usuario
  async getByUserId(userId: string): Promise<Prediction[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user predictions:', error);
      return [];
    }

    return (data as Prediction[]) || [];
  },

  // Obtener todas las predicciones de un escenario
  async getByScenarioId(scenarioId: string): Promise<Prediction[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenario predictions:', error);
      return [];
    }

    return (data as Prediction[]) || [];
  },

  // Contar votos de un escenario
  async countVotes(scenarioId: string): Promise<{ yes: number; no: number }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('predictions')
      .select('prediction')
      .eq('scenario_id', scenarioId);

    if (error || !data) {
      return { yes: 0, no: 0 };
    }

    const yes = data.filter((p: { prediction: string }) => p.prediction === 'YES').length;
    const no = data.filter((p: { prediction: string }) => p.prediction === 'NO').length;

    return { yes, no };
  },

  // ============================================
  // VOTAR CON NOTIFICACIÓN
  // ============================================

  async voteWithNotification(input: {
    userId: string;
    username: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioOwnerId: string;
    prediction: PredictionType;
    amount: number;
  }): Promise<{ success: boolean; error?: string }> {
    // Crear la predicción
    const result = await this.create({
      userId: input.userId,
      scenarioId: input.scenarioId,
      prediction: input.prediction,
      amount: input.amount,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 🔔 Notificar al dueño del escenario (si no es el mismo usuario)
    if (input.scenarioOwnerId && input.scenarioOwnerId !== input.userId) {
      await notificationsService.notifyScenarioVote(
        input.scenarioOwnerId,
        input.username,
        input.scenarioTitle,
        input.prediction === 'YES' ? 'yes' : 'no',
        input.scenarioId
      );
    }

    return { success: true };
  },

  // ============================================
  // ACTUALIZAR ESTADO (para cuando se resuelve el escenario)
  // ============================================

  async updateStatus(predictionId: string, status: PredictionStatus, profit: number): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('predictions')
      .update({ 
        status, 
        profit,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', predictionId);

    if (error) {
      console.error('Error updating prediction status:', error);
      return false;
    }

    return true;
  },

  // Cancelar predicción
  async cancel(predictionId: string): Promise<boolean> {
    return this.updateStatus(predictionId, 'CANCELLED', 0);
  },
};