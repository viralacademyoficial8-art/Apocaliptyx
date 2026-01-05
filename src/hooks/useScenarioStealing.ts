// src/hooks/useScenarioStealing.ts

import { useState, useCallback } from 'react';
import { SHIELD_TYPES } from '@/services/scenarioStealing.service';

export interface StealInfo {
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
  stealHistory: any[];
}

export interface StealResult {
  success: boolean;
  error?: string;
  stealPrice?: number;
  nextPrice?: number;
  poolTotal?: number;
  stealNumber?: number;
}

export interface UserStealStats {
  stealsAsThief: number;
  timesRobbed: number;
  totalSpent: number;
  totalWon: number;
  currentHoldings: number;
  netProfit: number;
}

export function useScenarioStealing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener información de robo de un escenario
  const getStealInfo = useCallback(async (scenarioId: string): Promise<StealInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scenarios/steal?scenarioId=${scenarioId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al obtener información');
        return null;
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Robar un escenario
  const stealScenario = useCallback(async (scenarioId: string): Promise<StealResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/scenarios/steal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al robar escenario');
        return { success: false, error: data.error };
      }

      return {
        success: true,
        stealPrice: data.stealPrice,
        nextPrice: data.nextPrice,
        poolTotal: data.poolTotal,
        stealNumber: data.stealNumber,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplicar escudo
  const applyShield = useCallback(async (
    scenarioId: string,
    shieldType: keyof typeof SHIELD_TYPES
  ): Promise<{ success: boolean; error?: string; protectedUntil?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/scenarios/shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, shieldType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al aplicar escudo');
        return { success: false, error: data.error };
      }

      return {
        success: true,
        protectedUntil: data.protectedUntil,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener escenarios que se pueden robar
  const getStealableScenarios = useCallback(async (limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scenarios/steal/stealable?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al obtener escenarios');
        return [];
      }

      return data.scenarios || [];
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estadísticas del usuario
  const getUserStats = useCallback(async (userId?: string): Promise<UserStealStats | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const url = userId
        ? `/api/scenarios/steal/stats?userId=${userId}`
        : '/api/scenarios/steal/stats';

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al obtener estadísticas');
        return null;
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener leaderboard
  const getLeaderboard = useCallback(async (limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scenarios/steal/leaderboard?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al obtener ranking');
        return [];
      }

      return data.leaderboard || [];
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener tipos de escudo
  const getShieldTypes = useCallback(() => {
    return Object.values(SHIELD_TYPES);
  }, []);

  return {
    isLoading,
    error,
    getStealInfo,
    stealScenario,
    applyShield,
    getStealableScenarios,
    getUserStats,
    getLeaderboard,
    getShieldTypes,
    SHIELD_TYPES,
  };
}
