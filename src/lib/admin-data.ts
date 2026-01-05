// src/lib/admin-data.ts
// Solo tipos e interfaces + funciones helper para el Admin Panel
// Los datos reales se obtienen de adminStore y las APIs

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
// Helpers de colores y estados
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
// ANUNCIOS
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
// PROMO CODES
// ============================================

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed_discount' | 'free_coins' | 'bonus_multiplier';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  status: 'active' | 'inactive' | 'expired' | 'depleted';
  validFrom: string;
  validUntil: string;
  applicableTo: 'all' | 'first_purchase' | 'ap_coins' | 'items' | 'premium';
  createdBy: string;
  createdAt: string;
  usedBy: { userId: string; username: string; usedAt: string; amount: number }[];
}

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
// FORO
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
// SHOP ITEMS
// ============================================

export interface ShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  price: number;
  originalPrice?: number;
  currency: 'AP' | 'USD';
  category: 'protection' | 'power' | 'cosmetic' | 'boost' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
  duration?: number;
  usageLimit?: number;
  cooldown?: number;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  stock?: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

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
