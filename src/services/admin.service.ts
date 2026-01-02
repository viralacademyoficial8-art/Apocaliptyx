// src/services/admin.service.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalScenarios: number;
  activeScenarios: number;
  completedScenarios: number;
  totalVolume: number;
  pendingReports: number;
  totalTransactions: number;
  totalShopItems: number;
  totalNotifications: number;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
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

export interface ScenarioData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  creator_id: string;
  creator?: {
    username: string;
    display_name: string;
  };
  total_pool: number;
  participant_count: number;
  is_featured: boolean;
  is_hot: boolean;
  created_at: string;
  resolution_date: string;
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'scenario_created' | 'purchase' | 'report';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

class AdminService {
  // ============================================
  // ESTADÍSTICAS DEL DASHBOARD
  // ============================================

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Usuarios totales
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Usuarios nuevos hoy
      const { count: newUsersToday } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart);

      // Usuarios nuevos esta semana
      const { count: newUsersThisWeek } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo);

      // Usuarios activos (no baneados)
      const { count: activeUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_banned", false);

      // Escenarios totales
      const { count: totalScenarios } = await supabase
        .from("scenarios")
        .select("*", { count: "exact", head: true });

      // Escenarios activos (ACTIVE en mayúsculas)
      const { count: activeScenarios } = await supabase
        .from("scenarios")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");

      // Escenarios completados (RESOLVED en mayúsculas)
      const { count: completedScenarios } = await supabase
        .from("scenarios")
        .select("*", { count: "exact", head: true })
        .eq("status", "RESOLVED");

      // Volumen total (suma de total_pool)
      const { data: volumeData } = await supabase
        .from("scenarios")
        .select("total_pool");
      const totalVolume = volumeData?.reduce((sum, s) => sum + (s.total_pool || 0), 0) || 0;

      // Transacciones (compras)
      const { count: totalTransactions } = await supabase
        .from("user_purchases")
        .select("*", { count: "exact", head: true });

      // Items de tienda
      const { count: totalShopItems } = await supabase
        .from("shop_items")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Notificaciones
      const { count: totalNotifications } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        totalScenarios: totalScenarios || 0,
        activeScenarios: activeScenarios || 0,
        completedScenarios: completedScenarios || 0,
        totalVolume,
        pendingReports: 0,
        totalTransactions: totalTransactions || 0,
        totalShopItems: totalShopItems || 0,
        totalNotifications: totalNotifications || 0,
      };
    } catch (error) {
      console.error("Error getting platform stats:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        totalScenarios: 0,
        activeScenarios: 0,
        completedScenarios: 0,
        totalVolume: 0,
        pendingReports: 0,
        totalTransactions: 0,
        totalShopItems: 0,
        totalNotifications: 0,
      };
    }
  }

  // ============================================
  // USUARIOS
  // ============================================

  async getUsers(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    orderBy?: string;
    order?: "asc" | "desc";
  }): Promise<{ users: UserData[]; total: number }> {
    try {
      const { limit = 20, offset = 0, search, role, orderBy = "created_at", order = "desc" } = options || {};

      let query = supabase
        .from("users")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`);
      }

      if (role && role !== "all") {
        query = query.eq("role", role);
      }

      query = query.order(orderBy, { ascending: order === "asc" });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        return { users: [], total: 0 };
      }

      return { users: data || [], total: count || 0 };
    } catch (error) {
      console.error("Error in getUsers:", error);
      return { users: [], total: 0 };
    }
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<UserData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateUser:", error);
      return { success: false, error: "Error al actualizar usuario" };
    }
  }

  async banUser(userId: string, banned: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateUser(userId, { is_banned: banned } as any);
  }

  async changeUserRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
    return this.updateUser(userId, { role } as any);
  }

  async adjustUserCoins(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("ap_coins")
        .eq("id", userId)
        .single();

      if (!user) {
        return { success: false, error: "Usuario no encontrado" };
      }

      const newBalance = Math.max(0, user.ap_coins + amount);

      const { error } = await supabase
        .from("users")
        .update({ ap_coins: newBalance, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in adjustUserCoins:", error);
      return { success: false, error: "Error al ajustar monedas" };
    }
  }

  // ============================================
  // ESCENARIOS
  // ============================================

  async getScenarios(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<{ scenarios: ScenarioData[]; total: number }> {
    try {
      const { limit = 20, offset = 0, search, status, category } = options || {};

      // Consulta simple sin join
      let query = supabase
        .from("scenarios")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      if (category && category !== "all") {
        query = query.ilike("category", category);
      }

      query = query.order("created_at", { ascending: false });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching scenarios:", error);
        return { scenarios: [], total: 0 };
      }

      return { scenarios: data || [], total: count || 0 };
    } catch (error) {
      console.error("Error in getScenarios:", error);
      return { scenarios: [], total: 0 };
    }
  }

  async updateScenario(scenarioId: string, updates: Partial<ScenarioData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("scenarios")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", scenarioId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateScenario:", error);
      return { success: false, error: "Error al actualizar escenario" };
    }
  }

  async deleteScenario(scenarioId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("scenarios")
        .delete()
        .eq("id", scenarioId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteScenario:", error);
      return { success: false, error: "Error al eliminar escenario" };
    }
  }

  // ============================================
  // ACTIVIDAD RECIENTE
  // ============================================

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Usuarios recientes
      const { data: recentUsers } = await supabase
        .from("users")
        .select("id, username, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentUsers) {
        recentUsers.forEach((user) => {
          activities.push({
            id: `user-${user.id}`,
            type: "user_registered",
            title: "Nuevo usuario registrado",
            description: `@${user.username} se unió a la plataforma`,
            timestamp: user.created_at,
            user: {
              username: user.username,
              avatar_url: user.avatar_url,
            },
          });
        });
      }

      // Escenarios recientes (sin join)
      const { data: recentScenarios } = await supabase
        .from("scenarios")
        .select("id, title, created_at, creator_id")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentScenarios) {
        recentScenarios.forEach((scenario: any) => {
          activities.push({
            id: `scenario-${scenario.id}`,
            type: "scenario_created",
            title: "Nuevo escenario creado",
            description: scenario.title,
            timestamp: scenario.created_at,
          });
        });
      }

      // Compras recientes (sin join)
      const { data: recentPurchases } = await supabase
        .from("user_purchases")
        .select("id, quantity, price_paid, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentPurchases) {
        recentPurchases.forEach((purchase: any) => {
          activities.push({
            id: `purchase-${purchase.id}`,
            type: "purchase",
            title: "Nueva compra",
            description: `Compra x${purchase.quantity} por ${purchase.price_paid} AP`,
            timestamp: purchase.created_at,
          });
        });
      }

      // Ordenar por timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return [];
    }
  }

  // ============================================
  // TIENDA - ITEMS
  // ============================================

  async getShopItems(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shop items:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getShopItems:", error);
      return [];
    }
  }

  async createShopItem(item: any): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const { data, error } = await supabase
        .from("shop_items")
        .insert(item)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error("Error in createShopItem:", error);
      return { success: false, error: "Error al crear item" };
    }
  }

  async updateShopItem(itemId: string, updates: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("shop_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", itemId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateShopItem:", error);
      return { success: false, error: "Error al actualizar item" };
    }
  }

  async deleteShopItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("shop_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteShopItem:", error);
      return { success: false, error: "Error al eliminar item" };
    }
  }
}

export const adminService = new AdminService();