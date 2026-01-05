// src/stores/profileStore.ts

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  level: number;
  xp: number;
  xpToNextLevel: number;
  apCoins?: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  
  // Social
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  
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
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Actions - Data
  setAchievements: (achievements: UserAchievement[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setHistory: (history: PredictionHistory[]) => void;
  setActivity: (activity: ActivityItem[]) => void;
  
  // Actions - Inventory
  equipItem: (itemId: string) => Promise<void>;
  unequipItem: (itemId: string) => Promise<void>;
  useItem: (itemId: string) => Promise<void>;
  
  // Actions - Social
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  
  // Actions - UI
  setActiveTab: (tab: ProfileStore['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Load (now async with real APIs)
  loadProfile: (username: string) => Promise<void>;
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
  currentProfile: null,
  viewingProfile: null,
  achievements: [],
  inventory: [],
  history: [],
  activity: [],
  isLoading: false,
  error: null,
  activeTab: 'overview',

  // Profile
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  setViewingProfile: (profile) => set({ viewingProfile: profile }),
  
  updateProfile: async (data) => {
    const { currentProfile } = get();
    if (!currentProfile) return;

    try {
      const res = await fetch(`/api/profile/${currentProfile.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      set({
        currentProfile: { ...currentProfile, ...data },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: 'Error al actualizar perfil' });
    }
  },

  // Data
  setAchievements: (achievements) => set({ achievements }),
  setInventory: (inventory) => set({ inventory }),
  setHistory: (history) => set({ history }),
  setActivity: (activity) => set({ activity }),

  // Inventory
  equipItem: async (itemId) => {
    try {
      const res = await fetch('/api/profile/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action: 'equip' }),
      });

      if (!res.ok) throw new Error('Failed to equip item');

      set((state) => ({
        inventory: state.inventory.map((item) =>
          item.id === itemId ? { ...item, isEquipped: true } : item
        ),
      }));
    } catch (error) {
      console.error('Error equipping item:', error);
      set({ error: 'Error al equipar item' });
    }
  },
  
  unequipItem: async (itemId) => {
    try {
      const res = await fetch('/api/profile/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action: 'unequip' }),
      });

      if (!res.ok) throw new Error('Failed to unequip item');

      set((state) => ({
        inventory: state.inventory.map((item) =>
          item.id === itemId ? { ...item, isEquipped: false } : item
        ),
      }));
    } catch (error) {
      console.error('Error unequipping item:', error);
      set({ error: 'Error al desequipar item' });
    }
  },
  
  useItem: async (itemId) => {
    try {
      const res = await fetch('/api/profile/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action: 'use' }),
      });

      if (!res.ok) throw new Error('Failed to use item');

      set((state) => ({
        inventory: state.inventory
          .map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.max(0, item.quantity - 1) }
              : item
          )
          .filter((item) => item.quantity > 0),
      }));
    } catch (error) {
      console.error('Error using item:', error);
      set({ error: 'Error al usar item' });
    }
  },

  // Social
  followUser: async (userId) => {
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to follow user');

      set((state) => ({
        viewingProfile: state.viewingProfile
          ? {
              ...state.viewingProfile,
              isFollowing: true,
              followersCount: state.viewingProfile.followersCount + 1,
            }
          : null,
      }));
    } catch (error) {
      console.error('Error following user:', error);
      set({ error: 'Error al seguir usuario' });
    }
  },
  
  unfollowUser: async (userId) => {
    try {
      const res = await fetch('/api/users/follow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to unfollow user');

      set((state) => ({
        viewingProfile: state.viewingProfile
          ? {
              ...state.viewingProfile,
              isFollowing: false,
              followersCount: state.viewingProfile.followersCount - 1,
            }
          : null,
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      set({ error: 'Error al dejar de seguir usuario' });
    }
  },

  // UI
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Load - Real API calls
  loadProfile: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) throw new Error('Failed to load profile');
      
      const profile = await res.json();
      
      // Determine if this is current user or viewing another profile
      const { currentProfile } = get();
      if (currentProfile?.username === username) {
        set({ currentProfile: profile, viewingProfile: null, isLoading: false });
      } else {
        set({ viewingProfile: profile, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ error: 'Error al cargar perfil', isLoading: false });
    }
  },
  
  loadAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/profile/achievements');
      if (!res.ok) throw new Error('Failed to load achievements');
      
      const achievements = await res.json();
      set({ achievements, isLoading: false });
    } catch (error) {
      console.error('Error loading achievements:', error);
      set({ error: 'Error al cargar logros', isLoading: false });
    }
  },
  
  loadInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/profile/inventory');
      if (!res.ok) throw new Error('Failed to load inventory');
      
      const inventory = await res.json();
      set({ inventory, isLoading: false });
    } catch (error) {
      console.error('Error loading inventory:', error);
      set({ error: 'Error al cargar inventario', isLoading: false });
    }
  },
  
  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/profile/history');
      if (!res.ok) throw new Error('Failed to load history');
      
      const history = await res.json();
      set({ history, isLoading: false });
    } catch (error) {
      console.error('Error loading history:', error);
      set({ error: 'Error al cargar historial', isLoading: false });
    }
  },
  
  loadActivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/profile/activity');
      if (!res.ok) throw new Error('Failed to load activity');
      
      const activity = await res.json();
      set({ activity, isLoading: false });
    } catch (error) {
      console.error('Error loading activity:', error);
      set({ error: 'Error al cargar actividad', isLoading: false });
    }
  },
}));
