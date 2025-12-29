// src/stores/profileStore.ts

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  level: number;
  xp: number;
  xpToNextLevel: number;
  apCoins: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  
  // Social
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean; // Solo para perfiles de otros
  
  // Stats
  stats: UserStats;
  
  // Customization
  customization: UserCustomization;
  
  // Badges
  badges: UserBadge[];
  
  // Title
  activeTitle: string | null;
  
  // Social Links
  socialLinks: {
    twitter?: string;
    discord?: string;
    instagram?: string;
  };
}

export interface UserStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalEarnings: number;
  totalLosses: number;
  netProfit: number;
  scenariosCreated: number;
  scenariosWon: number;
  stealsSuccessful: number;
  stealsReceived: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  percentile: number;
}

export interface UserCustomization {
  avatarFrame: string | null;
  profileTheme: string;
  entryEffect: string | null;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: string;
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  rewardCoins: number;
  rewardXp: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  type: 'PROTECTION' | 'POWER' | 'BOOST' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  quantity: number;
  isEquipped: boolean;
  purchasedAt: string;
  expiresAt: string | null;
}

export interface PredictionHistory {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioCategory: string;
  prediction: 'UP' | 'DOWN';
  amount: number;
  result: 'WON' | 'LOST' | 'PENDING' | 'CANCELLED';
  profit: number;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ActivityItem {
  id: string;
  type: 'PREDICTION' | 'ACHIEVEMENT' | 'PURCHASE' | 'LEVEL_UP' | 'STEAL' | 'STOLEN';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================
// MOCK DATA
// ============================================

const mockProfile: UserProfile = {
  id: '1',
  username: 'prophet_master',
  email: 'prophet@example.com',
  displayName: 'El Profeta Maestro',
  bio: '🔮 Prediciendo el futuro desde 2024. Top 1% de profetas. Especialista en tecnología y economía.',
  avatarUrl: null,
  bannerUrl: null,
  role: 'USER',
  level: 42,
  xp: 8500,
  xpToNextLevel: 10000,
  apCoins: 125000,
  isVerified: true,
  isPremium: true,
  createdAt: '2024-01-15T10:00:00Z',
  lastLoginAt: '2024-12-20T15:30:00Z',
  followersCount: 1234,
  followingCount: 89,
  stats: {
    totalPredictions: 156,
    correctPredictions: 98,
    accuracy: 62.8,
    totalEarnings: 450000,
    totalLosses: 120000,
    netProfit: 330000,
    scenariosCreated: 12,
    scenariosWon: 8,
    stealsSuccessful: 45,
    stealsReceived: 23,
    currentStreak: 7,
    bestStreak: 15,
    rank: 127,
    percentile: 99,
  },
  customization: {
    avatarFrame: 'golden',
    profileTheme: 'purple',
    entryEffect: 'flames',
  },
  badges: [
    {
      id: '1',
      name: 'Fundador',
      description: 'Usuario desde el lanzamiento',
      icon: '🏆',
      rarity: 'LEGENDARY',
      unlockedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Verificado',
      description: 'Identidad verificada',
      icon: '✓',
      rarity: 'RARE',
      unlockedAt: '2024-02-01T10:00:00Z',
    },
    {
      id: '3',
      name: 'Top 1%',
      description: 'Entre el 1% mejor de profetas',
      icon: '👑',
      rarity: 'LEGENDARY',
      unlockedAt: '2024-06-15T10:00:00Z',
    },
    {
      id: '4',
      name: 'Premium',
      description: 'Suscriptor Premium',
      icon: '⭐',
      rarity: 'EPIC',
      unlockedAt: '2024-03-01T10:00:00Z',
    },
  ],
  activeTitle: 'Profeta Supremo',
  socialLinks: {
    twitter: 'prophet_master',
    discord: 'prophet#1234',
  },
};

const mockAchievements: UserAchievement[] = [
  {
    id: '1',
    name: 'Primera Predicción',
    description: 'Realiza tu primera predicción',
    icon: '🎯',
    rarity: 'COMMON',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2024-01-15T12:00:00Z',
    rewardCoins: 100,
    rewardXp: 50,
  },
  {
    id: '2',
    name: 'Profeta Novato',
    description: 'Acierta 10 predicciones',
    icon: '🔮',
    rarity: 'COMMON',
    progress: 10,
    maxProgress: 10,
    isUnlocked: true,
    unlockedAt: '2024-01-20T14:00:00Z',
    rewardCoins: 500,
    rewardXp: 200,
  },
  {
    id: '3',
    name: 'Vidente Experto',
    description: 'Acierta 50 predicciones',
    icon: '👁️',
    rarity: 'RARE',
    progress: 50,
    maxProgress: 50,
    isUnlocked: true,
    unlockedAt: '2024-03-15T16:00:00Z',
    rewardCoins: 2000,
    rewardXp: 1000,
  },
  {
    id: '4',
    name: 'Oráculo Maestro',
    description: 'Acierta 100 predicciones',
    icon: '🌟',
    rarity: 'EPIC',
    progress: 98,
    maxProgress: 100,
    isUnlocked: false,
    unlockedAt: null,
    rewardCoins: 5000,
    rewardXp: 2500,
  },
  {
    id: '5',
    name: 'Ladrón Maestro',
    description: 'Roba 50 escenarios',
    icon: '🦹',
    rarity: 'RARE',
    progress: 45,
    maxProgress: 50,
    isUnlocked: false,
    unlockedAt: null,
    rewardCoins: 2000,
    rewardXp: 1000,
  },
  {
    id: '6',
    name: 'Racha de Fuego',
    description: 'Mantén una racha de 10 aciertos',
    icon: '🔥',
    rarity: 'EPIC',
    progress: 15,
    maxProgress: 10,
    isUnlocked: true,
    unlockedAt: '2024-05-20T10:00:00Z',
    rewardCoins: 3000,
    rewardXp: 1500,
  },
  {
    id: '7',
    name: 'Millonario',
    description: 'Acumula 1,000,000 AP Coins',
    icon: '💰',
    rarity: 'LEGENDARY',
    progress: 450000,
    maxProgress: 1000000,
    isUnlocked: false,
    unlockedAt: null,
    rewardCoins: 10000,
    rewardXp: 5000,
  },
  {
    id: '8',
    name: 'Creador de Mundos',
    description: 'Crea 10 escenarios',
    icon: '🌍',
    rarity: 'RARE',
    progress: 12,
    maxProgress: 10,
    isUnlocked: true,
    unlockedAt: '2024-04-10T08:00:00Z',
    rewardCoins: 1500,
    rewardXp: 750,
  },
];

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    itemId: 'shield-1',
    name: 'Escudo de Protección',
    description: 'Protege tu escenario por 24h',
    type: 'PROTECTION',
    rarity: 'COMMON',
    quantity: 3,
    isEquipped: false,
    purchasedAt: '2024-12-15T10:00:00Z',
    expiresAt: null,
  },
  {
    id: '2',
    itemId: 'mult-2',
    name: 'Multiplicador x2',
    description: 'Duplica ganancias',
    type: 'BOOST',
    rarity: 'RARE',
    quantity: 2,
    isEquipped: false,
    purchasedAt: '2024-12-18T14:00:00Z',
    expiresAt: null,
  },
  {
    id: '3',
    itemId: 'frame-gold',
    name: 'Marco Dorado',
    description: 'Marco elegante para tu avatar',
    type: 'COSMETIC',
    rarity: 'RARE',
    quantity: 1,
    isEquipped: true,
    purchasedAt: '2024-11-01T10:00:00Z',
    expiresAt: null,
  },
  {
    id: '4',
    itemId: 'title-supreme',
    name: 'Título: Profeta Supremo',
    description: 'Título exclusivo',
    type: 'COSMETIC',
    rarity: 'LEGENDARY',
    quantity: 1,
    isEquipped: true,
    purchasedAt: '2024-10-15T10:00:00Z',
    expiresAt: null,
  },
  {
    id: '5',
    itemId: 'vision-1',
    name: 'Visión del Oráculo',
    description: 'Revela estadísticas ocultas',
    type: 'POWER',
    rarity: 'RARE',
    quantity: 5,
    isEquipped: false,
    purchasedAt: '2024-12-20T08:00:00Z',
    expiresAt: null,
  },
];

const mockHistory: PredictionHistory[] = [
  {
    id: '1',
    scenarioId: 's1',
    scenarioTitle: 'Bitcoin superará los $150,000 antes de Marzo 2025',
    scenarioCategory: 'ECONOMIA',
    prediction: 'UP',
    amount: 5000,
    result: 'PENDING',
    profit: 0,
    createdAt: '2024-12-20T10:00:00Z',
    resolvedAt: null,
  },
  {
    id: '2',
    scenarioId: 's2',
    scenarioTitle: 'Apple lanzará gafas AR en 2024',
    scenarioCategory: 'TECNOLOGIA',
    prediction: 'DOWN',
    amount: 2000,
    result: 'WON',
    profit: 3500,
    createdAt: '2024-12-01T14:00:00Z',
    resolvedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: '3',
    scenarioId: 's3',
    scenarioTitle: 'El Real Madrid ganará La Liga 2024',
    scenarioCategory: 'DEPORTES',
    prediction: 'UP',
    amount: 3000,
    result: 'WON',
    profit: 4200,
    createdAt: '2024-11-15T16:00:00Z',
    resolvedAt: '2024-12-10T20:00:00Z',
  },
  {
    id: '4',
    scenarioId: 's4',
    scenarioTitle: 'Nuevo récord de temperatura global en 2024',
    scenarioCategory: 'CIENCIA',
    prediction: 'UP',
    amount: 1500,
    result: 'LOST',
    profit: -1500,
    createdAt: '2024-11-01T12:00:00Z',
    resolvedAt: '2024-11-30T18:00:00Z',
  },
  {
    id: '5',
    scenarioId: 's5',
    scenarioTitle: 'Tesla Cybertruck superará 100k ventas',
    scenarioCategory: 'ECONOMIA',
    prediction: 'DOWN',
    amount: 4000,
    result: 'WON',
    profit: 6800,
    createdAt: '2024-10-20T09:00:00Z',
    resolvedAt: '2024-11-25T14:00:00Z',
  },
];

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'PREDICTION',
    title: 'Nueva predicción',
    description: 'Apostaste 5,000 AP en "Bitcoin $150k"',
    icon: '🎯',
    timestamp: '2024-12-20T10:00:00Z',
  },
  {
    id: '2',
    type: 'ACHIEVEMENT',
    title: '¡Logro desbloqueado!',
    description: 'Racha de Fuego - 15 aciertos seguidos',
    icon: '🔥',
    timestamp: '2024-12-19T16:00:00Z',
  },
  {
    id: '3',
    type: 'PURCHASE',
    title: 'Compra en tienda',
    description: 'Compraste 5x Visión del Oráculo',
    icon: '🛒',
    timestamp: '2024-12-19T14:00:00Z',
  },
  {
    id: '4',
    type: 'LEVEL_UP',
    title: '¡Subiste de nivel!',
    description: 'Ahora eres nivel 42',
    icon: '⬆️',
    timestamp: '2024-12-18T20:00:00Z',
  },
  {
    id: '5',
    type: 'STEAL',
    title: 'Robo exitoso',
    description: 'Robaste "Champions 2025" a @dark_oracle',
    icon: '🦹',
    timestamp: '2024-12-18T15:00:00Z',
  },
  {
    id: '6',
    type: 'STOLEN',
    title: 'Te robaron',
    description: '@ninja_trader robó "ETF Bitcoin" de ti',
    icon: '😱',
    timestamp: '2024-12-17T11:00:00Z',
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface ProfileStore {
  // State
  currentProfile: UserProfile | null;
  viewingProfile: UserProfile | null;
  achievements: UserAchievement[];
  inventory: InventoryItem[];
  history: PredictionHistory[];
  activity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  
  // Tab state
  activeTab: 'overview' | 'inventory' | 'history' | 'achievements' | 'activity';
  
  // Actions - Profile
  setCurrentProfile: (profile: UserProfile) => void;
  setViewingProfile: (profile: UserProfile | null) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  
  // Actions - Data
  setAchievements: (achievements: UserAchievement[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setHistory: (history: PredictionHistory[]) => void;
  setActivity: (activity: ActivityItem[]) => void;
  
  // Actions - Inventory
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  
  // Actions - Social
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  
  // Actions - UI
  setActiveTab: (tab: ProfileStore['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Load
  loadProfile: (username?: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadInventory: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadActivity: () => Promise<void>;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial State
  currentProfile: mockProfile,
  viewingProfile: null,
  achievements: mockAchievements,
  inventory: mockInventory,
  history: mockHistory,
  activity: mockActivity,
  isLoading: false,
  error: null,
  activeTab: 'overview',

  // Profile
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  setViewingProfile: (profile) => set({ viewingProfile: profile }),
  
  updateProfile: (data) => {
    set((state) => ({
      currentProfile: state.currentProfile
        ? { ...state.currentProfile, ...data }
        : null,
    }));
  },

  // Data
  setAchievements: (achievements) => set({ achievements }),
  setInventory: (inventory) => set({ inventory }),
  setHistory: (history) => set({ history }),
  setActivity: (activity) => set({ activity }),

  // Inventory
  equipItem: (itemId) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId ? { ...item, isEquipped: true } : item
      ),
    }));
  },
  
  unequipItem: (itemId) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId ? { ...item, isEquipped: false } : item
      ),
    }));
  },
  
  useItem: (itemId) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      ).filter((item) => item.quantity > 0),
    }));
  },

  // Social
  followUser: (userId) => {
    set((state) => ({
      viewingProfile: state.viewingProfile
        ? {
            ...state.viewingProfile,
            isFollowing: true,
            followersCount: state.viewingProfile.followersCount + 1,
          }
        : null,
    }));
  },
  
  unfollowUser: (userId) => {
    set((state) => ({
      viewingProfile: state.viewingProfile
        ? {
            ...state.viewingProfile,
            isFollowing: false,
            followersCount: state.viewingProfile.followersCount - 1,
          }
        : null,
    }));
  },

  // UI
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Load
  loadProfile: async (username) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 500));
      if (username && username !== mockProfile.username) {
        // Simular perfil de otro usuario
        set({
          viewingProfile: {
            ...mockProfile,
            id: '2',
            username: username,
            displayName: `@${username}`,
            isFollowing: false,
            apCoins: 0, // No mostrar coins de otros
          },
          isLoading: false,
        });
      } else {
        set({ viewingProfile: null, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Error al cargar perfil', isLoading: false });
    }
  },
  
  loadAchievements: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 300));
    set({ achievements: mockAchievements, isLoading: false });
  },
  
  loadInventory: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 300));
    set({ inventory: mockInventory, isLoading: false });
  },
  
  loadHistory: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 300));
    set({ history: mockHistory, isLoading: false });
  },
  
  loadActivity: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 300));
    set({ activity: mockActivity, isLoading: false });
  },
}));