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
  Notification, // 👈 usamos directamente el tipo Notification del dominio
} from "@/types";
import {
  mockScenarios,
  mockForumPosts,
  mockForumComments,
} from "@/lib/mock-data";
import { safeGetItem, safeSetItem } from "@/lib/utils";

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
    }),
    {
      name: "apocaliptics-auth",
      // opcional: si quieres mantener el store más limpio
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
// Usamos Notification del dominio:
// { id, type, title, message, relatedUserId?, relatedScenarioId?, read, createdAt }

interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: () => {
    const now = new Date();

    const mock: Notification[] = [
      {
        id: "1",
        type: "comment",
        title: "Nuevo comentario en tu escenario",
        message: "Un profeta dejó un comentario en tu predicción.",
        relatedScenarioId: "scenario_1",
        relatedUserId: "user_2",
        read: false,
        createdAt: now,
      },
      {
        id: "2",
        type: "new_follower",
        title: "Nuevo seguidor",
        message: "Un profeta empezó a seguirte.",
        relatedUserId: "user_3",
        read: true,
        createdAt: now,
      },
    ];

    set({
      notifications: mock,
      unreadCount: mock.filter((n) => !n.read).length,
    });
  },

  markAsRead: (id) => {
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

  markAllAsRead: () => {
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

  deleteNotification: (id) => {
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
  scenarios: mockScenarios,
  isLoading: false,
  error: null,

  async fetchScenarios() {
    set({ isLoading: true, error: null });

    try {
      // Simulación de llamada a API
      await new Promise((r) => setTimeout(r, 400));

      set({
        scenarios: mockScenarios,
        isLoading: false,
      });
    } catch (e) {
      set({
        error: "Error al cargar escenarios",
        isLoading: false,
      });
    }
  },

  async createScenario({ title, description, category, dueDate }) {
    const { user } = useAuthStore.getState();

    const newScenario: Scenario = {
      id: `scenario_${Date.now()}`,
      title,
      description,
      category,
      createdBy: user?.username ?? "anónimo",
      createdAt: new Date().toISOString(),
      dueDate,
      status: "active",
      pot: 20,
    } as Scenario;

    const current = get().scenarios;
    const updated = [newScenario, ...current];

    set({ scenarios: updated });

    // Guardar en localStorage de forma segura
    try {
      const raw = safeGetItem("scenarios");
      let stored: Scenario[] = [];

      if (raw) stored = JSON.parse(raw) as Scenario[];

      stored.unshift(newScenario);
      safeSetItem("scenarios", stored);
    } catch {
      console.warn("No se pudo guardar escenarios");
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
    // Aquí luego conectamos monedas, inventario, etc.
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

  fetchPosts: () => void;
  fetchComments: (postId: string) => void;
  createPost: (data: CreatePostInput) => Promise<void>;
  createComment: (data: CreateCommentInput) => Promise<void>;
  toggleLikePost: (postId: string) => void;
  toggleLikeComment: (commentId: string) => void;
  deletePost: (postId: string) => void;
  deleteComment: (commentId: string) => void;
  setFilter: (filter: "recientes" | "populares" | "siguiendo") => void;
  setSelectedTag: (tag: string | null) => void;
}

export const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  comments: [],
  isLoading: false,
  filter: "recientes",
  selectedTag: null,

  fetchPosts: () => {
    set({ isLoading: true });

    setTimeout(() => {
      let posts: ForumPost[];

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("forumPosts");
        posts = saved ? JSON.parse(saved) : mockForumPosts;
      } else {
        posts = mockForumPosts;
      }

      posts = posts.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      const { filter } = get();

      if (filter === "recientes" || filter === "siguiendo") {
        posts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (filter === "populares") {
        posts.sort((a, b) => b.likes.length - a.likes.length);
      }

      set({ posts, isLoading: false });
    }, 300);
  },

  fetchComments: (postId: string) => {
    let comments: ForumComment[];

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("forumComments");
      comments = saved ? JSON.parse(saved) : mockForumComments;
    } else {
      comments = mockForumComments;
    }

    comments = comments
      .filter((c) => c.postId === postId)
      .map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    set({ comments });
  },

  createPost: async (data: CreatePostInput) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Debes iniciar sesión");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
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

    const posts = [newPost, ...get().posts];
    set({ posts });

    if (typeof window !== "undefined") {
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }
  },

  createComment: async (data: CreateCommentInput) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Debes iniciar sesión");

    await new Promise((resolve) => setTimeout(resolve, 300));

    const newComment: ForumComment = {
      id: `comment_${Date.now()}`,
      postId: data.postId,
      authorId: user.id,
      authorUsername: user.username,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatarUrl,
      authorLevel: user.prophetLevel,
      content: data.content,
      likes: [],
      createdAt: new Date(),
      parentCommentId: data.parentCommentId,
    };

    let comments: ForumComment[];

    if (typeof window !== "undefined") {
      const allComments = localStorage.getItem("forumComments");
      comments = allComments ? JSON.parse(allComments) : mockForumComments;
      comments = [...comments, newComment];
      localStorage.setItem("forumComments", JSON.stringify(comments));
    } else {
      comments = [...mockForumComments, newComment];
    }

    const posts = get().posts.map((p) =>
      p.id === data.postId
        ? { ...p, commentsCount: p.commentsCount + 1 }
        : p
    );

    set({ posts });
    if (typeof window !== "undefined") {
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }

    get().fetchComments(data.postId);
  },

  toggleLikePost: (postId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const posts = get().posts.map((post) => {
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
    });

    set({ posts });
    if (typeof window !== "undefined") {
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }
  },

  toggleLikeComment: (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    let comments: ForumComment[];

    if (typeof window !== "undefined") {
      const allComments = localStorage.getItem("forumComments");
      comments = allComments ? JSON.parse(allComments) : mockForumComments;
    } else {
      comments = mockForumComments;
    }

    comments = comments.map((comment) => {
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
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("forumComments", JSON.stringify(comments));
    }

    const currentComments = get().comments;
    if (currentComments.length > 0) {
      get().fetchComments(currentComments[0].postId);
    }
  },

  deletePost: (postId: string) => {
    const { user } = useAuthStore.getState();
    const post = get().posts.find((p) => p.id === postId);

    if (!post || post.authorId !== user?.id) return;

    const posts = get().posts.filter((p) => p.id !== postId);
    set({ posts });

    if (typeof window !== "undefined") {
      localStorage.setItem("forumPosts", JSON.stringify(posts));

      const allComments = localStorage.getItem("forumComments");
      let comments = allComments ? JSON.parse(allComments) : [];
      comments = comments.filter((c: ForumComment) => c.postId !== postId);
      localStorage.setItem("forumComments", JSON.stringify(comments));
    }
  },

  deleteComment: (commentId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    if (typeof window === "undefined") return;

    const allComments = localStorage.getItem("forumComments");
    let comments: ForumComment[] = allComments ? JSON.parse(allComments) : [];

    const comment = comments.find((c) => c.id === commentId);
    if (!comment || comment.authorId !== user.id) return;

    comments = comments.filter((c) => c.id !== commentId);
    localStorage.setItem("forumComments", JSON.stringify(comments));

    const posts = get().posts.map((p) =>
      p.id === comment.postId
        ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
        : p
    );
    set({ posts });
    localStorage.setItem("forumPosts", JSON.stringify(posts));

    get().fetchComments(comment.postId);
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
  results: any[]; // puedes cambiar a Scenario[] si ya tienes ese tipo
  isSearching: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: (scenarios: any[]) => void; // igual, cámbialo a Scenario[] si quieres
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

        // Filtrar por query (título, descripción, usuario actual)
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

        // Filtrar por categoría
        if (filters.category !== "all") {
          results = results.filter((s: any) => s.category === filters.category);
        }

        // Filtrar por estado
        if (filters.status !== "all") {
          results = results.filter((s: any) => s.status === filters.status);
        }

        // Filtrar por rango de precio
        results = results.filter(
          (s: any) =>
            s.currentPrice >= filters.priceRange.min &&
            s.currentPrice <= filters.priceRange.max
        );

        // Ordenar resultados
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
