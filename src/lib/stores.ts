"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Scenario,
  ScenarioCategory,
  User,
  ForumPost,
  ForumComment,
  CreatePostInput,
  CreateCommentInput,
  Notification,
} from "@/types";
import { notificationsService } from "@/services/notifications.service";
import { scenariosService, ScenarioFromDB } from "@/services/scenarios.service";
import { forumService } from "@/services/forum.service";

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
    }),
    {
      name: "apocaliptics-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


//
// ----------------------------------------------------
// 2) NOTIFICATION STORE
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
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });

    try {
      const data = await notificationsService.getByUserId(user.id);
      const notifications: Notification[] = data.map((n: any) => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        message: n.message,
        relatedScenarioId: n.link_url?.includes('escenario') ? n.link_url.split('/').pop() : undefined,
        relatedUserId: undefined,
        read: n.is_read,
        createdAt: new Date(n.created_at),
      }));

      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
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
    if (!user) return;

    await notificationsService.markAllAsRead(user.id);

    set((state) => {
      const updated = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));

      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
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

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));

//
// ----------------------------------------------------
// 3) SCENARIO STORE
// ----------------------------------------------------
//

// Helper para convertir ScenarioFromDB a Scenario
function mapDBToScenario(s: ScenarioFromDB): Scenario {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category as ScenarioCategory,
    status: s.status.toLowerCase() as any,
    createdAt: s.created_at,
    dueDate: s.resolution_date,
    totalPot: s.total_pool,
    currentPrice: s.min_bet,
    creationCost: s.min_bet,
    votes: {
      yes: s.yes_pool,
      no: s.no_pool,
    },
    creatorId: s.creator_id,
    creatorUsername: '',
    creatorAvatar: '',
    currentHolderId: s.creator_id,
    currentHolderUsername: '',
    lockUntil: null,
    isProtected: false,
    protectionUntil: null,
    updatedAt: new Date(s.updated_at),
    transferCount: 0,
  } as Scenario;
}

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
      const scenarios = data.map(mapDBToScenario);

      set({
        scenarios,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error fetching scenarios:', e);
      set({
        error: "Error al cargar escenarios",
        isLoading: false,
      });
    }
  },

  async createScenario({ title, description, category, dueDate }) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Debes iniciar sesión");

    try {
      const created = await scenariosService.create({
        title,
        description,
        category,
        resolutionDate: dueDate,
        creatorId: user.id,
      });

      if (created) {
        const newScenario = mapDBToScenario(created);
        const current = get().scenarios;
        set({ scenarios: [newScenario, ...current] });

        await notificationsService.notifyScenarioCreated(
          user.id,
          title,
          created.id
        );
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  },
}));

//
// ----------------------------------------------------
// 4) ITEM STORE (tienda)
// ----------------------------------------------------
//

interface ItemStoreState {
  items: any[];
  buyItem: (item: any) => Promise<void>;
}

export const useItemStore = create<ItemStoreState>(() => ({
  items: [],

  async buyItem(item: any) {
    console.log("buyItem llamado con:", item);
  },
}));

//
// ----------------------------------------------------
// 5) FORUM STORE - Foro y Comunidad
// ----------------------------------------------------
//

interface ForumState {
  posts: ForumPost[];
  comments: ForumComment[];
  isLoading: boolean;
  filter: "recientes" | "populares" | "siguiendo";
  selectedTag: string | null;

  fetchPosts: () => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createPost: (data: CreatePostInput) => Promise<void>;
  createComment: (data: CreateCommentInput) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleLikeComment: (commentId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  setFilter: (filter: "recientes" | "populares" | "siguiendo") => void;
  setSelectedTag: (tag: string | null) => void;
}

export const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  comments: [],
  isLoading: false,
  filter: "recientes",
  selectedTag: null,

  fetchPosts: async () => {
    set({ isLoading: true });

    try {
      const { filter, selectedTag } = get();

      const sortBy = filter === 'populares' ? 'popular' : 'recent';
      const data = await forumService.getPosts({
        limit: 50,
        sortBy,
        tag: selectedTag || undefined,
      });

      const posts: ForumPost[] = data.map((p: any) => ({
        id: p.id,
        authorId: p.author_id,
        authorUsername: p.author?.username || 'unknown',
        authorDisplayName: p.author?.display_name || 'Unknown',
        authorAvatar: p.author?.avatar_url || '',
        authorLevel: (p.author?.level || 'monividente') as any,
        content: p.content,
        linkedScenarioId: undefined,
        likes: [],
        commentsCount: p.comments_count || 0,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        tags: p.tags || [],
      }));

      set({ posts, isLoading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ isLoading: false });
    }
  },

  fetchComments: async (postId: string) => {
    try {
      const data = await forumService.getComments(postId);

      const comments: ForumComment[] = data.map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        authorId: c.author_id,
        authorUsername: c.author?.username || 'unknown',
        authorDisplayName: c.author?.display_name || 'Unknown',
        authorAvatar: c.author?.avatar_url || '',
        authorLevel: (c.author?.level || 'monividente') as any,
        content: c.content,
        likes: [],
        createdAt: new Date(c.created_at),
        parentCommentId: c.parent_id || undefined,
      }));

      set({ comments });
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  },

  createPost: async (data: CreatePostInput) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Debes iniciar sesión");

    try {
      const created = await forumService.createPost(user.id, {
        content: data.content,
        tags: data.tags,
      });

      if (created) {
        const newPost: ForumPost = {
          id: created.id,
          authorId: user.id,
          authorUsername: user.username,
          authorDisplayName: user.displayName,
          authorAvatar: user.avatarUrl,
          authorLevel: user.prophetLevel,
          content: data.content,
          linkedScenarioId: data.linkedScenarioId,
          likes: [],
          commentsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: data.tags || [],
        };

        set((state) => ({ posts: [newPost, ...state.posts] }));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  createComment: async (data: CreateCommentInput) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Debes iniciar sesión");

    try {
      const created = await forumService.createComment(user.id, {
        post_id: data.postId,
        content: data.content,
        parent_id: data.parentCommentId,
      });

      if (created) {
        // Refresh comments
        get().fetchComments(data.postId);

        // Update comments count in posts
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === data.postId
              ? { ...p, commentsCount: p.commentsCount + 1 }
              : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  toggleLikePost: async (postId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      await forumService.toggleLikePost(postId, user.id);

      set((state) => ({
        posts: state.posts.map((post) => {
          if (post.id === postId) {
            const hasLiked = post.likes.includes(user.id);
            return {
              ...post,
              likes: hasLiked
                ? post.likes.filter((id) => id !== user.id)
                : [...post.likes, user.id],
            };
          }
          return post;
        }),
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },

  toggleLikeComment: async (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      await forumService.toggleLikeComment(commentId, user.id);

      set((state) => ({
        comments: state.comments.map((comment) => {
          if (comment.id === commentId) {
            const hasLiked = comment.likes.includes(user.id);
            return {
              ...comment,
              likes: hasLiked
                ? comment.likes.filter((id) => id !== user.id)
                : [...comment.likes, user.id],
            };
          }
          return comment;
        }),
      }));
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  },

  deletePost: async (postId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const success = await forumService.deletePost(postId, user.id);
      if (success) {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        }));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  },

  deleteComment: async (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const comment = get().comments.find((c) => c.id === commentId);
      const success = await forumService.deleteComment(commentId, user.id);

      if (success && comment) {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId),
          posts: state.posts.map((p) =>
            p.id === comment.postId
              ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
              : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().fetchPosts();
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag });
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
      name: "apocaliptics-search",
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);
