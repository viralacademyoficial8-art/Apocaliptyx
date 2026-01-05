// src/stores/adminStore.ts

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  apCoins: number;
  level: number;
  isVerified: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  totalPredictions: number;
  correctPredictions: number;
  totalEarnings: number;
}

export interface AdminScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PENDING_RESOLUTION' | 'PENDING_APPROVAL';
  currentPrice: number;
  totalPool: number;
  votesUp: number;
  votesDown: number;
  deadline: string;
  createdAt: string;
  creator: { id: string; username: string; avatarUrl: string | null };
  currentHolder: { id: string; username: string } | null;
  imageUrl: string | null;
  isFeatured: boolean;
  reportCount: number;
}

export interface AdminReport {
  id: string;
  type: 'USER' | 'SCENARIO' | 'COMMENT' | 'POST';
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  reporter: { id: string; username: string };
  reported: { id: string; type: string; title?: string; username?: string };
  assignedTo: { id: string; username: string } | null;
  resolution: string | null;
  resolvedAt: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  type: 'PROTECTION' | 'POWER' | 'BOOST' | 'COSMETIC' | 'SPECIAL';
  price: number;
  stock: number | null;
  maxPerUser: number | null;
  isActive: boolean;
  totalSales: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: { type: string; count: number };
  rewardCoins: number;
  rewardXp: number;
  unlockedCount: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'USER' | 'SCENARIO' | 'SYSTEM' | 'SHOP' | 'MODERATION';
  description: string;
  metadata: Record<string, unknown>;
  admin: { id: string; username: string };
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  ipAddress: string | null;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  minWithdrawAmount: number;
  maxDailyWithdraw: number;
  stealFeePercent: number;
  winnerFeePercent: number;
  dailyBonusAmount: number;
  referralBonus: number;
  newUserBonus: number;
  announcementBanner: string | null;
  announcementType: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | null;
}

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    totalScenarios: number;
    activeScenarios: number;
    totalTransactions: number;
    totalVolume: number;
  };
  charts: {
    userGrowth: { date: string; users: number }[];
    dailyTransactions: { date: string; count: number; volume: number }[];
    categoryDistribution: { category: string; count: number }[];
    topScenarios: { title: string; pool: number }[];
  };
  topUsers: {
    byEarnings: AdminUser[];
    byPredictions: AdminUser[];
    byLevel: AdminUser[];
  };
}

// ============================================
// STORE INTERFACE
// ============================================

interface AdminStore {
  // State
  users: AdminUser[];
  scenarios: AdminScenario[];
  reports: AdminReport[];
  shopItems: ShopItem[];
  achievements: Achievement[];
  auditLogs: AuditLog[];
  analytics: AnalyticsData | null;
  systemConfig: SystemConfig | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  usersPagination: { total: number; page: number; totalPages: number };
  scenariosPagination: { total: number; page: number; totalPages: number };

  // Filters
  userFilters: { search: string; role: string; status: string; sortBy: string };
  scenarioFilters: { search: string; category: string; status: string; sortBy: string };
  reportFilters: { type: string; status: string; priority: string };

  // Selected items
  selectedUsers: string[];
  selectedScenarios: string[];
  selectedReports: string[];

  // Fetch Actions
  fetchUsers: (page?: number) => Promise<void>;
  fetchScenarios: (page?: number) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActivity: () => Promise<void>;

  // Actions - Users
  setUsers: (users: AdminUser[]) => void;
  updateUser: (id: string, data: Partial<AdminUser>) => void;
  banUser: (id: string, reason: string) => Promise<boolean>;
  unbanUser: (id: string) => Promise<boolean>;
  verifyUser: (id: string) => Promise<boolean>;
  changeUserRole: (id: string, role: AdminUser['role']) => Promise<boolean>;
  adjustUserCoins: (id: string, amount: number, reason: string) => Promise<boolean>;

  // Actions - Scenarios
  setScenarios: (scenarios: AdminScenario[]) => void;
  updateScenario: (id: string, data: Partial<AdminScenario>) => void;
  approveScenario: (id: string) => Promise<boolean>;
  rejectScenario: (id: string, reason: string) => Promise<boolean>;
  featureScenario: (id: string, featured: boolean) => void;
  resolveScenario: (id: string, outcome: boolean) => Promise<boolean>;
  cancelScenario: (id: string, reason: string) => Promise<boolean>;
  deleteScenario: (id: string) => Promise<boolean>;

  // Actions - Reports
  setReports: (reports: AdminReport[]) => void;
  assignReport: (id: string, adminId: string) => void;
  resolveReport: (id: string, resolution: string) => void;
  dismissReport: (id: string, reason: string) => void;
  escalateReport: (id: string) => void;

  // Actions - Shop
  setShopItems: (items: ShopItem[]) => void;
  addShopItem: (item: Omit<ShopItem, 'id' | 'totalSales' | 'createdAt'>) => void;
  updateShopItem: (id: string, data: Partial<ShopItem>) => void;
  toggleShopItem: (id: string, active: boolean) => void;
  deleteShopItem: (id: string) => void;

  // Actions - Achievements
  setAchievements: (achievements: Achievement[]) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedCount'>) => void;
  updateAchievement: (id: string, data: Partial<Achievement>) => void;

  // Actions - System
  setSystemConfig: (config: SystemConfig) => void;
  updateSystemConfig: (data: Partial<SystemConfig>) => void;
  toggleMaintenanceMode: (enabled: boolean, message?: string) => void;
  setAnnouncement: (message: string | null, type?: SystemConfig['announcementType']) => void;

  // Actions - Analytics & Logs
  setAnalytics: (data: AnalyticsData) => void;
  setAuditLogs: (logs: AuditLog[]) => void;

  // Actions - Filters
  setUserFilters: (filters: Partial<AdminStore['userFilters']>) => void;
  setScenarioFilters: (filters: Partial<AdminStore['scenarioFilters']>) => void;
  setReportFilters: (filters: Partial<AdminStore['reportFilters']>) => void;

  // Actions - Selection
  toggleUserSelection: (id: string) => void;
  toggleScenarioSelection: (id: string) => void;
  clearSelections: () => void;

  // Bulk actions
  bulkBanUsers: (ids: string[], reason: string) => Promise<void>;
  bulkDeleteScenarios: (ids: string[]) => Promise<void>;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial State - Empty, will be populated from APIs
  users: [],
  scenarios: [],
  reports: [],
  shopItems: [],
  achievements: [],
  auditLogs: [],
  analytics: null,
  systemConfig: null,
  isLoading: false,
  error: null,

  // Pagination
  usersPagination: { total: 0, page: 1, totalPages: 0 },
  scenariosPagination: { total: 0, page: 1, totalPages: 0 },

  // Filters
  userFilters: { search: '', role: 'all', status: 'all', sortBy: 'createdAt' },
  scenarioFilters: { search: '', category: 'all', status: 'all', sortBy: 'createdAt' },
  reportFilters: { type: 'all', status: 'all', priority: 'all' },

  selectedUsers: [],
  selectedScenarios: [],
  selectedReports: [],

  // ============================================
  // FETCH ACTIONS - Load from APIs
  // ============================================

  fetchUsers: async (page = 1) => {
    const { userFilters } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: userFilters.search,
        status: userFilters.status,
        role: userFilters.role,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar usuarios');
      }

      const data = await res.json();

      const users: AdminUser[] = data.users.map((u: Record<string, unknown>) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        displayName: u.displayName || u.display_name,
        avatarUrl: u.avatarUrl || u.avatar_url,
        role: (u.role as string)?.toUpperCase() || 'USER',
        apCoins: u.apCoins || u.ap_coins || 0,
        level: u.level || 1,
        isVerified: u.isVerified || u.is_verified || false,
        isBanned: u.status === 'banned' || u.is_banned || false,
        bannedReason: u.bannedReason || u.banned_reason || null,
        createdAt: u.createdAt || u.created_at,
        lastLoginAt: u.lastLoginAt || u.last_login_at || u.lastSeen || u.last_seen,
        totalPredictions: u.totalPredictions || u.total_predictions || 0,
        correctPredictions: u.correctPredictions || u.correct_predictions || 0,
        totalEarnings: u.totalEarnings || u.total_earnings || 0,
      }));

      set({
        users,
        usersPagination: {
          total: data.total,
          page: data.page,
          totalPages: data.totalPages
        },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchScenarios: async (page = 1) => {
    const { scenarioFilters } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: scenarioFilters.search,
        status: scenarioFilters.status,
        category: scenarioFilters.category,
      });

      const res = await fetch(`/api/admin/scenarios?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar escenarios');
      }

      const data = await res.json();

      const scenarios: AdminScenario[] = data.scenarios.map((s: Record<string, unknown>) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        status: (s.status as string)?.toUpperCase() || 'ACTIVE',
        currentPrice: s.currentPrice || s.current_price || 0,
        totalPool: s.totalPool || s.total_pool || s.total_p || 0,
        votesUp: s.votesUp || s.votes_up || s.yesVotes || s.yes_votes || 0,
        votesDown: s.votesDown || s.votes_down || s.noVotes || s.no_votes || 0,
        deadline: s.deadline,
        createdAt: s.createdAt || s.created_at,
        creator: {
          id: s.creatorId || s.creator_id || '',
          username: s.creatorUsername || s.creator_username || 'Unknown',
          avatarUrl: s.creatorAvatar || s.creator_avatar || null
        },
        currentHolder: null,
        imageUrl: s.imageUrl || s.image_url || null,
        isFeatured: s.isFeatured || s.is_featured || false,
        reportCount: s.reportCount || s.report_count || s.reports || 0,
      }));

      set({
        scenarios,
        scenariosPagination: {
          total: data.total,
          page: data.page,
          totalPages: data.totalPages
        },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchReports: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/admin/reports');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar reportes');
      }

      const data = await res.json();

      const reports: AdminReport[] = (data.reports || []).map((r: Record<string, unknown>) => ({
        id: r.id,
        type: (r.type as string)?.toUpperCase() || 'SCENARIO',
        reason: r.reason || '',
        description: r.description || '',
        status: (r.status as string)?.toUpperCase() || 'PENDING',
        priority: (r.priority as string)?.toUpperCase() || 'LOW',
        createdAt: r.createdAt || r.created_at,
        reporter: {
          id: r.reporterId || r.reporter_id || '',
          username: r.reporterUsername || r.reporter_username || 'Unknown'
        },
        reported: {
          id: r.targetId || r.target_id || '',
          type: r.type || 'SCENARIO',
          title: r.targetTitle || r.target_title,
          username: r.targetUsername || r.target_username
        },
        assignedTo: null,
        resolution: r.resolution || null,
        resolvedAt: r.resolvedAt || r.resolved_at || null,
      }));

      set({ reports, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar estadísticas');
      }

      const stats = await res.json();

      const analytics: AnalyticsData = {
        overview: {
          totalUsers: stats.totalUsers || 0,
          activeUsers: stats.activeUsers || 0,
          newUsersToday: stats.newUsersToday || 0,
          newUsersWeek: stats.newUsersThisWeek || stats.newUsersWeek || 0,
          totalScenarios: stats.totalScenarios || 0,
          activeScenarios: stats.activeScenarios || 0,
          totalTransactions: stats.totalTransactions || 0,
          totalVolume: stats.totalVolume || 0,
        },
        charts: {
          userGrowth: [],
          dailyTransactions: [],
          categoryDistribution: [],
          topScenarios: [],
        },
        topUsers: {
          byEarnings: [],
          byPredictions: [],
          byLevel: [],
        },
      };

      set({ analytics, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchActivity: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/admin/activity');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar actividad');
      }

      const data = await res.json();
      set({ auditLogs: data.activities || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ============================================
  // USER ACTIONS
  // ============================================

  setUsers: (users) => set({ users }),

  updateUser: (id, data) => set((s) => ({
    users: s.users.map((u) => u.id === id ? { ...u, ...data } : u)
  })),

  banUser: async (id, reason) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'ban', value: reason }),
      });

      if (!res.ok) return false;

      set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, isBanned: true, bannedReason: reason } : u)
      }));
      return true;
    } catch {
      return false;
    }
  },

  unbanUser: async (id) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'unban' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, isBanned: false, bannedReason: null } : u)
      }));
      return true;
    } catch {
      return false;
    }
  },

  verifyUser: async (id) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'verify' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, isVerified: true } : u)
      }));
      return true;
    } catch {
      return false;
    }
  },

  changeUserRole: async (id, role) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'setRole', value: role }),
      });

      if (!res.ok) return false;

      set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, role } : u)
      }));
      return true;
    } catch {
      return false;
    }
  },

  adjustUserCoins: async (id, amount) => {
    try {
      const user = get().users.find(u => u.id === id);
      if (!user) return false;

      const newAmount = user.apCoins + amount;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'setCoins', value: newAmount }),
      });

      if (!res.ok) return false;

      set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, apCoins: newAmount } : u)
      }));
      return true;
    } catch {
      return false;
    }
  },

  // ============================================
  // SCENARIO ACTIONS
  // ============================================

  setScenarios: (scenarios) => set({ scenarios }),

  updateScenario: (id, data) => set((s) => ({
    scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, ...data } : sc)
  })),

  approveScenario: async (id) => {
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id, action: 'approve' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'ACTIVE' } : sc)
      }));
      return true;
    } catch {
      return false;
    }
  },

  rejectScenario: async (id) => {
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id, action: 'reject' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'CANCELLED' } : sc)
      }));
      return true;
    } catch {
      return false;
    }
  },

  featureScenario: (id, featured) => set((s) => ({
    scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, isFeatured: featured } : sc)
  })),

  resolveScenario: async (id, outcome) => {
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id, action: 'resolve', result: outcome ? 'yes' : 'no' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: outcome ? 'COMPLETED' : 'FAILED' } : sc)
      }));
      return true;
    } catch {
      return false;
    }
  },

  cancelScenario: async (id) => {
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id, action: 'cancel' }),
      });

      if (!res.ok) return false;

      set((s) => ({
        scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'CANCELLED' } : sc)
      }));
      return true;
    } catch {
      return false;
    }
  },

  deleteScenario: async (id) => {
    try {
      const res = await fetch(`/api/admin/scenarios?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) return false;

      set((s) => ({
        scenarios: s.scenarios.filter((sc) => sc.id !== id)
      }));
      return true;
    } catch {
      return false;
    }
  },

  // ============================================
  // REPORT ACTIONS
  // ============================================

  setReports: (reports) => set({ reports }),

  assignReport: (id, adminId) => set((s) => ({
    reports: s.reports.map((r) => r.id === id ? { ...r, status: 'REVIEWED', assignedTo: { id: adminId, username: 'admin' } } : r)
  })),

  resolveReport: (id, resolution) => set((s) => ({
    reports: s.reports.map((r) => r.id === id ? { ...r, status: 'RESOLVED', resolution, resolvedAt: new Date().toISOString() } : r)
  })),

  dismissReport: (id, reason) => set((s) => ({
    reports: s.reports.map((r) => r.id === id ? { ...r, status: 'DISMISSED', resolution: reason, resolvedAt: new Date().toISOString() } : r)
  })),

  escalateReport: (id) => set((s) => ({
    reports: s.reports.map((r) => r.id === id ? { ...r, priority: 'CRITICAL' } : r)
  })),

  // ============================================
  // SHOP ACTIONS
  // ============================================

  setShopItems: (items) => set({ shopItems: items }),

  addShopItem: (item) => set((s) => ({
    shopItems: [...s.shopItems, { ...item, id: Date.now().toString(), totalSales: 0, createdAt: new Date().toISOString() }]
  })),

  updateShopItem: (id, data) => set((s) => ({
    shopItems: s.shopItems.map((i) => i.id === id ? { ...i, ...data } : i)
  })),

  toggleShopItem: (id, active) => set((s) => ({
    shopItems: s.shopItems.map((i) => i.id === id ? { ...i, isActive: active } : i)
  })),

  deleteShopItem: (id) => set((s) => ({
    shopItems: s.shopItems.filter((i) => i.id !== id)
  })),

  // ============================================
  // ACHIEVEMENT ACTIONS
  // ============================================

  setAchievements: (achievements) => set({ achievements }),

  addAchievement: (achievement) => set((s) => ({
    achievements: [...s.achievements, { ...achievement, id: Date.now().toString(), unlockedCount: 0 }]
  })),

  updateAchievement: (id, data) => set((s) => ({
    achievements: s.achievements.map((a) => a.id === id ? { ...a, ...data } : a)
  })),

  // ============================================
  // SYSTEM ACTIONS
  // ============================================

  setSystemConfig: (config) => set({ systemConfig: config }),

  updateSystemConfig: (data) => set((s) => ({
    systemConfig: s.systemConfig ? { ...s.systemConfig, ...data } : null
  })),

  toggleMaintenanceMode: (enabled, message) => set((s) => ({
    systemConfig: s.systemConfig ? { ...s.systemConfig, maintenanceMode: enabled, maintenanceMessage: message || s.systemConfig.maintenanceMessage } : null
  })),

  setAnnouncement: (message, type) => set((s) => ({
    systemConfig: s.systemConfig ? { ...s.systemConfig, announcementBanner: message, announcementType: type || null } : null
  })),

  // ============================================
  // ANALYTICS & LOGS
  // ============================================

  setAnalytics: (data) => set({ analytics: data }),
  setAuditLogs: (logs) => set({ auditLogs: logs }),

  // ============================================
  // FILTERS
  // ============================================

  setUserFilters: (filters) => set((s) => ({ userFilters: { ...s.userFilters, ...filters } })),
  setScenarioFilters: (filters) => set((s) => ({ scenarioFilters: { ...s.scenarioFilters, ...filters } })),
  setReportFilters: (filters) => set((s) => ({ reportFilters: { ...s.reportFilters, ...filters } })),

  // ============================================
  // SELECTION
  // ============================================

  toggleUserSelection: (id) => set((s) => ({
    selectedUsers: s.selectedUsers.includes(id) ? s.selectedUsers.filter((i) => i !== id) : [...s.selectedUsers, id]
  })),

  toggleScenarioSelection: (id) => set((s) => ({
    selectedScenarios: s.selectedScenarios.includes(id) ? s.selectedScenarios.filter((i) => i !== id) : [...s.selectedScenarios, id]
  })),

  clearSelections: () => set({ selectedUsers: [], selectedScenarios: [], selectedReports: [] }),

  // ============================================
  // BULK ACTIONS
  // ============================================

  bulkBanUsers: async (ids, reason) => {
    const results = await Promise.all(
      ids.map(id => get().banUser(id, reason))
    );
    if (results.every(r => r)) {
      set({ selectedUsers: [] });
    }
  },

  bulkDeleteScenarios: async (ids) => {
    const results = await Promise.all(
      ids.map(id => get().deleteScenario(id))
    );
    if (results.every(r => r)) {
      set({ selectedScenarios: [] });
    }
  },
}));
