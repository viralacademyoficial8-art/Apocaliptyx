// src/services/scenarios.service.ts

import { getSupabaseBrowser } from "@/lib/supabase-client";
import type { ScenarioCategory } from "@/types";

export interface CreateScenarioInput {
  title: string;
  description: string;
  category: ScenarioCategory | string;
  resolutionDate: string;
  creatorId: string;
  imageUrl?: string;
  contentHash?: string;
}

export interface ScenarioFromDB {
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
  content_hash?: string;
  // Stealing system fields
  current_holder_id?: string | null;
  current_price?: number;
  steal_count?: number;
  theft_pool?: number;
  is_protected?: boolean;
  protected_until?: string | null;
  can_be_stolen?: boolean;
  // Joined fields
  holder_username?: string;
  creator_username?: string;
}

class ScenariosService {
  /**
   * Crear un nuevo escenario
   */
  async create(input: CreateScenarioInput): Promise<ScenarioFromDB | null> {
    try {
      // Normalize category to UPPERCASE to match database enum
      const normalizedCategory = typeof input.category === 'string'
        ? input.category.toUpperCase()
        : input.category;

      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .insert({
          creator_id: input.creatorId,
          title: input.title,
          description: input.description,
          category: normalizedCategory,
          image_url: input.imageUrl || null,
          content_hash: input.contentHash || null,
          status: "ACTIVE",
          result: null,
          total_pool: 0,
          yes_pool: 0,
          no_pool: 0,
          participant_count: 0,
          min_bet: 10,
          max_bet: 10000,
          is_featured: false,
          is_hot: false,
          resolution_date: input.resolutionDate,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating scenario:", error);
        return null;
      }

      return data as ScenarioFromDB;
    } catch (error) {
      console.error("Error in create scenario:", error);
      return null;
    }
  }

  /**
   * Obtener todos los escenarios
   */
  async getAll(): Promise<ScenarioFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching scenarios:", error);
        return [];
      }

      return data as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getAll scenarios:", error);
      return [];
    }
  }

  /**
   * Obtener escenarios activos con usernames de creador y dueño
   */
  async getActive(limit?: number): Promise<ScenarioFromDB[]> {
    try {
      let query = getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("status", "ACTIVE")
        .order("steal_count", { ascending: false, nullsFirst: false })
        .order("yes_pool", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching active scenarios:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Obtener todos los IDs únicos de usuarios (creadores y holders)
      const userIds = new Set<string>();
      data.forEach((scenario) => {
        if (scenario.creator_id) userIds.add(scenario.creator_id);
        if (scenario.current_holder_id) userIds.add(scenario.current_holder_id);
      });

      // Obtener usernames en una sola consulta
      const { data: usersData } = await getSupabaseBrowser()
        .from("users")
        .select("id, username")
        .in("id", Array.from(userIds));

      // Crear mapa de id -> username
      const userMap = new Map<string, string>();
      usersData?.forEach((user) => {
        userMap.set(user.id, user.username);
      });

      // Agregar usernames a cada escenario
      return data.map((scenario) => ({
        ...scenario,
        creator_username: userMap.get(scenario.creator_id) || undefined,
        holder_username: scenario.current_holder_id
          ? userMap.get(scenario.current_holder_id)
          : userMap.get(scenario.creator_id) || undefined,
      })) as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getActive scenarios:", error);
      return [];
    }
  }

  /**
   * Obtener un escenario por ID
   */
  async getById(id: string): Promise<ScenarioFromDB | null> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching scenario:", error);
        return null;
      }

      // Fetch holder and creator usernames
      let holderUsername: string | undefined;
      let creatorUsername: string | undefined;

      if (data.current_holder_id) {
        const { data: holderData } = await getSupabaseBrowser()
          .from("users")
          .select("username")
          .eq("id", data.current_holder_id)
          .single();
        holderUsername = holderData?.username;
      }

      if (data.creator_id) {
        const { data: creatorData } = await getSupabaseBrowser()
          .from("users")
          .select("username")
          .eq("id", data.creator_id)
          .single();
        creatorUsername = creatorData?.username;
      }

      return {
        ...data,
        holder_username: holderUsername || creatorUsername,
        creator_username: creatorUsername,
      } as ScenarioFromDB;
    } catch (error) {
      console.error("Error in getById scenario:", error);
      return null;
    }
  }

  /**
   * Obtener escenarios por categoría
   */
  async getByCategory(category: string): Promise<ScenarioFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("category", category)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching scenarios by category:", error);
        return [];
      }

      return data as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getByCategory:", error);
      return [];
    }
  }

  /**
   * Obtener escenarios creados por un usuario
   */
  async getByCreator(creatorId: string): Promise<ScenarioFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user scenarios:", error);
        return [];
      }

      return data as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getByCreator:", error);
      return [];
    }
  }

  /**
   * Obtener escenarios que posee un usuario (current_holder_id)
   */
  async getByHolder(holderId: string): Promise<ScenarioFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("current_holder_id", holderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching held scenarios:", error);
        return [];
      }

      return data as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getByHolder:", error);
      return [];
    }
  }

  /**
   * Obtener escenarios destacados
   */
  async getFeatured(): Promise<ScenarioFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("scenarios")
        .select("*")
        .eq("is_featured", true)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching featured scenarios:", error);
        return [];
      }

      return data as ScenarioFromDB[];
    } catch (error) {
      console.error("Error in getFeatured:", error);
      return [];
    }
  }

  /**
   * Actualizar votos de un escenario
   */
  async updatePools(
    scenarioId: string,
    yesPool: number,
    noPool: number,
    participantCount: number
  ): Promise<boolean> {
    try {
      const { error } = await getSupabaseBrowser()
        .from("scenarios")
        .update({
          yes_pool: yesPool,
          no_pool: noPool,
          total_pool: yesPool + noPool,
          participant_count: participantCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scenarioId);

      if (error) {
        console.error("Error updating pools:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updatePools:", error);
      return false;
    }
  }

  /**
   * Resolver un escenario (marcar resultado)
   */
  async resolve(scenarioId: string, result: "YES" | "NO"): Promise<boolean> {
    try {
      const { error } = await getSupabaseBrowser()
        .from("scenarios")
        .update({
          status: "COMPLETED",
          result: result,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", scenarioId);

      if (error) {
        console.error("Error resolving scenario:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in resolve:", error);
      return false;
    }
  }
}

export const scenariosService = new ScenariosService();