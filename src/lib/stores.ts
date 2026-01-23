"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Scenario,
  ScenarioCategory,
  User,
  Notification,
  ForumComment,
} from "@/types";
import { scenariosService, ScenarioFromDB } from "@/services/scenarios.service";
import { notificationsService } from "@/services/notifications.service";
import { forumService } from "@/services/forum.service";

//
// ----------------------------------------------------
// HELPER: Convert DB scenario to frontend format
// ----------------------------------------------------
//

function mapScenarioFromDB(s: ScenarioFromDB): Scenario {
  return {
    id: s.id,
    creatorId: s.creator_id,
    creatorUsername: '',
    creatorAvatar: '',
    currentHolderId: s.creator_id,
    currentHolderUsername: '',
    title: s.title,
    description: s.description,
    category: s.category.toLowerCase() as ScenarioCategory,
    dueDate: s.resolution_date,
    creationCost: s.min_bet,
    currentPrice: s.total_pool,
    totalPot: s.total_pool,
    status: s.status.toLowerCase() as any,
    lockUntil: null,
    isProtected: false,
    protectionUntil: null,
    createdAt: s.created_at,
    updatedAt: new Date(s.updated_at),
    transferCount: 0,
    votes: {
      yes: s.yes_pool,
      no: s.no_pool,
    },
  };
}

//
// ----------------------------------------------------
// 1) AUTH STORE (con persist + hydrate)
// ----------------------------------------------------
//

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateApCoins: (newBalance: number) => void;
  refreshBalance: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...data };
        set({ user: updatedUser });
      },

      updateApCoins: (newBalance) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, apCoins: newBalance };
        set({ user: updatedUser });
      },

      refreshBalance: async () => {
        try {
          const response = await fetch('/api/me', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error from /api/me:', errorData.error || response.status);
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const data = await response.json();

          if (!data || !data.id) {
            console.error('Invalid response from /api/me:', data);
            throw new Error('Invalid user data received');
          }

          const currentUser = get().user;

          if (currentUser) {
            // Actualizar usuario existente con los datos frescos de la BD
            // Incluye role, apCoins, createdAt y otros datos importantes
            set({
              user: {
                ...currentUser,
                id: data.id,
                apCoins: data.apCoins ?? currentUser.apCoins,
                role: data.role ?? currentUser.role,
                displayName: data.displayName ?? currentUser.displayName,
                avatarUrl: data.avatarUrl ?? currentUser.avatarUrl,
                username: data.username ?? currentUser.username,
                createdAt: data.createdAt ? new Date(data.createdAt) : currentUser.createdAt,
              },
              isAuthenticated: true
            });
          } else {
            // Si no hay usuario en Zustand pero la API devolvió datos, crear el usuario
            set({
              user: {
                id: data.id,
                email: data.email || '',
                username: data.username || '',
                displayName: data.displayName || data.username || '',
                avatarUrl: data.avatarUrl || '',
                prophetLevel: 'vidente',
                reputationScore: 0,
                apCoins: data.apCoins ?? 1000,
                scenariosCreated: 0,
                scenariosWon: 0,
                winRate: 0,
                followers: 0,
                following: 0,
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                role: data.role || 'USER',
              },
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Error refreshing balance:', error);
          throw error; // Re-throw to allow callers to handle the error
        }
      },
    }),
    {
      name: "apocaliptyx-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


//
// ----------------------------------------------------
// 2) NOTIFICATION STORE - Connected to Supabase
// ----------------------------------------------------
//

interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const data = await notificationsService.getByUserId(user.id, 50);
      const mapped: Notification[] = data.map((n) => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        message: n.message,
        linkUrl: n.link_url || undefined,
        link_url: n.link_url || undefined,
        relatedScenarioId: n.link_url?.includes('escenario') ? n.link_url.split('/').pop() : undefined,
        relatedUserId: undefined,
        read: n.is_read,
        isRead: n.is_read,
        createdAt: new Date(n.created_at),
      }));

      set({
        notifications: mapped,
        unreadCount: mapped.filter((n) => !n.read).length,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    await notificationsService.markAsRead(id);
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      return;
    }

    await notificationsService.markAllAsRead(user.id);
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await notificationsService.delete(id);
    set((state) => {
      const remaining = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: remaining,
        unreadCount: remaining.filter((n) => !n.read).length,
      };
    });
  },

  clearAll: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      return;
    }

    await notificationsService.deleteAll(user.id);
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));

//
// ----------------------------------------------------
// 3) SCENARIO STORE - Connected to Supabase
// ----------------------------------------------------
//

interface ScenarioStoreState {
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
  fetchScenarios: () => Promise<void>;
  createScenario: (payload: {
    title: string;
    description: string;
    category: ScenarioCategory;
    dueDate: string;
  }) => Promise<void>;
}

export const useScenarioStore = create<ScenarioStoreState>((set, get) => ({
  scenarios: [],
  isLoading: false,
  error: null,

  async fetchScenarios() {
    set({ isLoading: true, error: null });

    try {
      const data = await scenariosService.getActive();
      const mapped = data.map(mapScenarioFromDB);
      set({ scenarios: mapped, isLoading: false });
    } catch (e) {
      console.error('Error fetching scenarios:', e);
      set({ error: "Error al cargar escenarios", isLoading: false });
    }
  },

  async createScenario({ title, description, category, dueDate }) {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error("Debes iniciar sesión");

    try {
      const result = await scenariosService.create({
        title,
        description,
        category,
        resolutionDate: dueDate,
        creatorId: user.id,
      });

      if (result) {
        const newScenario = mapScenarioFromDB(result);
        set((state) => ({ scenarios: [newScenario, ...state.scenarios] }));

        await notificationsService.notifyScenarioCreated(
          user.id,
          title,
          result.id
        );
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  },
}));

/**
 * @deprecated This store is deprecated. Use useShopStore from '@/stores/shopStore' instead.
 * This export is kept for backward compatibility and will be removed in a future version.
 */
export { useShopStore as useItemStore } from '@/stores/shopStore';

//
// ----------------------------------------------------
// 5) FORUM STORE - Connected to Supabase via forumService
// ----------------------------------------------------
//

interface ForumState {
  posts: any[];
  comments: ForumComment[];
  isLoading: boolean;
  error: string | null;
  filter: "recientes" | "populares" | "siguiendo";
  selectedTag: string | null;

  fetchPosts: () => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createPost: (data: { content: string; tags?: string[]; linkedScenarioId?: string }) => Promise<void>;
  createComment: (data: { postId: string; content: string; parentCommentId?: string }) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleLikeComment: (commentId: string) => void;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => void;
  setFilter: (filter: "recientes" | "populares" | "siguiendo") => void;
  setSelectedTag: (tag: string | null) => void;
  clearError: () => void;
}

export const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  comments: [],
  isLoading: false,
  error: null,
  filter: "recientes",
  selectedTag: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filter, selectedTag } = get();
      const sortBy = filter === 'populares' ? 'popular' : 'recent';

      const data = await forumService.getPosts({
        sortBy,
        tag: selectedTag || undefined,
        limit: 50,
      });

      set({ posts: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ isLoading: false, error: 'Error al cargar publicaciones' });
    }
  },

  fetchComments: async (postId: string) => {
    set({ error: null });
    try {
      const data = await forumService.getComments(postId);
      const mapped: ForumComment[] = data.map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        authorId: c.author_id,
        authorUsername: c.author?.username || 'unknown',
        authorDisplayName: c.author?.display_name || c.author?.username || 'Unknown',
        authorAvatar: c.author?.avatar_url || '',
        authorLevel: 'monividente' as any,
        content: c.content,
        likes: [],
        createdAt: new Date(c.created_at),
        parentCommentId: c.parent_id || undefined,
      }));
      set({ comments: mapped });
    } catch (error) {
      console.error('Error fetching comments:', error);
      set({ error: 'Error al cargar comentarios' });
    }
  },

  createPost: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      set({ error: 'Debes iniciar sesión para publicar' });
      return;
    }

    set({ error: null });
    try {
      const post = await forumService.createPost(user.id, {
        content: data.content,
        tags: data.tags,
      });

      if (post) {
        set((state) => ({ posts: [post, ...state.posts] }));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      set({ error: 'Error al crear publicación' });
    }
  },

  createComment: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      set({ error: 'Debes iniciar sesión para comentar' });
      return;
    }

    set({ error: null });
    try {
      const comment = await forumService.createComment(user.id, {
        post_id: data.postId,
        content: data.content,
        parent_id: data.parentCommentId,
      });

      if (comment) {
        const mapped: ForumComment = {
          id: comment.id,
          postId: comment.post_id,
          authorId: comment.author_id,
          authorUsername: comment.author?.username || user.username,
          authorDisplayName: comment.author?.display_name || user.displayName || user.username,
          authorAvatar: comment.author?.avatar_url || user.avatarUrl || '',
          authorLevel: user.prophetLevel || 'monividente' as any,
          content: comment.content,
          likes: [],
          createdAt: new Date(comment.created_at),
          parentCommentId: comment.parent_id || undefined,
        };
        set((state) => ({ comments: [...state.comments, mapped] }));
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      set({ error: 'Error al crear comentario' });
    }
  },

  toggleLikePost: async (postId: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    try {
      const result = await forumService.toggleLikePost(postId, user.id);
      set((state) => ({
        posts: state.posts.map((p: any) =>
          p.id === postId ? { ...p, likes_count: result.likesCount } : p
        ),
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },

  toggleLikeComment: (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    set((state) => ({
      comments: state.comments.map((c) => {
        if (c.id === commentId) {
          const hasLiked = c.likes.includes(user.id);
          return {
            ...c,
            likes: hasLiked
              ? c.likes.filter((id) => id !== user.id)
              : [...c.likes, user.id],
          };
        }
        return c;
      }),
    }));

    forumService.toggleLikeComment(commentId, user.id).catch(console.error);
  },

  deletePost: async (postId: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    try {
      const success = await forumService.deletePost(postId, user.id);
      if (success) {
        set((state) => ({
          posts: state.posts.filter((p: any) => p.id !== postId),
        }));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  },

  deleteComment: (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    const { comments } = get();
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || comment.authorId !== user.id) return;

    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
    }));

    forumService.deleteComment(commentId, user.id).catch(console.error);
  },

  setFilter: (filter) => {
    set({ filter, error: null });
    get().fetchPosts();
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag });
  },

  clearError: () => {
    set({ error: null });
  },
}));

//
// ----------------------------------------------------
// SEARCH STORE
// ----------------------------------------------------
//

interface SearchFilters {
  category: string;
  status: "all" | "active" | "completed" | "failed";
  priceRange: { min: number; max: number };
  dateRange: { start: Date | null; end: Date | null };
  sortBy: "recent" | "popular" | "price_asc" | "price_desc" | "ending_soon";
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: any[];
  isSearching: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: (scenarios: any[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const defaultFilters: SearchFilters = {
  category: "all",
  status: "all",
  priceRange: { min: 0, max: 10000 },
  dateRange: { start: null, end: null },
  sortBy: "recent",
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: "",
      filters: defaultFilters,
      results: [],
      isSearching: false,
      recentSearches: [],

      setQuery: (query) => set({ query }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      search: (scenarios) => {
        const { query, filters } = get();
        set({ isSearching: true });

        let results = [...scenarios];

        if (query.trim()) {
          const lowerQuery = query.toLowerCase().trim();
          results = results.filter((s: any) => {
            const title = s.title?.toLowerCase?.() ?? "";
            const description = s.description?.toLowerCase?.() ?? "";
            const username =
              s.currentHolder?.username?.toLowerCase?.() ?? "";
            return (
              title.includes(lowerQuery) ||
              description.includes(lowerQuery) ||
              username.includes(lowerQuery)
            );
          });
        }

        if (filters.category !== "all") {
          results = results.filter((s: any) => s.category === filters.category);
        }

        if (filters.status !== "all") {
          results = results.filter((s: any) => s.status === filters.status);
        }

        results = results.filter(
          (s: any) =>
            s.currentPrice >= filters.priceRange.min &&
            s.currentPrice <= filters.priceRange.max
        );

        switch (filters.sortBy) {
          case "recent":
            results.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
            break;
          case "popular":
            results.sort(
              (a: any, b: any) =>
                (b.votesUp + b.votesDown) - (a.votesUp + a.votesDown)
            );
            break;
          case "price_asc":
            results.sort((a: any, b: any) => a.currentPrice - b.currentPrice);
            break;
          case "price_desc":
            results.sort((a: any, b: any) => b.currentPrice - a.currentPrice);
            break;
          case "ending_soon":
            results.sort(
              (a: any, b: any) =>
                new Date(a.deadline).getTime() -
                new Date(b.deadline).getTime()
            );
            break;
        }

        set({ results, isSearching: false });
      },

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query);
          return {
            recentSearches: [query, ...filtered].slice(0, 5),
          };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "apocaliptyx-search",
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);
