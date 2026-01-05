// src/hooks/useAdminData.ts

import { useState, useEffect, useCallback } from "react";

// Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalScenarios: number;
  activeScenarios: number;
  completedScenarios: number;
  totalTransactions: number;
  totalVolume: number;
  pendingReports: number;
  bannedUsers: number;
  totalPosts: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  avgSessionTime: string;
  retentionRate: number;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
  prophetLevel: string;
  apCoins: number;
  level: number;
  xp: number;
  isVerified: boolean;
  isPremium: boolean;
  totalPredictions: number;
  correctPredictions: number;
  winRate: string;
  totalEarnings: number;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  result?: string;
  imageUrl?: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar?: string;
  totalPool: number;
  yesVotes: number;
  noVotes: number;
  reports: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReport {
  id: string;
  type: string;
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  reporterId: string;
  reporterUsername: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  username?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Hook para estadísticas
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// Hook para usuarios
export function useAdminUsers(initialFilters?: {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.role) params.set("role", filters.role);
      if (filters.page) params.set("page", filters.page.toString());
      if (filters.limit) params.set("limit", filters.limit.toString());

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (userId: string, action: string, value?: unknown) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      if (!res.ok) throw new Error("Error al actualizar usuario");
      await fetchUsers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    }
  };

  return {
    users,
    total,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchUsers,
    updateUser,
  };
}

// Hook para escenarios
export function useAdminScenarios(initialFilters?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const [scenarios, setScenarios] = useState<AdminScenario[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.page) params.set("page", filters.page.toString());
      if (filters.limit) params.set("limit", filters.limit.toString());

      const res = await fetch(`/api/admin/scenarios?${params}`);
      if (!res.ok) throw new Error("Error al cargar escenarios");
      const data = await res.json();
      setScenarios(data.scenarios);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const updateScenario = async (scenarioId: string, action: string, result?: string) => {
    try {
      const res = await fetch("/api/admin/scenarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, action, result }),
      });
      if (!res.ok) throw new Error("Error al actualizar escenario");
      await fetchScenarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    try {
      const res = await fetch(`/api/admin/scenarios?id=${scenarioId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar escenario");
      await fetchScenarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    }
  };

  return {
    scenarios,
    total,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchScenarios,
    updateScenario,
    deleteScenario,
  };
}

// Hook para reportes
export function useAdminReports(initialFilters?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.type) params.set("type", filters.type);
      if (filters.page) params.set("page", filters.page.toString());
      if (filters.limit) params.set("limit", filters.limit.toString());

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Error al cargar reportes");
      const data = await res.json();
      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateReport = async (reportId: string, reportType: string, action: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, reportType, action }),
      });
      if (!res.ok) throw new Error("Error al actualizar reporte");
      await fetchReports();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    }
  };

  return {
    reports,
    total,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchReports,
    updateReport,
  };
}

// Hook para actividad
export function useAdminActivity(limit: number = 20) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/activity?limit=${limit}`);
      if (!res.ok) throw new Error("Error al cargar actividad");
      const data = await res.json();
      setActivities(data.activities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activities, loading, error, refetch: fetchActivity };
}