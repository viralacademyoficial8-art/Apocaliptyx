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
  metadata: Record<string, any>;
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
// MOCK DATA
// ============================================

const mockUsers: AdminUser[] = [
  {
    id: '1',
    username: 'prophet_master',
    email: 'prophet@example.com',
    displayName: 'El Profeta Maestro',
    avatarUrl: null,
    role: 'USER',
    apCoins: 125000,
    level: 42,
    isVerified: true,
    isBanned: false,
    bannedReason: null,
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-12-20T15:30:00Z',
    totalPredictions: 156,
    correctPredictions: 98,
    totalEarnings: 450000,
  },
  {
    id: '2',
    username: 'dark_oracle',
    email: 'oracle@example.com',
    displayName: 'Oráculo Oscuro',
    avatarUrl: null,
    role: 'USER',
    apCoins: 89000,
    level: 35,
    isVerified: true,
    isBanned: false,
    bannedReason: null,
    createdAt: '2024-02-20T14:00:00Z',
    lastLoginAt: '2024-12-19T20:00:00Z',
    totalPredictions: 120,
    correctPredictions: 72,
    totalEarnings: 280000,
  },
  {
    id: '3',
    username: 'toxic_user123',
    email: 'toxic@example.com',
    displayName: 'Usuario Tóxico',
    avatarUrl: null,
    role: 'USER',
    apCoins: 500,
    level: 5,
    isVerified: false,
    isBanned: true,
    bannedReason: 'Comportamiento abusivo y spam',
    createdAt: '2024-11-01T08:00:00Z',
    lastLoginAt: '2024-11-15T10:00:00Z',
    totalPredictions: 12,
    correctPredictions: 2,
    totalEarnings: 1500,
  },
  {
    id: '4',
    username: 'mod_sarah',
    email: 'sarah@apocaliptics.com',
    displayName: 'Sarah (Mod)',
    avatarUrl: null,
    role: 'MODERATOR',
    apCoins: 50000,
    level: 28,
    isVerified: true,
    isBanned: false,
    bannedReason: null,
    createdAt: '2024-03-10T09:00:00Z',
    lastLoginAt: '2024-12-20T18:00:00Z',
    totalPredictions: 45,
    correctPredictions: 30,
    totalEarnings: 75000,
  },
  {
    id: '5',
    username: 'newbie_2024',
    email: 'newbie@example.com',
    displayName: null,
    avatarUrl: null,
    role: 'USER',
    apCoins: 1000,
    level: 1,
    isVerified: false,
    isBanned: false,
    bannedReason: null,
    createdAt: '2024-12-18T12:00:00Z',
    lastLoginAt: '2024-12-20T14:00:00Z',
    totalPredictions: 2,
    correctPredictions: 1,
    totalEarnings: 500,
  },
];

const mockScenarios: AdminScenario[] = [
  {
    id: '1',
    title: 'Bitcoin superará los $150,000 antes de Marzo 2025',
    description: 'El precio de Bitcoin alcanzará un nuevo máximo histórico superando los $150,000 USD.',
    category: 'ECONOMIA',
    status: 'ACTIVE',
    currentPrice: 2500,
    totalPool: 125000,
    votesUp: 1250,
    votesDown: 380,
    deadline: '2025-03-01T00:00:00Z',
    createdAt: '2024-12-01T10:00:00Z',
    creator: { id: '1', username: 'prophet_master', avatarUrl: null },
    currentHolder: { id: '2', username: 'dark_oracle' },
    imageUrl: null,
    isFeatured: true,
    reportCount: 0,
  },
  {
    id: '2',
    title: 'El Real Madrid ganará la Champions League 2025',
    description: 'El Real Madrid se coronará campeón de la UEFA Champions League temporada 2024-2025.',
    category: 'DEPORTES',
    status: 'ACTIVE',
    currentPrice: 1800,
    totalPool: 89000,
    votesUp: 890,
    votesDown: 650,
    deadline: '2025-06-01T00:00:00Z',
    createdAt: '2024-11-15T14:00:00Z',
    creator: { id: '2', username: 'dark_oracle', avatarUrl: null },
    currentHolder: { id: '1', username: 'prophet_master' },
    imageUrl: null,
    isFeatured: false,
    reportCount: 2,
  },
  {
    id: '3',
    title: 'Escenario pendiente de aprobación',
    description: 'Este escenario está esperando revisión del equipo de moderación.',
    category: 'TECNOLOGIA',
    status: 'PENDING_APPROVAL',
    currentPrice: 100,
    totalPool: 100,
    votesUp: 5,
    votesDown: 2,
    deadline: '2025-01-15T00:00:00Z',
    createdAt: '2024-12-19T08:00:00Z',
    creator: { id: '5', username: 'newbie_2024', avatarUrl: null },
    currentHolder: null,
    imageUrl: null,
    isFeatured: false,
    reportCount: 0,
  },
  {
    id: '4',
    title: 'CONTENIDO INAPROPIADO - Reportado',
    description: 'Este escenario ha sido reportado múltiples veces.',
    category: 'OTROS',
    status: 'PENDING_APPROVAL',
    currentPrice: 100,
    totalPool: 100,
    votesUp: 5,
    votesDown: 45,
    deadline: '2025-01-15T00:00:00Z',
    createdAt: '2024-12-19T08:00:00Z',
    creator: { id: '3', username: 'toxic_user123', avatarUrl: null },
    currentHolder: null,
    imageUrl: null,
    isFeatured: false,
    reportCount: 15,
  },
];

const mockReports: AdminReport[] = [
  {
    id: '1',
    type: 'USER',
    reason: 'Acoso y comportamiento tóxico',
    description: 'Este usuario me ha estado enviando mensajes ofensivos y amenazantes.',
    status: 'PENDING',
    priority: 'HIGH',
    createdAt: '2024-12-20T10:00:00Z',
    reporter: { id: '1', username: 'prophet_master' },
    reported: { id: '3', type: 'USER', username: 'toxic_user123' },
    assignedTo: null,
    resolution: null,
    resolvedAt: null,
  },
  {
    id: '2',
    type: 'SCENARIO',
    reason: 'Contenido inapropiado',
    description: 'El escenario contiene lenguaje ofensivo.',
    status: 'REVIEWED',
    priority: 'MEDIUM',
    createdAt: '2024-12-19T15:00:00Z',
    reporter: { id: '2', username: 'dark_oracle' },
    reported: { id: '4', type: 'SCENARIO', title: 'CONTENIDO INAPROPIADO' },
    assignedTo: { id: '4', username: 'mod_sarah' },
    resolution: null,
    resolvedAt: null,
  },
  {
    id: '3',
    type: 'COMMENT',
    reason: 'Spam',
    description: 'Usuario publicando enlaces de spam.',
    status: 'RESOLVED',
    priority: 'LOW',
    createdAt: '2024-12-18T09:00:00Z',
    reporter: { id: '4', username: 'mod_sarah' },
    reported: { id: '5', type: 'COMMENT', title: 'Comentario spam' },
    assignedTo: { id: '4', username: 'mod_sarah' },
    resolution: 'Comentario eliminado y usuario advertido.',
    resolvedAt: '2024-12-18T10:30:00Z',
  },
];

const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Escudo de Protección',
    description: 'Protege uno de tus escenarios contra robos durante 24 horas.',
    imageUrl: null,
    type: 'PROTECTION',
    price: 500,
    stock: null,
    maxPerUser: 5,
    isActive: true,
    totalSales: 1250,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Multiplicador x2',
    description: 'Duplica las ganancias de tu próxima predicción correcta.',
    imageUrl: null,
    type: 'BOOST',
    price: 1000,
    stock: 100,
    maxPerUser: 3,
    isActive: true,
    totalSales: 456,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Avatar Dorado',
    description: 'Marco dorado exclusivo para tu perfil.',
    imageUrl: null,
    type: 'COSMETIC',
    price: 5000,
    stock: 50,
    maxPerUser: 1,
    isActive: true,
    totalSales: 23,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Pack Navideño 2024',
    description: 'Pack especial con escudo, multiplicador y avatar festivo.',
    imageUrl: null,
    type: 'SPECIAL',
    price: 3500,
    stock: 0,
    maxPerUser: 1,
    isActive: false,
    totalSales: 500,
    createdAt: '2024-12-01T00:00:00Z',
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Primera Predicción',
    description: 'Realiza tu primera predicción en un escenario.',
    icon: '🎯',
    requirement: { type: 'predictions', count: 1 },
    rewardCoins: 100,
    rewardXp: 50,
    unlockedCount: 12500,
    isActive: true,
  },
  {
    id: '2',
    name: 'Profeta Novato',
    description: 'Acierta 10 predicciones.',
    icon: '🔮',
    requirement: { type: 'correct_predictions', count: 10 },
    rewardCoins: 500,
    rewardXp: 200,
    unlockedCount: 3400,
    isActive: true,
  },
  {
    id: '3',
    name: 'Ladrón Maestro',
    description: 'Roba 50 escenarios a otros usuarios.',
    icon: '🦹',
    requirement: { type: 'steals', count: 50 },
    rewardCoins: 2000,
    rewardXp: 1000,
    unlockedCount: 245,
    isActive: true,
  },
  {
    id: '4',
    name: 'Millonario',
    description: 'Acumula 1,000,000 de AP Coins.',
    icon: '💰',
    requirement: { type: 'total_coins', count: 1000000 },
    rewardCoins: 10000,
    rewardXp: 5000,
    unlockedCount: 12,
    isActive: true,
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'USER_BANNED',
    category: 'MODERATION',
    description: 'Usuario toxic_user123 baneado por comportamiento abusivo.',
    metadata: { reason: 'Comportamiento abusivo y spam', duration: 'permanent' },
    admin: { id: 'admin1', username: 'admin_principal' },
    targetType: 'USER',
    targetId: '3',
    createdAt: '2024-12-20T14:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    action: 'SCENARIO_FEATURED',
    category: 'SCENARIO',
    description: 'Escenario "Bitcoin $150k" marcado como destacado.',
    metadata: { featured: true },
    admin: { id: 'admin1', username: 'admin_principal' },
    targetType: 'SCENARIO',
    targetId: '1',
    createdAt: '2024-12-20T12:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '3',
    action: 'SYSTEM_CONFIG_UPDATED',
    category: 'SYSTEM',
    description: 'dailyBonusAmount cambiado de 100 a 150.',
    metadata: { field: 'dailyBonusAmount', oldValue: 100, newValue: 150 },
    admin: { id: 'admin1', username: 'admin_principal' },
    targetType: null,
    targetId: null,
    createdAt: '2024-12-19T16:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '4',
    action: 'SHOP_ITEM_CREATED',
    category: 'SHOP',
    description: 'Nuevo item creado: Pack Navideño 2024.',
    metadata: { itemName: 'Pack Navideño 2024', price: 3500 },
    admin: { id: 'admin2', username: 'mod_sarah' },
    targetType: 'SHOP_ITEM',
    targetId: '4',
    createdAt: '2024-12-01T10:00:00Z',
    ipAddress: '192.168.1.101',
  },
];

const mockAnalytics: AnalyticsData = {
  overview: {
    totalUsers: 12847,
    activeUsers: 3421,
    newUsersToday: 127,
    newUsersWeek: 843,
    totalScenarios: 1523,
    activeScenarios: 456,
    totalTransactions: 89432,
    totalVolume: 45678900,
  },
  charts: {
    userGrowth: [
      { date: '2024-12-14', users: 12100 },
      { date: '2024-12-15', users: 12250 },
      { date: '2024-12-16', users: 12380 },
      { date: '2024-12-17', users: 12500 },
      { date: '2024-12-18', users: 12620 },
      { date: '2024-12-19', users: 12720 },
      { date: '2024-12-20', users: 12847 },
    ],
    dailyTransactions: [
      { date: '2024-12-14', count: 1250, volume: 567000 },
      { date: '2024-12-15', count: 1380, volume: 623000 },
      { date: '2024-12-16', count: 1100, volume: 489000 },
      { date: '2024-12-17', count: 1450, volume: 712000 },
      { date: '2024-12-18', count: 1520, volume: 834000 },
      { date: '2024-12-19', count: 1680, volume: 956000 },
      { date: '2024-12-20', count: 1420, volume: 678000 },
    ],
    categoryDistribution: [
      { category: 'ECONOMIA', count: 345 },
      { category: 'DEPORTES', count: 412 },
      { category: 'TECNOLOGIA', count: 289 },
      { category: 'POLITICA', count: 234 },
      { category: 'ENTRETENIMIENTO', count: 178 },
      { category: 'OTROS', count: 65 },
    ],
    topScenarios: [
      { title: 'Bitcoin $150k', pool: 125000 },
      { title: 'Champions 2025', pool: 89000 },
      { title: 'iPhone 17 Pro', pool: 67000 },
      { title: 'Elecciones USA', pool: 54000 },
      { title: 'Mundial 2026', pool: 45000 },
    ],
  },
  topUsers: {
    byEarnings: mockUsers.filter(u => !u.isBanned).sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5),
    byPredictions: mockUsers.filter(u => !u.isBanned).sort((a, b) => b.totalPredictions - a.totalPredictions).slice(0, 5),
    byLevel: mockUsers.filter(u => !u.isBanned).sort((a, b) => b.level - a.level).slice(0, 5),
  },
};

const mockSystemConfig: SystemConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando mejoras. Volvemos pronto.',
  registrationEnabled: true,
  minWithdrawAmount: 1000,
  maxDailyWithdraw: 100000,
  stealFeePercent: 10,
  winnerFeePercent: 5,
  dailyBonusAmount: 100,
  referralBonus: 500,
  newUserBonus: 1000,
  announcementBanner: '🎄 ¡Felices fiestas! Aprovecha el Pack Navideño con 30% de descuento.',
  announcementType: 'INFO',
};

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
  
  // Filters
  userFilters: { search: string; role: string; status: string; sortBy: string };
  scenarioFilters: { search: string; category: string; status: string; sortBy: string };
  reportFilters: { type: string; status: string; priority: string };
  
  // Selected items
  selectedUsers: string[];
  selectedScenarios: string[];
  selectedReports: string[];
  
  // Actions - Users
  setUsers: (users: AdminUser[]) => void;
  updateUser: (id: string, data: Partial<AdminUser>) => void;
  banUser: (id: string, reason: string) => void;
  unbanUser: (id: string) => void;
  verifyUser: (id: string) => void;
  changeUserRole: (id: string, role: AdminUser['role']) => void;
  adjustUserCoins: (id: string, amount: number, reason: string) => void;
  
  // Actions - Scenarios
  setScenarios: (scenarios: AdminScenario[]) => void;
  updateScenario: (id: string, data: Partial<AdminScenario>) => void;
  approveScenario: (id: string) => void;
  rejectScenario: (id: string, reason: string) => void;
  featureScenario: (id: string, featured: boolean) => void;
  resolveScenario: (id: string, outcome: boolean) => void;
  cancelScenario: (id: string, reason: string) => void;
  
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
  bulkBanUsers: (ids: string[], reason: string) => void;
  bulkDeleteScenarios: (ids: string[]) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAdminStore = create<AdminStore>((set) => ({
  // Initial State
  users: mockUsers,
  scenarios: mockScenarios,
  reports: mockReports,
  shopItems: mockShopItems,
  achievements: mockAchievements,
  auditLogs: mockAuditLogs,
  analytics: mockAnalytics,
  systemConfig: mockSystemConfig,
  isLoading: false,
  error: null,
  
  userFilters: { search: '', role: 'all', status: 'all', sortBy: 'createdAt' },
  scenarioFilters: { search: '', category: 'all', status: 'all', sortBy: 'createdAt' },
  reportFilters: { type: 'all', status: 'all', priority: 'all' },
  
  selectedUsers: [],
  selectedScenarios: [],
  selectedReports: [],

  // Users
  setUsers: (users) => set({ users }),
  updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, ...data } : u) })),
  banUser: (id, reason) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, isBanned: true, bannedReason: reason } : u) })),
  unbanUser: (id) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, isBanned: false, bannedReason: null } : u) })),
  verifyUser: (id) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, isVerified: true } : u) })),
  changeUserRole: (id, role) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, role } : u) })),
  adjustUserCoins: (id, amount) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, apCoins: u.apCoins + amount } : u) })),

  // Scenarios
  setScenarios: (scenarios) => set({ scenarios }),
  updateScenario: (id, data) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, ...data } : sc) })),
  approveScenario: (id) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'ACTIVE' } : sc) })),
  rejectScenario: (id) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'CANCELLED' } : sc) })),
  featureScenario: (id, featured) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, isFeatured: featured } : sc) })),
  resolveScenario: (id, outcome) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: outcome ? 'COMPLETED' : 'FAILED' } : sc) })),
  cancelScenario: (id) => set((s) => ({ scenarios: s.scenarios.map((sc) => sc.id === id ? { ...sc, status: 'CANCELLED' } : sc) })),

  // Reports
  setReports: (reports) => set({ reports }),
  assignReport: (id, adminId) => set((s) => ({ reports: s.reports.map((r) => r.id === id ? { ...r, status: 'REVIEWED', assignedTo: { id: adminId, username: 'admin' } } : r) })),
  resolveReport: (id, resolution) => set((s) => ({ reports: s.reports.map((r) => r.id === id ? { ...r, status: 'RESOLVED', resolution, resolvedAt: new Date().toISOString() } : r) })),
  dismissReport: (id, reason) => set((s) => ({ reports: s.reports.map((r) => r.id === id ? { ...r, status: 'DISMISSED', resolution: reason, resolvedAt: new Date().toISOString() } : r) })),
  escalateReport: (id) => set((s) => ({ reports: s.reports.map((r) => r.id === id ? { ...r, priority: 'CRITICAL' } : r) })),

  // Shop
  setShopItems: (items) => set({ shopItems: items }),
  addShopItem: (item) => set((s) => ({ shopItems: [...s.shopItems, { ...item, id: Date.now().toString(), totalSales: 0, createdAt: new Date().toISOString() }] })),
  updateShopItem: (id, data) => set((s) => ({ shopItems: s.shopItems.map((i) => i.id === id ? { ...i, ...data } : i) })),
  toggleShopItem: (id, active) => set((s) => ({ shopItems: s.shopItems.map((i) => i.id === id ? { ...i, isActive: active } : i) })),
  deleteShopItem: (id) => set((s) => ({ shopItems: s.shopItems.filter((i) => i.id !== id) })),

  // Achievements
  setAchievements: (achievements) => set({ achievements }),
  addAchievement: (achievement) => set((s) => ({ achievements: [...s.achievements, { ...achievement, id: Date.now().toString(), unlockedCount: 0 }] })),
  updateAchievement: (id, data) => set((s) => ({ achievements: s.achievements.map((a) => a.id === id ? { ...a, ...data } : a) })),

  // System
  setSystemConfig: (config) => set({ systemConfig: config }),
  updateSystemConfig: (data) => set((s) => ({ systemConfig: s.systemConfig ? { ...s.systemConfig, ...data } : null })),
  toggleMaintenanceMode: (enabled, message) => set((s) => ({ systemConfig: s.systemConfig ? { ...s.systemConfig, maintenanceMode: enabled, maintenanceMessage: message || s.systemConfig.maintenanceMessage } : null })),
  setAnnouncement: (message, type) => set((s) => ({ systemConfig: s.systemConfig ? { ...s.systemConfig, announcementBanner: message, announcementType: type || null } : null })),

  // Analytics & Logs
  setAnalytics: (data) => set({ analytics: data }),
  setAuditLogs: (logs) => set({ auditLogs: logs }),

  // Filters
  setUserFilters: (filters) => set((s) => ({ userFilters: { ...s.userFilters, ...filters } })),
  setScenarioFilters: (filters) => set((s) => ({ scenarioFilters: { ...s.scenarioFilters, ...filters } })),
  setReportFilters: (filters) => set((s) => ({ reportFilters: { ...s.reportFilters, ...filters } })),

  // Selection
  toggleUserSelection: (id) => set((s) => ({ selectedUsers: s.selectedUsers.includes(id) ? s.selectedUsers.filter((i) => i !== id) : [...s.selectedUsers, id] })),
  toggleScenarioSelection: (id) => set((s) => ({ selectedScenarios: s.selectedScenarios.includes(id) ? s.selectedScenarios.filter((i) => i !== id) : [...s.selectedScenarios, id] })),
  clearSelections: () => set({ selectedUsers: [], selectedScenarios: [], selectedReports: [] }),

  // Bulk
  bulkBanUsers: (ids, reason) => set((s) => ({ users: s.users.map((u) => ids.includes(u.id) ? { ...u, isBanned: true, bannedReason: reason } : u), selectedUsers: [] })),
  bulkDeleteScenarios: (ids) => set((s) => ({ scenarios: s.scenarios.filter((sc) => !ids.includes(sc.id)), selectedScenarios: [] })),
}));