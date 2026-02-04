// src/services/wallet.service.ts
// Service for managing user wallet and AP Coins transactions

import { getSupabaseClient } from '@/lib/supabase';

export type WalletTransactionType =
  | 'PURCHASE'
  | 'SCENARIO_PAYOUT'
  | 'SCENARIO_STEAL'
  | 'SCENARIO_PROTECT'
  | 'ITEM_PURCHASE'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'BONUS'
  | 'PREDICTION_BET'
  | 'PREDICTION_WIN';

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: WalletTransactionType;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WalletStats {
  ap_coins: number;
  ap_coins_purchased: number;
  ap_coins_earned: number;
  ap_coins_spent: number;
  available_balance: number; // Same as ap_coins, for clarity
}

export interface ScenarioPayout {
  id: string;
  scenario_id: string;
  recipient_id: string;
  payout_amount: number;
  theft_pool_at_resolution: number;
  scenario_result: 'YES' | 'NO';
  was_fulfilled: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  processed_at: string | null;
  scenario?: {
    title: string;
    category: string;
  };
}

export const walletService = {
  // ============================================
  // GET WALLET STATS
  // ============================================

  async getWalletStats(userId: string): Promise<WalletStats | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('ap_coins, ap_coins_purchased, ap_coins_earned, ap_coins_spent')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching wallet stats:', error);
      return null;
    }

    return {
      ap_coins: data.ap_coins || 0,
      ap_coins_purchased: data.ap_coins_purchased || 0,
      ap_coins_earned: data.ap_coins_earned || 0,
      ap_coins_spent: data.ap_coins_spent || 0,
      available_balance: data.ap_coins || 0,
    };
  },

  // ============================================
  // GET TRANSACTIONS
  // ============================================

  async getTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: WalletTransactionType;
    }
  ): Promise<WalletTransaction[]> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.type) {
      query = query.eq('transaction_type', options.type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  },

  // ============================================
  // RECORD TRANSACTION (using RPC function)
  // ============================================

  async recordTransaction(
    userId: string,
    type: WalletTransactionType,
    amount: number,
    description?: string,
    referenceType?: string,
    referenceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; transaction_id?: string; new_balance?: number; error?: string }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('record_wallet_transaction', {
      p_user_id: userId,
      p_type: type,
      p_amount: amount,
      p_description: description || null,
      p_reference_type: referenceType || null,
      p_reference_id: referenceId || null,
      p_metadata: metadata || {},
    });

    if (error) {
      console.error('Error recording transaction:', error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; transaction_id?: string; new_balance?: number; error?: string };
    return result;
  },

  // ============================================
  // GET RESOLVED SCENARIOS (FULFILLED)
  // ============================================

  async getFulfilledScenarios(userId: string): Promise<ScenarioPayout[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('scenario_payouts')
      .select(`
        *,
        scenario:scenarios (
          title,
          category
        )
      `)
      .eq('recipient_id', userId)
      .eq('was_fulfilled', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fulfilled scenarios:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario,
    }));
  },

  // ============================================
  // GET RESOLVED SCENARIOS (UNFULFILLED)
  // ============================================

  async getUnfulfilledScenarios(userId: string): Promise<ScenarioPayout[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('scenario_payouts')
      .select(`
        *,
        scenario:scenarios (
          title,
          category
        )
      `)
      .eq('recipient_id', userId)
      .eq('was_fulfilled', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unfulfilled scenarios:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario,
    }));
  },

  // ============================================
  // PROCESS SCENARIO RESOLUTION (Admin)
  // ============================================

  async resolveScenario(
    scenarioId: string,
    result: 'YES' | 'NO'
  ): Promise<{
    success: boolean;
    payout_id?: string;
    recipient_id?: string;
    payout_amount?: number;
    was_fulfilled?: boolean;
    error?: string;
  }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('process_scenario_payout', {
      p_scenario_id: scenarioId,
      p_result: result,
    });

    if (error) {
      console.error('Error resolving scenario:', error);
      return { success: false, error: error.message };
    }

    return data as {
      success: boolean;
      payout_id?: string;
      recipient_id?: string;
      payout_amount?: number;
      was_fulfilled?: boolean;
      error?: string;
    };
  },

  // ============================================
  // ADMIN: GET FINANCE SUMMARY
  // ============================================

  async getFinanceSummary(): Promise<{
    active: { category: string; total_amount: number; description: string }[];
    passive: { category: string; total_amount: number; description: string }[];
    totals: { active_total: number; passive_total: number; grand_total: number };
  }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('admin_finance_summary')
      .select('*');

    if (error) {
      console.error('Error fetching finance summary:', error);
      return {
        active: [],
        passive: [],
        totals: { active_total: 0, passive_total: 0, grand_total: 0 },
      };
    }

    const active = (data || [])
      .filter(item => item.coin_type === 'active')
      .map(item => ({
        category: item.category,
        total_amount: item.total_amount || 0,
        description: item.description || '',
      }));

    const passive = (data || [])
      .filter(item => item.coin_type === 'passive')
      .map(item => ({
        category: item.category,
        total_amount: item.total_amount || 0,
        description: item.description || '',
      }));

    const active_total = active.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const passive_total = passive.reduce((sum, item) => sum + (item.total_amount || 0), 0);

    return {
      active,
      passive,
      totals: {
        active_total,
        passive_total,
        grand_total: active_total + passive_total,
      },
    };
  },

  // ============================================
  // ADMIN: GET ALL PAYOUTS
  // ============================================

  async getAllPayouts(
    options?: {
      limit?: number;
      fulfilled?: boolean;
    }
  ): Promise<ScenarioPayout[]> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('scenario_payouts')
      .select(`
        *,
        scenario:scenarios (
          title,
          category
        ),
        recipient:users (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.fulfilled !== undefined) {
      query = query.eq('was_fulfilled', options.fulfilled);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all payouts:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario,
    }));
  },
};
