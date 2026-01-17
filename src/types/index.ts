// src/types/index.ts

// =========================
// Roles de Usuario
// =========================

export type UserRole = 'USER' | 'STAFF' | 'MODERATOR' | 'SUPER_ADMIN' | 'ADMIN';

// =========================
// Niveles de Profeta
// =========================

export type ProphetLevel = 'monividente' | 'oraculo' | 'vidente' | 'nostradamus';

export const PROPHET_LEVELS: Record<
  ProphetLevel,
  { name: string; color: string; minScore: number; maxScore: number }
> = {
  monividente: {
    name: 'Mony Vidente',
    color: 'text-gray-300',
    minScore: 0,
    maxScore: 999,
  },
  oraculo: {
    name: 'Oráculo en Entrenamiento',
    color: 'text-blue-400',
    minScore: 1000,
    maxScore: 4999,
  },
  vidente: {
    name: 'Vidente Legendario',
    color: 'text-purple-400',
    minScore: 5000,
    maxScore: 14999,
  },
  nostradamus: {
    name: 'Nostradamus Supremo',
    color: 'text-yellow-400',
    minScore: 15000,
    maxScore: 999999,
  },
};

// =========================
// Usuario
// =========================

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  prophetLevel: ProphetLevel;
  reputationScore: number;
  apCoins: number;
  scenariosCreated: number;
  scenariosWon: number;
  winRate: number;
  followers: number;
  following: number;
  createdAt: Date;
  // Nuevo campo de rol
  role?: UserRole;
}

// =========================
// Escenarios
// =========================

export type ScenarioCategory =
  | 'tecnologia'
  | 'politica'
  | 'deportes'
  | 'farandula'
  | 'guerra'
  | 'economia'
  | 'salud'
  | 'otros';

export type ScenarioStatus =
  | 'active'
  | 'locked'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Scenario {
  id: string;

  // 🔹 Datos básicos que SÍ usamos ya
  title: string;
  description: string;
  category: ScenarioCategory;
  dueDate: string;      // string ISO (compatible con store)
  status: ScenarioStatus;
  createdAt: string;    // string ISO (compatible con store)

  // 🔹 Info del creador (opcional por ahora)
  creatorId?: string;
  creatorUsername?: string;
  creatorAvatar?: string;

  // 🔹 Quién lo tiene actualmente (opcional)
  currentHolderId?: string;
  currentHolderUsername?: string;

  // 🔹 Economía del escenario (opcional por ahora)
  creationCost?: number;
  currentPrice?: number;
  totalPot?: number;

  // 🔹 Seguridad / protección (opcional)
  lockUntil?: Date | null;
  isProtected?: boolean;
  protectionUntil?: Date | null;

  // 🔹 Metadatos avanzados (opcionales)
  updatedAt?: Date;
  transferCount?: number;
  votes?: {
    yes: number;
    no: number;
  };

  // 🔹 Compatibilidad con el código antiguo del store
  createdBy?: string;   // lo usamos en newScenario
  pot?: number;         // lo usamos como pot: 20
}

// =========================
// Ítems e Inventario
// =========================

export type ItemType = 'candado' | 'reloj_arena' | 'escudo';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  priceApCoins: number;
  durationHours?: number;
  icon: string;
}

export interface UserItem {
  id: string;
  itemId: string;
  item: Item;
  quantity: number;
  expiresAt: Date | null;
}

// =========================
// Notificaciones
// =========================

export type NotificationType =
  | 'scenario_stolen'
  | 'scenario_won'
  | 'scenario_lost'
  | 'scenario_completed'
  | 'new_follower'
  | 'comment'
  | 'mention'
  | 'community_join_request'
  | 'community_request_approved'
  | 'community_request_rejected'
  | 'community_new_member'
  | 'community_ownership_transferred'
  | 'community_post';

/**
 * Tipo único de notificación en toda la app
 * Campo canónico: `read`
 * Campo `isRead` solo para compatibilidad con código viejo.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedUserId?: string;
  relatedScenarioId?: string;

  /** true = ya leída, false = pendiente */
  read: boolean;

  /** compatibilidad con código viejo (opcional) */
  isRead?: boolean;

  createdAt: Date;
}

/** Alias por si en algún lado se usó AppNotification */
export type AppNotification = Notification;

// =========================
// Inputs / DTOs
// =========================

export interface CreateScenarioInput {
  title: string;
  description: string;
  category: ScenarioCategory;
  dueDate: Date;
}

// ============================================
// TIPOS PARA EL FORO/COMUNIDAD
// ============================================

export interface ForumPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  authorLevel: ProphetLevel;
  content: string;
  linkedScenarioId?: string;
  linkedScenario?: Scenario;
  likes: string[]; // Array de userIds que dieron like
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  authorLevel: ProphetLevel;
  content: string;
  likes: string[];
  createdAt: Date;
  parentCommentId?: string; // Para respuestas a comentarios
}

export interface CreatePostInput {
  content: string;
  linkedScenarioId?: string;
  tags?: string[];
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export const FORUM_TAGS = [
  {
    id: 'prediccion',
    label: '🔮 Predicción',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'debate',
    label: '💬 Debate',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'analisis',
    label: '📊 Análisis',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    id: 'noticia',
    label: '📰 Noticia',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    id: 'estrategia',
    label: '🎯 Estrategia',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    id: 'humor',
    label: '😂 Humor',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
];

// ============================================
// TIPOS PARA HISTORIAL DE ESCENARIOS
// ============================================

export interface ScenarioTransfer {
  id: string;
  scenarioId: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar: string;
  toUserId: string;
  toUsername: string;
  toAvatar: string;
  price: number;
  timestamp: Date;
  type: 'creation' | 'steal' | 'recovery';
}

export interface ScenarioComment {
  id: string;
  scenarioId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  authorLevel: ProphetLevel;
  content: string;
  likes: string[];
  createdAt: Date;
}