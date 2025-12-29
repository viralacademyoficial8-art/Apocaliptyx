// src/lib/admin-data.ts

// ===============================
// Tipos base para Admin Panel
// ===============================

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  prophetLevel: string;
  apCoins: number;
  scenariosCreated: number;
  scenariosWon: number;
  winRate: number;
  totalSpent: number;
  totalEarned: number;
  registeredAt: string;
  lastActiveAt: string;
  reports: number;
  warnings: number;
}

export interface AdminScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'rejected';
  creatorId: string;
  creatorUsername: string;
  currentHolderId: string;
  currentHolderUsername: string;
  currentPrice: number;
  totalPool: number;
  totalTransfers: number;
  votesUp: number;
  votesDown: number;
  reports: number;
  createdAt: string;
  deadline: string;
}

export interface AdminReport {
  id: string;
  type: 'scenario' | 'user' | 'comment' | 'post';
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  reporterId: string;
  reporterUsername: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  action?: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  username?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalScenarios: number;
  activeScenarios: number;
  completedScenarios: number;
  totalTransactions: number;
  totalVolume: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  pendingReports: number;
  avgSessionTime: string;
  retentionRate: number;
}

// ===============================
// Mock Data - Estadísticas
// ===============================

export const mockPlatformStats: PlatformStats = {
  totalUsers: 15847,
  activeUsers: 3421,
  newUsersToday: 127,
  newUsersThisWeek: 892,
  totalScenarios: 4523,
  activeScenarios: 1876,
  completedScenarios: 2341,
  totalTransactions: 89432,
  totalVolume: 2456780,
  revenueToday: 12450,
  revenueThisWeek: 89320,
  revenueThisMonth: 345600,
  pendingReports: 23,
  avgSessionTime: '14m 32s',
  retentionRate: 68.5,
};

// ===============================
// Mock Data - Usuarios
// ===============================

export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    username: 'cryptooracle',
    displayName: 'Crypto Oracle',
    email: 'crypto@example.com',
    role: 'user',
    status: 'active',
    prophetLevel: 'Nostradamus Supremo',
    apCoins: 45230,
    scenariosCreated: 89,
    scenariosWon: 67,
    winRate: 75.3,
    totalSpent: 125000,
    totalEarned: 234500,
    registeredAt: '2024-03-15T10:30:00Z',
    lastActiveAt: '2024-12-08T14:22:00Z',
    reports: 0,
    warnings: 0,
  },
  {
    id: '2',
    username: 'techprophet',
    displayName: 'Tech Prophet',
    email: 'tech@example.com',
    role: 'user',
    status: 'active',
    prophetLevel: 'Vidente',
    apCoins: 12450,
    scenariosCreated: 34,
    scenariosWon: 21,
    winRate: 61.8,
    totalSpent: 45000,
    totalEarned: 67800,
    registeredAt: '2024-05-22T08:15:00Z',
    lastActiveAt: '2024-12-08T12:45:00Z',
    reports: 1,
    warnings: 0,
  },
  {
    id: '3',
    username: 'toxicuser99',
    displayName: 'Usuario Problemático',
    email: 'toxic@example.com',
    role: 'user',
    status: 'suspended',
    prophetLevel: 'Monividente',
    apCoins: 230,
    scenariosCreated: 5,
    scenariosWon: 0,
    winRate: 0,
    totalSpent: 1500,
    totalEarned: 0,
    registeredAt: '2024-11-01T16:20:00Z',
    lastActiveAt: '2024-12-05T09:30:00Z',
    reports: 12,
    warnings: 3,
  },
  {
    id: '4',
    username: 'futbolvidente',
    displayName: 'Fútbol Vidente',
    email: 'futbol@example.com',
    role: 'moderator',
    status: 'active',
    prophetLevel: 'Oráculo',
    apCoins: 28900,
    scenariosCreated: 156,
    scenariosWon: 98,
    winRate: 62.8,
    totalSpent: 89000,
    totalEarned: 156000,
    registeredAt: '2024-01-10T11:00:00Z',
    lastActiveAt: '2024-12-08T15:10:00Z',
    reports: 0,
    warnings: 0,
  },
  {
    id: '5',
    username: 'spammer123',
    displayName: 'Spammer',
    email: 'spam@example.com',
    role: 'user',
    status: 'banned',
    prophetLevel: 'Monividente',
    apCoins: 0,
    scenariosCreated: 45,
    scenariosWon: 0,
    winRate: 0,
    totalSpent: 500,
    totalEarned: 0,
    registeredAt: '2024-10-15T14:30:00Z',
    lastActiveAt: '2024-11-20T08:00:00Z',
    reports: 34,
    warnings: 5,
  },
];

// ===============================
// Mock Data - Escenarios
// ===============================

export const mockAdminScenarios: AdminScenario[] = [
  {
    id: '1',
    title: 'Bitcoin superará los $200,000 USD antes de 2026',
    description: 'El precio de Bitcoin alcanzará los 200,000 dólares.',
    category: 'economia',
    status: 'active',
    creatorId: '1',
    creatorUsername: 'cryptooracle',
    currentHolderId: '2',
    currentHolderUsername: 'techprophet',
    currentPrice: 85,
    totalPool: 1250,
    totalTransfers: 15,
    votesUp: 892,
    votesDown: 234,
    reports: 0,
    createdAt: '2024-09-15T10:00:00Z',
    deadline: '2025-12-31T23:59:59Z',
  },
  {
    id: '2',
    title: 'Apple lanzará gafas AR antes de julio 2025',
    description: 'Apple presentará gafas de realidad aumentada.',
    category: 'tecnologia',
    status: 'active',
    creatorId: '2',
    creatorUsername: 'techprophet',
    currentHolderId: '2',
    currentHolderUsername: 'techprophet',
    currentPrice: 45,
    totalPool: 680,
    totalTransfers: 8,
    votesUp: 567,
    votesDown: 123,
    reports: 0,
    createdAt: '2024-10-01T14:30:00Z',
    deadline: '2025-06-30T23:59:59Z',
  },
  {
    id: '3',
    title: 'Escenario spam - eliminar',
    description: 'asdfasdf spam asdfasdf',
    category: 'tecnologia',
    status: 'pending',
    creatorId: '5',
    creatorUsername: 'spammer123',
    currentHolderId: '5',
    currentHolderUsername: 'spammer123',
    currentPrice: 20,
    totalPool: 20,
    totalTransfers: 0,
    votesUp: 0,
    votesDown: 45,
    reports: 23,
    createdAt: '2024-11-18T16:00:00Z',
    deadline: '2025-01-01T00:00:00Z',
  },
];

// ===============================
// Mock Data - Reportes
// ===============================

export const mockAdminReports: AdminReport[] = [
  {
    id: '1',
    type: 'scenario',
    targetId: '3',
    targetTitle: 'Escenario spam',
    reason: 'spam',
    description: 'Este escenario es spam.',
    reporterId: '1',
    reporterUsername: 'cryptooracle',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-12-08T10:30:00Z',
  },
  {
    id: '2',
    type: 'user',
    targetId: '3',
    targetTitle: 'toxicuser99',
    reason: 'harassment',
    description: 'Usuario acosando a otros.',
    reporterId: '4',
    reporterUsername: 'futbolvidente',
    status: 'reviewing',
    priority: 'high',
    createdAt: '2024-12-07T15:45:00Z',
  },
  {
    id: '3',
    type: 'comment',
    targetId: 'comment-123',
    targetTitle: 'Comentario ofensivo',
    reason: 'hate_speech',
    description: 'Lenguaje discriminatorio.',
    reporterId: '1',
    reporterUsername: 'cryptooracle',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-12-08T09:15:00Z',
  },
];

// ===============================
// Mock Data - Actividad
// ===============================

export const mockAdminActivities: AdminActivity[] = [
  {
    id: '1',
    type: 'user_registered',
    description: 'Nuevo usuario registrado',
    username: 'newprophet',
    createdAt: '2024-12-08T15:30:00Z',
  },
  {
    id: '2',
    type: 'scenario_stolen',
    description: 'Escenario robado',
    username: 'cryptooracle',
    metadata: { price: 85 },
    createdAt: '2024-12-08T15:25:00Z',
  },
  {
    id: '3',
    type: 'purchase',
    description: 'Compra de AP Coins',
    username: 'techprophet',
    metadata: { amount: 5000 },
    createdAt: '2024-12-08T15:20:00Z',
  },
  {
    id: '4',
    type: 'report_submitted',
    description: 'Nuevo reporte',
    username: 'futbolvidente',
    createdAt: '2024-12-08T15:15:00Z',
  },
  {
    id: '5',
    type: 'user_banned',
    description: 'Usuario baneado',
    username: 'spammer123',
    createdAt: '2024-12-08T14:00:00Z',
  },
];

// ===============================
// Helpers
// ===============================

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    suspended: 'bg-yellow-500/20 text-yellow-400',
    banned: 'bg-red-500/20 text-red-400',
    pending: 'bg-blue-500/20 text-blue-400',
    reviewing: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

export const getReportPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-400 border-green-500/50',
  };
  return colors[priority] || 'bg-gray-500/20 text-gray-400';
};

export const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    user_registered: '👤',
    scenario_created: '📝',
    scenario_stolen: '🔥',
    scenario_resolved: '✅',
    report_submitted: '🚨',
    user_banned: '🚫',
    purchase: '💰',
    withdrawal: '💸',
  };
  return icons[type] || '📌';
};


// ============================================
// ANUNCIOS MASIVOS
// ============================================

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promo' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target: 'all' | 'new_users' | 'active_users' | 'inactive_users' | 'premium';
  channels: ('banner' | 'notification' | 'email')[];
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  scheduledAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  stats: {
    views: number;
    clicks: number;
    dismissals: number;
  };
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: '🎉 ¡Bienvenido a Apocaliptics!',
    message:
      'Gracias por unirte a la comunidad de profetas. Crea tu primer escenario y gana 100 AP Coins gratis.',
    type: 'promo',
    priority: 'high',
    target: 'new_users',
    channels: ['banner', 'notification'],
    status: 'active',
    expiresAt: '2025-01-31T23:59:59Z',
    createdBy: 'admin',
    createdAt: '2024-12-01T10:00:00Z',
    stats: { views: 1234, clicks: 456, dismissals: 89 },
  },
  {
    id: 'ann-002',
    title: '⚠️ Mantenimiento Programado',
    message:
      'El sistema estará en mantenimiento el 15 de diciembre de 2:00 AM a 4:00 AM (hora México). Disculpa las molestias.',
    type: 'maintenance',
    priority: 'urgent',
    target: 'all',
    channels: ['banner', 'notification', 'email'],
    status: 'scheduled',
    scheduledAt: '2024-12-14T00:00:00Z',
    expiresAt: '2024-12-15T04:00:00Z',
    createdBy: 'admin',
    createdAt: '2024-12-08T15:00:00Z',
    stats: { views: 0, clicks: 0, dismissals: 0 },
  },
  {
    id: 'ann-003',
    title: '🔥 Nuevos ítems disponibles',
    message:
      'Hemos agregado 3 nuevos ítems a la tienda: Escudo Dorado, Visión Profética y Amuleto de Suerte. ¡Descúbrelos!',
    type: 'info',
    priority: 'medium',
    target: 'active_users',
    channels: ['notification'],
    status: 'active',
    expiresAt: '2024-12-20T23:59:59Z',
    createdBy: 'admin',
    createdAt: '2024-12-05T12:00:00Z',
    stats: { views: 2567, clicks: 890, dismissals: 234 },
  },
  {
    id: 'ann-004',
    title: '💰 ¡Duplica tus AP Coins!',
    message:
      'Solo este fin de semana: compra AP Coins y recibe el doble. Usa el código DOBLE2024 al comprar.',
    type: 'promo',
    priority: 'high',
    target: 'all',
    channels: ['banner', 'notification', 'email'],
    status: 'expired',
    expiresAt: '2024-12-08T23:59:59Z',
    createdBy: 'admin',
    createdAt: '2024-12-06T10:00:00Z',
    stats: { views: 8934, clicks: 2345, dismissals: 567 },
  },
  {
    id: 'ann-005',
    title: '📢 Actualización de reglas',
    message:
      'Hemos actualizado las reglas de la comunidad. Por favor revísalas en la sección de configuración.',
    type: 'warning',
    priority: 'medium',
    target: 'all',
    channels: ['notification'],
    status: 'draft',
    createdBy: 'admin',
    createdAt: '2024-12-08T16:00:00Z',
    stats: { views: 0, clicks: 0, dismissals: 0 },
  },
];

export const getAnnouncementTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    promo: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
};

export const getAnnouncementTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    promo: '🎉',
    maintenance: '🔧',
  };
  return icons[type] || '📢';
};

export const getAnnouncementStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    expired: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};


// ============================================
// PROMO CODES - AGREGAR AL FINAL DE admin-data.ts
// ============================================

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed_discount' | 'free_coins' | 'bonus_multiplier';
  value: number; // porcentaje, cantidad fija, coins gratis, o multiplicador
  minPurchase?: number; // compra mínima requerida (en AP o USD)
  maxDiscount?: number; // descuento máximo (para porcentajes)
  usageLimit: number; // 0 = ilimitado
  usageCount: number;
  perUserLimit: number; // cuántas veces puede usar cada usuario
  status: 'active' | 'inactive' | 'expired' | 'depleted';
  validFrom: string;
  validUntil: string;
  applicableTo: 'all' | 'first_purchase' | 'ap_coins' | 'items' | 'premium';
  createdBy: string;
  createdAt: string;
  usedBy: { userId: string; username: string; usedAt: string; amount: number }[];
}

export const mockPromoCodes: PromoCode[] = [
  {
    id: 'promo-001',
    code: 'BIENVENIDO2024',
    description: 'Código de bienvenida para nuevos usuarios',
    type: 'free_coins',
    value: 100,
    usageLimit: 0,
    usageCount: 1547,
    perUserLimit: 1,
    status: 'active',
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    applicableTo: 'first_purchase',
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    usedBy: [
      { userId: '1', username: 'cryptooracle', usedAt: '2024-03-15T10:30:00Z', amount: 100 },
      { userId: '2', username: 'techprophet', usedAt: '2024-05-22T08:15:00Z', amount: 100 },
    ],
  },
  {
    id: 'promo-002',
    code: 'DOBLE2024',
    description: 'Duplica tu compra de AP Coins',
    type: 'bonus_multiplier',
    value: 2,
    minPurchase: 1000,
    usageLimit: 500,
    usageCount: 234,
    perUserLimit: 1,
    status: 'active',
    validFrom: '2024-12-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    applicableTo: 'ap_coins',
    createdBy: 'admin',
    createdAt: '2024-12-01T00:00:00Z',
    usedBy: [],
  },
  {
    id: 'promo-003',
    code: 'NAVIDAD50',
    description: '50% de descuento en compra de AP Coins',
    type: 'percentage',
    value: 50,
    minPurchase: 500,
    maxDiscount: 250,
    usageLimit: 1000,
    usageCount: 876,
    perUserLimit: 2,
    status: 'active',
    validFrom: '2024-12-15T00:00:00Z',
    validUntil: '2024-12-25T23:59:59Z',
    applicableTo: 'ap_coins',
    createdBy: 'admin',
    createdAt: '2024-12-10T00:00:00Z',
    usedBy: [],
  },
  {
    id: 'promo-004',
    code: 'ITEMS20',
    description: '$20 de descuento en ítems',
    type: 'fixed_discount',
    value: 20,
    minPurchase: 50,
    usageLimit: 200,
    usageCount: 200,
    perUserLimit: 1,
    status: 'depleted',
    validFrom: '2024-11-01T00:00:00Z',
    validUntil: '2024-11-30T23:59:59Z',
    applicableTo: 'items',
    createdBy: 'admin',
    createdAt: '2024-11-01T00:00:00Z',
    usedBy: [],
  },
  {
    id: 'promo-005',
    code: 'VERANO2024',
    description: '30% de descuento de verano',
    type: 'percentage',
    value: 30,
    usageLimit: 0,
    usageCount: 3421,
    perUserLimit: 3,
    status: 'expired',
    validFrom: '2024-06-01T00:00:00Z',
    validUntil: '2024-08-31T23:59:59Z',
    applicableTo: 'all',
    createdBy: 'admin',
    createdAt: '2024-06-01T00:00:00Z',
    usedBy: [],
  },
  {
    id: 'promo-006',
    code: 'PREMIUM500',
    description: '500 AP Coins gratis para usuarios premium',
    type: 'free_coins',
    value: 500,
    usageLimit: 100,
    usageCount: 45,
    perUserLimit: 1,
    status: 'active',
    validFrom: '2024-12-01T00:00:00Z',
    validUntil: '2025-01-31T23:59:59Z',
    applicableTo: 'premium',
    createdBy: 'admin',
    createdAt: '2024-12-01T00:00:00Z',
    usedBy: [],
  },
];

export const getPromoTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    percentage: 'Porcentaje',
    fixed_discount: 'Descuento fijo',
    free_coins: 'Coins gratis',
    bonus_multiplier: 'Multiplicador',
  };
  return labels[type] || type;
};

export const getPromoTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    percentage: 'bg-blue-500/20 text-blue-400',
    fixed_discount: 'bg-green-500/20 text-green-400',
    free_coins: 'bg-yellow-500/20 text-yellow-400',
    bonus_multiplier: 'bg-purple-500/20 text-purple-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
};

export const getPromoStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    expired: 'bg-red-500/20 text-red-400',
    depleted: 'bg-orange-500/20 text-orange-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

export const formatPromoValue = (promo: PromoCode) => {
  switch (promo.type) {
    case 'percentage':
      return `${promo.value}% OFF`;
    case 'fixed_discount':
      return `$${promo.value} OFF`;
    case 'free_coins':
      return `${promo.value} AP Gratis`;
    case 'bonus_multiplier':
      return `${promo.value}x Bonus`;
    default:
      return promo.value.toString();
  }
};


// ============================================
// FORO – TIPOS Y DATOS MOCK
// ============================================

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  categoryId: string;
  categoryName: string;
  status: 'published' | 'pending' | 'hidden' | 'deleted';
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  reportsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  authorId: string;
  authorUsername: string;
  status: 'published' | 'hidden' | 'deleted';
  likes: number;
  reportsCount: number;
  createdAt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postsCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export const mockForumCategories: ForumCategory[] = [
  {
    id: 'cat-1',
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Predicciones sobre tech, startups, gadgets y el futuro digital',
    icon: '💻',
    color: 'blue',
    postsCount: 342,
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Deportes',
    slug: 'deportes',
    description: 'Predicciones deportivas, resultados y torneos',
    icon: '⚽',
    color: 'green',
    postsCount: 567,
    isActive: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Economía',
    slug: 'economia',
    description: 'Mercados, criptomonedas, inversiones y finanzas',
    icon: '📈',
    color: 'yellow',
    postsCount: 289,
    isActive: true,
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Política',
    slug: 'politica',
    description: 'Elecciones, gobierno y política internacional',
    icon: '🏛️',
    color: 'red',
    postsCount: 198,
    isActive: true,
    order: 4,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Entretenimiento',
    slug: 'entretenimiento',
    description: 'Cine, música, series, farándula y cultura pop',
    icon: '🎬',
    color: 'purple',
    postsCount: 423,
    isActive: true,
    order: 5,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Ciencia',
    slug: 'ciencia',
    description: 'Descubrimientos, espacio, medicina y avances científicos',
    icon: '🔬',
    color: 'cyan',
    postsCount: 156,
    isActive: true,
    order: 6,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-7',
    name: 'General',
    slug: 'general',
    description: 'Discusiones generales y temas variados',
    icon: '💬',
    color: 'gray',
    postsCount: 234,
    isActive: true,
    order: 7,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-8',
    name: 'Archivo',
    slug: 'archivo',
    description: 'Categoría archivada - solo lectura',
    icon: '📦',
    color: 'gray',
    postsCount: 89,
    isActive: false,
    order: 99,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockForumPosts: ForumPost[] = [
  {
    id: 'post-001',
    title: '¿Bitcoin llegará a $200k en 2025?',
    content: 'Análisis detallado de por qué creo que Bitcoin podría alcanzar los $200,000 antes de fin de año...',
    authorId: '1',
    authorUsername: 'cryptooracle',
    categoryId: 'cat-3',
    categoryName: 'Economía',
    status: 'published',
    isPinned: true,
    isLocked: false,
    views: 4523,
    likes: 234,
    commentsCount: 89,
    reportsCount: 0,
    createdAt: '2024-12-05T10:30:00Z',
    updatedAt: '2024-12-08T15:00:00Z',
  },
  {
    id: 'post-002',
    title: 'Las gafas de Apple cambiarán todo',
    content: 'Mi predicción sobre cómo las Apple Vision Pro van a revolucionar el mercado de AR/VR...',
    authorId: '2',
    authorUsername: 'techprophet',
    categoryId: 'cat-1',
    categoryName: 'Tecnología',
    status: 'published',
    isPinned: false,
    isLocked: false,
    views: 2341,
    likes: 156,
    commentsCount: 45,
    reportsCount: 0,
    createdAt: '2024-12-06T14:20:00Z',
    updatedAt: '2024-12-06T14:20:00Z',
  },
  {
    id: 'post-003',
    title: 'SPAM - Gana dinero fácil!!! 💰💰💰',
    content: 'Haz click aquí para ganar $10,000 diarios sin hacer nada...',
    authorId: '5',
    authorUsername: 'spammer123',
    categoryId: 'cat-7',
    categoryName: 'General',
    status: 'hidden',
    isPinned: false,
    isLocked: true,
    views: 45,
    likes: 0,
    commentsCount: 2,
    reportsCount: 23,
    createdAt: '2024-12-07T08:00:00Z',
    updatedAt: '2024-12-07T09:30:00Z',
  },
  {
    id: 'post-004',
    title: '¿Quién ganará el Mundial 2026?',
    content: 'Mis predicciones para el Mundial de Estados Unidos, México y Canadá...',
    authorId: '4',
    authorUsername: 'futbolvidente',
    categoryId: 'cat-2',
    categoryName: 'Deportes',
    status: 'published',
    isPinned: false,
    isLocked: false,
    views: 8923,
    likes: 567,
    commentsCount: 234,
    reportsCount: 2,
    createdAt: '2024-12-04T16:45:00Z',
    updatedAt: '2024-12-08T12:00:00Z',
  },
  {
    id: 'post-005',
    title: 'Post pendiente de revisión',
    content: 'Este post contiene contenido que necesita ser revisado por los moderadores...',
    authorId: '3',
    authorUsername: 'toxicuser99',
    categoryId: 'cat-4',
    categoryName: 'Política',
    status: 'pending',
    isPinned: false,
    isLocked: false,
    views: 0,
    likes: 0,
    commentsCount: 0,
    reportsCount: 5,
    createdAt: '2024-12-08T11:00:00Z',
    updatedAt: '2024-12-08T11:00:00Z',
  },
  {
    id: 'post-006',
    title: 'Guía para nuevos profetas',
    content: 'Todo lo que necesitas saber para empezar en Apocaliptics. Bienvenidos a la comunidad!',
    authorId: '1',
    authorUsername: 'cryptooracle',
    categoryId: 'cat-7',
    categoryName: 'General',
    status: 'published',
    isPinned: true,
    isLocked: true,
    views: 15678,
    likes: 892,
    commentsCount: 156,
    reportsCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
];

export const mockForumComments: ForumComment[] = [
  {
    id: 'comment-001',
    postId: 'post-001',
    postTitle: '¿Bitcoin llegará a $200k en 2025?',
    content: 'Totalmente de acuerdo, los indicadores técnicos apuntan a eso.',
    authorId: '2',
    authorUsername: 'techprophet',
    status: 'published',
    likes: 23,
    reportsCount: 0,
    createdAt: '2024-12-05T11:30:00Z',
  },
  {
    id: 'comment-002',
    postId: 'post-004',
    postTitle: '¿Quién ganará el Mundial 2026?',
    content: 'Argentina bicampeón, no hay duda!',
    authorId: '4',
    authorUsername: 'futbolvidente',
    status: 'published',
    likes: 45,
    reportsCount: 0,
    createdAt: '2024-12-04T17:00:00Z',
  },
  {
    id: 'comment-003',
    postId: 'post-001',
    postTitle: '¿Bitcoin llegará a $200k en 2025?',
    content: 'Este comentario contiene lenguaje inapropiado y ha sido reportado...',
    authorId: '3',
    authorUsername: 'toxicuser99',
    status: 'hidden',
    likes: 0,
    reportsCount: 8,
    createdAt: '2024-12-06T09:15:00Z',
  },
  {
    id: 'comment-004',
    postId: 'post-002',
    postTitle: 'Las gafas de Apple cambiarán todo',
    content: 'El precio sigue siendo muy alto para el consumidor promedio.',
    authorId: '1',
    authorUsername: 'cryptooracle',
    status: 'published',
    likes: 12,
    reportsCount: 0,
    createdAt: '2024-12-06T15:00:00Z',
  },
];

export const getForumPostStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    hidden: 'bg-orange-500/20 text-orange-400',
    deleted: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

export const getCategoryColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };
  return colors[color] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
};

// ============================================
// ÍTEMS DE LA TIENDA – AGREGAR AL FINAL
// ============================================

export interface ShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  price: number;
  originalPrice?: number; // para mostrar descuento
  currency: 'AP' | 'USD';
  category: 'protection' | 'power' | 'cosmetic' | 'boost' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
  duration?: number; // en horas, undefined = permanente
  usageLimit?: number; // veces que se puede usar, undefined = ilimitado
  cooldown?: number; // horas entre usos
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  stock?: number; // undefined = ilimitado
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export const mockShopItems: ShopItem[] = [
  {
    id: 'item-001',
    name: 'Candado Protector',
    slug: 'candado-protector',
    description:
      'Protege tu escenario de robos durante 48 horas. Nadie podrá quitártelo mientras esté activo. Ideal para proteger predicciones valiosas cerca de su fecha límite.',
    shortDescription: 'Protege tu escenario por 48h',
    icon: '🔒',
    price: 10,
    currency: 'AP',
    category: 'protection',
    rarity: 'common',
    effect: 'Bloquea robos por 48 horas',
    duration: 48,
    isActive: true,
    isNew: false,
    isFeatured: false,
    soldCount: 2341,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-002',
    name: 'Reloj de Arena',
    slug: 'reloj-de-arena',
    description:
      'Congela el precio de robo de tu escenario durante 60 minutos. Útil cuando detectas que alguien está intentando robarte.',
    shortDescription: 'Congela el precio por 1h',
    icon: '⏳',
    price: 50,
    currency: 'AP',
    category: 'protection',
    rarity: 'rare',
    effect: 'Congela precio de robo por 60 minutos',
    duration: 1,
    cooldown: 24,
    isActive: true,
    isNew: false,
    isFeatured: true,
    soldCount: 876,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-003',
    name: 'Escudo Divino',
    slug: 'escudo-divino',
    description:
      'Protección premium que reduce el costo de que te roben un escenario en un 50%. Dura 7 días completos.',
    shortDescription: 'Reduce costo de robo 50%',
    icon: '🛡️',
    price: 15,
    currency: 'AP',
    category: 'protection',
    rarity: 'rare',
    effect: 'Reduce costo de robo en 50% por 7 días',
    duration: 168,
    isActive: true,
    isNew: false,
    isFeatured: false,
    soldCount: 1523,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-004',
    name: 'Ojo del Profeta',
    slug: 'ojo-del-profeta',
    description:
      'Ve quién ha intentado robar tus escenarios en las últimas 24 horas. Conoce a tus competidores.',
    shortDescription: 'Ve intentos de robo',
    icon: '👁️',
    price: 25,
    currency: 'AP',
    category: 'power',
    rarity: 'epic',
    effect: 'Revela intentos de robo por 24h',
    duration: 24,
    isActive: true,
    isNew: true,
    isFeatured: true,
    soldCount: 432,
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-005',
    name: 'Multiplicador x2',
    slug: 'multiplicador-x2',
    description:
      'Duplica las recompensas de tu próximo escenario cumplido. Solo funciona una vez.',
    shortDescription: 'Duplica próxima recompensa',
    icon: '✨',
    price: 100,
    currency: 'AP',
    category: 'boost',
    rarity: 'legendary',
    effect: 'x2 en próxima recompensa',
    usageLimit: 1,
    isActive: true,
    isNew: false,
    isFeatured: true,
    soldCount: 234,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-006',
    name: 'Manto de Invisibilidad',
    slug: 'manto-invisibilidad',
    description:
      'Oculta tu nombre de la lista pública de holders durante 72 horas. Perfecto para estrategias secretas.',
    shortDescription: 'Oculta tu identidad 72h',
    icon: '👻',
    price: 75,
    currency: 'AP',
    category: 'special',
    rarity: 'epic',
    effect: 'Anonimato por 72 horas',
    duration: 72,
    isActive: true,
    isNew: true,
    isFeatured: false,
    soldCount: 156,
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-007',
    name: 'Marco Dorado',
    slug: 'marco-dorado',
    description:
      'Un marco dorado exclusivo para tu perfil. Muestra tu estatus de profeta élite.',
    shortDescription: 'Marco dorado para perfil',
    icon: '🖼️',
    price: 500,
    currency: 'AP',
    category: 'cosmetic',
    rarity: 'legendary',
    effect: 'Cosmético permanente',
    isActive: true,
    isNew: false,
    isFeatured: false,
    soldCount: 89,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-008',
    name: 'Título: El Vidente',
    slug: 'titulo-vidente',
    description:
      'Desbloquea el título exclusivo "El Vidente" para mostrar junto a tu nombre.',
    shortDescription: 'Título exclusivo',
    icon: '🏷️',
    price: 250,
    currency: 'AP',
    category: 'cosmetic',
    rarity: 'epic',
    effect: 'Título permanente',
    isActive: true,
    isNew: false,
    isFeatured: false,
    soldCount: 167,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-009',
    name: 'Robo Silencioso',
    slug: 'robo-silencioso',
    description:
      'Tu próximo robo no enviará notificación al holder anterior. Ataca sin ser detectado.',
    shortDescription: 'Robo sin notificación',
    icon: '🤫',
    price: 40,
    currency: 'AP',
    category: 'power',
    rarity: 'rare',
    effect: 'Próximo robo sin alerta',
    usageLimit: 1,
    isActive: true,
    isNew: false,
    isFeatured: false,
    soldCount: 543,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'item-010',
    name: 'Pack Inicial',
    slug: 'pack-inicial',
    description:
      'El pack perfecto para nuevos profetas. Incluye: 1 Candado, 1 Escudo y 500 AP Coins.',
    shortDescription: 'Pack para nuevos usuarios',
    icon: '📦',
    price: 4.99,
    originalPrice: 9.99,
    currency: 'USD',
    category: 'special',
    rarity: 'common',
    effect: 'Candado + Escudo + 500 AP',
    isActive: true,
    isNew: false,
    isFeatured: true,
    stock: 100,
    soldCount: 1892,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
];

export const getItemCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    protection: 'Protección',
    power: 'Poder',
    cosmetic: 'Cosmético',
    boost: 'Boost',
    special: 'Especial',
  };
  return labels[category] || category;
};

export const getItemCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    protection: 'bg-blue-500/20 text-blue-400',
    power: 'bg-red-500/20 text-red-400',
    cosmetic: 'bg-pink-500/20 text-pink-400',
    boost: 'bg-green-500/20 text-green-400',
    special: 'bg-purple-500/20 text-purple-400',
  };
  return colors[category] || 'bg-gray-500/20 text-gray-400';
};

export const getItemRarityColor = (rarity: string) => {
  const colors: Record<string, string> = {
    common: 'border-gray-500 bg-gray-500/10',
    rare: 'border-blue-500 bg-blue-500/10',
    epic: 'border-purple-500 bg-purple-500/10',
    legendary: 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/20 shadow-lg',
  };
  return colors[rarity] || 'border-gray-500 bg-gray-500/10';
};

export const getItemRarityLabel = (rarity: string) => {
  const labels: Record<string, string> = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
  };
  return labels[rarity] || rarity;
};
