// src/services/collectibles.service.ts
// Collectibles Service - Items, Trading, Inventory

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==================== TYPES ====================

export type CollectibleType = 'frame' | 'effect' | 'background' | 'badge_style' | 'emoji_pack' | 'theme';
export type CollectibleRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';
export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface Collectible {
  id: string;
  name: string;
  name_es: string;
  description: string;
  type: CollectibleType;
  rarity: CollectibleRarity;
  asset_url: string;
  preview_url: string;
  ap_cost: number | null;
  is_tradeable: boolean;
  is_limited: boolean;
  max_supply: number | null;
  current_supply: number;
  unlock_condition: Record<string, any> | null;
  season: string | null;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
}

export interface UserCollectible {
  id: string;
  user_id: string;
  collectible_id: string;
  acquired_at: string;
  acquired_method: 'purchase' | 'trade' | 'reward' | 'event';
  is_equipped: boolean;
  serial_number: number | null;
  collectible?: Collectible;
}

export interface CollectibleTrade {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: TradeStatus;
  sender_items: string[];
  receiver_items: string[];
  sender_ap_coins: number;
  receiver_ap_coins: number;
  message: string;
  created_at: string;
  responded_at: string | null;
  completed_at: string | null;
  sender?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  receiver?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

// ==================== SERVICE ====================

export const collectiblesService = {
  // ============================================
  // CATALOG
  // ============================================

  async getAllCollectibles(options: {
    type?: CollectibleType;
    rarity?: CollectibleRarity;
    purchasable?: boolean;
    available?: boolean;
  } = {}): Promise<Collectible[]> {
    let query = supabase.from('collectibles').select('*');

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.rarity) {
      query = query.eq('rarity', options.rarity);
    }

    if (options.purchasable) {
      query = query.not('ap_cost', 'is', null);
    }

    if (options.available) {
      const now = new Date().toISOString();
      query = query
        .or(`available_from.is.null,available_from.lte.${now}`)
        .or(`available_until.is.null,available_until.gte.${now}`);
    }

    query = query.order('rarity').order('ap_cost');

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getCollectibleById(id: string): Promise<Collectible | null> {
    const { data, error } = await supabase
      .from('collectibles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async getCollectiblesByType(type: CollectibleType): Promise<Collectible[]> {
    const { data, error } = await supabase
      .from('collectibles')
      .select('*')
      .eq('type', type)
      .order('rarity')
      .order('ap_cost');

    if (error) return [];
    return data || [];
  },

  async getLimitedCollectibles(): Promise<Collectible[]> {
    const { data, error } = await supabase
      .from('collectibles')
      .select('*')
      .eq('is_limited', true)
      .order('current_supply');

    if (error) return [];
    return data || [];
  },

  async getSeasonalCollectibles(season: string): Promise<Collectible[]> {
    const { data, error } = await supabase
      .from('collectibles')
      .select('*')
      .eq('season', season)
      .order('rarity');

    if (error) return [];
    return data || [];
  },

  // ============================================
  // USER INVENTORY
  // ============================================

  async getUserInventory(userId: string): Promise<UserCollectible[]> {
    const { data, error } = await supabase
      .from('user_collectibles')
      .select('*, collectible:collectibles(*)')
      .eq('user_id', userId)
      .order('acquired_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getUserCollectiblesByType(userId: string, type: CollectibleType): Promise<UserCollectible[]> {
    const { data, error } = await supabase
      .from('user_collectibles')
      .select('*, collectible:collectibles!inner(*)')
      .eq('user_id', userId)
      .eq('collectibles.type', type)
      .order('acquired_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async hasCollectible(userId: string, collectibleId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_collectibles')
      .select('id')
      .eq('user_id', userId)
      .eq('collectible_id', collectibleId)
      .single();

    return !!data;
  },

  async getEquippedItems(userId: string): Promise<{ frame?: Collectible; effect?: Collectible; background?: Collectible }> {
    const { data: user } = await supabase
      .from('users')
      .select('equipped_frame, equipped_effect, equipped_background')
      .eq('id', userId)
      .single();

    if (!user) return {};

    const result: { frame?: Collectible; effect?: Collectible; background?: Collectible } = {};

    if (user.equipped_frame) {
      result.frame = await this.getCollectibleById(user.equipped_frame) || undefined;
    }

    if (user.equipped_effect) {
      result.effect = await this.getCollectibleById(user.equipped_effect) || undefined;
    }

    if (user.equipped_background) {
      result.background = await this.getCollectibleById(user.equipped_background) || undefined;
    }

    return result;
  },

  // ============================================
  // PURCHASE & EQUIP
  // ============================================

  async purchaseCollectible(userId: string, collectibleId: string): Promise<{ success: boolean; error?: string; serialNumber?: number }> {
    const { data, error } = await supabase.rpc('purchase_collectible', {
      p_user_id: userId,
      p_collectible_id: collectibleId
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    return { success: true, serialNumber: data.serial_number };
  },

  async equipCollectible(userId: string, collectibleId: string): Promise<{ success: boolean; error?: string }> {
    // Get collectible type
    const { data: collectible } = await supabase
      .from('collectibles')
      .select('type')
      .eq('id', collectibleId)
      .single();

    if (!collectible) {
      return { success: false, error: 'Collectible not found' };
    }

    // Check ownership
    const hasItem = await this.hasCollectible(userId, collectibleId);
    if (!hasItem) {
      return { success: false, error: 'You do not own this collectible' };
    }

    // Map type to slot
    const typeToSlot: Record<string, string> = {
      'frame': 'equipped_frame',
      'effect': 'equipped_effect',
      'background': 'equipped_background'
    };

    const slot = typeToSlot[collectible.type];
    if (!slot) {
      return { success: false, error: 'This collectible type cannot be equipped' };
    }

    // Unequip current item of same type
    const { data: user } = await supabase
      .from('users')
      .select(slot)
      .eq('id', userId)
      .single();

    const userData = user as Record<string, any> | null;
    if (userData && userData[slot]) {
      await supabase
        .from('user_collectibles')
        .update({ is_equipped: false })
        .eq('user_id', userId)
        .eq('collectible_id', userData[slot]);
    }

    // Equip new item
    const { error } = await supabase
      .from('users')
      .update({ [slot]: collectibleId })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark as equipped in inventory
    await supabase
      .from('user_collectibles')
      .update({ is_equipped: true })
      .eq('user_id', userId)
      .eq('collectible_id', collectibleId);

    return { success: true };
  },

  async unequipCollectible(userId: string, slot: 'frame' | 'effect' | 'background'): Promise<boolean> {
    const slotColumn = `equipped_${slot}`;

    // Get current equipped item
    const { data: user } = await supabase
      .from('users')
      .select(slotColumn)
      .eq('id', userId)
      .single();

    const userData = user as Record<string, any> | null;
    if (!userData || !userData[slotColumn]) return true;

    // Unequip
    const { error } = await supabase
      .from('users')
      .update({ [slotColumn]: null })
      .eq('id', userId);

    if (!error) {
      // Mark as unequipped in inventory
      await supabase
        .from('user_collectibles')
        .update({ is_equipped: false })
        .eq('user_id', userId)
        .eq('collectible_id', userData[slotColumn]);
    }

    return !error;
  },

  // ============================================
  // TRADING
  // ============================================

  async createTrade(data: {
    senderId: string;
    receiverId: string;
    senderItems: string[];
    receiverItems: string[];
    senderApCoins?: number;
    receiverApCoins?: number;
    message?: string;
  }): Promise<{ success: boolean; trade?: CollectibleTrade; error?: string }> {
    // Verify sender owns all items
    for (const itemId of data.senderItems) {
      const hasItem = await this.hasCollectible(data.senderId, itemId);
      if (!hasItem) {
        return { success: false, error: 'You do not own one or more of the offered items' };
      }

      // Check if item is tradeable
      const { data: collectible } = await supabase
        .from('collectibles')
        .select('is_tradeable')
        .eq('id', itemId)
        .single();

      if (!collectible?.is_tradeable) {
        return { success: false, error: 'One or more items are not tradeable' };
      }
    }

    // Check sender has enough AP coins
    if (data.senderApCoins && data.senderApCoins > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('ap_coins')
        .eq('id', data.senderId)
        .single();

      if (!user || user.ap_coins < data.senderApCoins) {
        return { success: false, error: 'Not enough AP Coins' };
      }
    }

    const { data: trade, error } = await supabase
      .from('collectible_trades')
      .insert({
        sender_id: data.senderId,
        receiver_id: data.receiverId,
        sender_items: data.senderItems,
        receiver_items: data.receiverItems,
        sender_ap_coins: data.senderApCoins || 0,
        receiver_ap_coins: data.receiverApCoins || 0,
        message: data.message
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, trade };
  },

  async respondToTrade(tradeId: string, userId: string, accept: boolean): Promise<{ success: boolean; error?: string }> {
    const { data: trade } = await supabase
      .from('collectible_trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    if (trade.receiver_id !== userId) {
      return { success: false, error: 'You are not the receiver of this trade' };
    }

    if (trade.status !== 'pending') {
      return { success: false, error: 'Trade is no longer pending' };
    }

    if (!accept) {
      const { error } = await supabase
        .from('collectible_trades')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      return { success: !error };
    }

    // Accept trade - verify receiver owns requested items
    for (const itemId of trade.receiver_items) {
      const hasItem = await this.hasCollectible(userId, itemId);
      if (!hasItem) {
        return { success: false, error: 'You no longer own one or more requested items' };
      }
    }

    // Check receiver has enough AP coins
    if (trade.receiver_ap_coins > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('ap_coins')
        .eq('id', userId)
        .single();

      if (!user || user.ap_coins < trade.receiver_ap_coins) {
        return { success: false, error: 'Not enough AP Coins' };
      }
    }

    // Execute trade
    // Transfer items from sender to receiver
    for (const itemId of trade.sender_items) {
      await supabase
        .from('user_collectibles')
        .update({
          user_id: trade.receiver_id,
          acquired_method: 'trade',
          acquired_at: new Date().toISOString(),
          is_equipped: false
        })
        .eq('user_id', trade.sender_id)
        .eq('collectible_id', itemId);
    }

    // Transfer items from receiver to sender
    for (const itemId of trade.receiver_items) {
      await supabase
        .from('user_collectibles')
        .update({
          user_id: trade.sender_id,
          acquired_method: 'trade',
          acquired_at: new Date().toISOString(),
          is_equipped: false
        })
        .eq('user_id', trade.receiver_id)
        .eq('collectible_id', itemId);
    }

    // Transfer AP coins
    if (trade.sender_ap_coins > 0) {
      await supabase.rpc('log_ap_transaction', {
        p_user_id: trade.sender_id,
        p_amount: -trade.sender_ap_coins,
        p_type: 'trade',
        p_description: 'Trade completed',
        p_reference_id: tradeId
      });

      await supabase.rpc('log_ap_transaction', {
        p_user_id: trade.receiver_id,
        p_amount: trade.sender_ap_coins,
        p_type: 'trade',
        p_description: 'Trade completed',
        p_reference_id: tradeId
      });
    }

    if (trade.receiver_ap_coins > 0) {
      await supabase.rpc('log_ap_transaction', {
        p_user_id: trade.receiver_id,
        p_amount: -trade.receiver_ap_coins,
        p_type: 'trade',
        p_description: 'Trade completed',
        p_reference_id: tradeId
      });

      await supabase.rpc('log_ap_transaction', {
        p_user_id: trade.sender_id,
        p_amount: trade.receiver_ap_coins,
        p_type: 'trade',
        p_description: 'Trade completed',
        p_reference_id: tradeId
      });
    }

    // Update trade status
    const { error } = await supabase
      .from('collectible_trades')
      .update({
        status: 'completed',
        responded_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .eq('id', tradeId);

    return { success: !error };
  },

  async cancelTrade(tradeId: string, userId: string): Promise<boolean> {
    const { data: trade } = await supabase
      .from('collectible_trades')
      .select('sender_id, status')
      .eq('id', tradeId)
      .single();

    if (!trade || trade.sender_id !== userId || trade.status !== 'pending') {
      return false;
    }

    const { error } = await supabase
      .from('collectible_trades')
      .update({ status: 'cancelled' })
      .eq('id', tradeId);

    return !error;
  },

  async getUserTrades(userId: string, status?: TradeStatus): Promise<CollectibleTrade[]> {
    let query = supabase
      .from('collectible_trades')
      .select(`
        *,
        sender:users!collectible_trades_sender_id_fkey(id, username, avatar_url),
        receiver:users!collectible_trades_receiver_id_fkey(id, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getPendingTradesCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('collectible_trades')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    return count || 0;
  },

  // ============================================
  // RARITY HELPERS
  // ============================================

  getRarityColor(rarity: CollectibleRarity): string {
    const colors: Record<CollectibleRarity, string> = {
      common: '#9CA3AF',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
      mythic: '#EC4899',
      exclusive: '#EF4444'
    };
    return colors[rarity];
  },

  getRarityLabel(rarity: CollectibleRarity): string {
    const labels: Record<CollectibleRarity, string> = {
      common: 'Común',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Legendario',
      mythic: 'Mítico',
      exclusive: 'Exclusivo'
    };
    return labels[rarity];
  }
};
