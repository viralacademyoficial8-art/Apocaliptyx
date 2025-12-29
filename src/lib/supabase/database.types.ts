// src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
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
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
          ap_coins?: number;
          level?: number;
          xp?: number;
          is_verified?: boolean;
          is_premium?: boolean;
          is_banned?: boolean;
          total_predictions?: number;
          correct_predictions?: number;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
          ap_coins?: number;
          level?: number;
          xp?: number;
          is_verified?: boolean;
          is_premium?: boolean;
          is_banned?: boolean;
          total_predictions?: number;
          correct_predictions?: number;
          total_earnings?: number;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          image_url: string | null;
          status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
          result: 'YES' | 'NO' | null;
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
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          image_url?: string | null;
          status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
          result?: 'YES' | 'NO' | null;
          total_pool?: number;
          yes_pool?: number;
          no_pool?: number;
          participant_count?: number;
          min_bet?: number;
          max_bet?: number;
          is_featured?: boolean;
          is_hot?: boolean;
          resolution_date: string;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          creator_id?: string;
          title?: string;
          description?: string;
          category?: string;
          image_url?: string | null;
          status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
          result?: 'YES' | 'NO' | null;
          total_pool?: number;
          yes_pool?: number;
          no_pool?: number;
          participant_count?: number;
          min_bet?: number;
          max_bet?: number;
          is_featured?: boolean;
          is_hot?: boolean;
          resolution_date?: string;
          resolved_at?: string | null;
          updated_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          prediction: 'YES' | 'NO';
          amount: number;
          potential_win: number;
          status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';
          payout: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scenario_id: string;
          prediction: 'YES' | 'NO';
          amount: number;
          potential_win?: number;
          status?: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';
          payout?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          prediction?: 'YES' | 'NO';
          amount?: number;
          potential_win?: number;
          status?: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';
          payout?: number | null;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND' | 'BONUS' | 'PURCHASE' | 'TRANSFER';
          amount: number;
          balance_after: number;
          description: string | null;
          reference_id: string | null;
          reference_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND' | 'BONUS' | 'PURCHASE' | 'TRANSFER';
          amount: number;
          balance_after: number;
          description?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          created_at?: string;
        };
        Update: {
          type?: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND' | 'BONUS' | 'PURCHASE' | 'TRANSFER';
          amount?: number;
          balance_after?: number;
          description?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          xp_reward: number;
          coin_reward: number;
          requirement_type: string;
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          xp_reward?: number;
          coin_reward?: number;
          requirement_type: string;
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          xp_reward?: number;
          coin_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          progress?: number;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Update: {
          progress?: number;
          unlocked_at?: string | null;
        };
      };
      shop_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          type: 'PROTECTION' | 'BOOST' | 'POWER' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
          rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          price: number;
          discount_price: number | null;
          icon: string;
          effects: Json;
          is_active: boolean;
          stock: number | null;
          max_per_user: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          type: 'PROTECTION' | 'BOOST' | 'POWER' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
          rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          price: number;
          discount_price?: number | null;
          icon: string;
          effects?: Json;
          is_active?: boolean;
          stock?: number | null;
          max_per_user?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          type?: 'PROTECTION' | 'BOOST' | 'POWER' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
          rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          price?: number;
          discount_price?: number | null;
          icon?: string;
          effects?: Json;
          is_active?: boolean;
          stock?: number | null;
          max_per_user?: number | null;
          updated_at?: string;
        };
      };
      user_inventory: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          quantity: number;
          is_equipped: boolean;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          quantity?: number;
          is_equipped?: boolean;
          purchased_at?: string;
        };
        Update: {
          quantity?: number;
          is_equipped?: boolean;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
      scenario_status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
      prediction_status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';
      transaction_type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND' | 'BONUS' | 'PURCHASE' | 'TRANSFER';
      item_type: 'PROTECTION' | 'BOOST' | 'POWER' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
      rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Aliases comunes
export type User = Tables<'users'>;
export type Scenario = Tables<'scenarios'>;
export type Prediction = Tables<'predictions'>;
export type Transaction = Tables<'transactions'>;
export type Achievement = Tables<'achievements'>;
export type ShopItem = Tables<'shop_items'>;
export type Notification = Tables<'notifications'>;