// src/hooks/usePermissions.ts

'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import {
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageRole,
  isAdminRole,
  hasInfiniteCoins,
  hasFreeShop,
  ROLE_PERMISSIONS,
  ROLE_NAMES,
  ROLE_COLORS,
  ROLE_ICONS,
  ROLE_HIERARCHY,
} from '@/types/roles';

export function usePermissions() {
  const { user } = useAuthStore();
  const { data: session } = useSession();

  const role: UserRole = useMemo(() => {
    // Obtener roles de ambas fuentes
    const zustandRole = user?.role as UserRole | undefined;
    const sessionRole = session?.user?.role as UserRole | undefined;

    // Prioridad:
    // 1) Si la session tiene un rol admin, usarlo (viene del login más reciente)
    // 2) Si Zustand tiene un rol admin, usarlo (puede venir de /api/me)
    // 3) Cualquier rol que tengamos
    // 4) Default a USER

    // Verificar si es un rol de admin
    const isAdminSessionRole = sessionRole && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'STAFF'].includes(sessionRole);
    const isAdminZustandRole = zustandRole && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'STAFF'].includes(zustandRole);

    if (isAdminSessionRole) {
      return sessionRole;
    }
    if (isAdminZustandRole) {
      return zustandRole;
    }

    // Si ninguno es admin, usar el que tengamos
    return sessionRole || zustandRole || 'USER';
  }, [user?.role, session?.user?.role]);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  return {
    // Datos del rol
    role,
    roleName: ROLE_NAMES[role],
    roleColor: ROLE_COLORS[role],
    roleIcon: ROLE_ICONS[role],
    roleHierarchy: ROLE_HIERARCHY[role],
    permissions,

    // Verificaciones de permisos
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (perms: Permission[]) => hasAnyPermission(role, perms),
    canAll: (perms: Permission[]) => hasAllPermissions(role, perms),
    
    // Verificaciones de rol
    isAdmin: isAdminRole(role),
    isSuperAdmin: role === 'SUPER_ADMIN',
    isStaff: role === 'STAFF',
    isModerator: role === 'MODERATOR',
    isUser: role === 'USER',

    // Privilegios especiales
    hasInfiniteCoins: hasInfiniteCoins(role),
    hasFreeShop: hasFreeShop(role),

    // Gestión de roles
    canManageRole: (targetRole: UserRole) => canManageRole(role, targetRole),
    canAccessAdmin: hasPermission(role, 'admin.access'),
  };
}

// Hook para proteger rutas de admin
export function useAdminAccess() {
  const { can, isAdmin, role } = usePermissions();
  
  return {
    canAccess: can('admin.access'),
    canViewDashboard: can('admin.dashboard'),
    canViewUsers: can('admin.users.view'),
    canEditUsers: can('admin.users.edit'),
    canBanUsers: can('admin.users.ban'),
    canDeleteUsers: can('admin.users.delete'),
    canChangeRoles: can('admin.users.change_role'),
    canViewScenarios: can('admin.scenarios.view'),
    canEditScenarios: can('admin.scenarios.edit'),
    canDeleteScenarios: can('admin.scenarios.delete'),
    canResolveScenarios: can('admin.scenarios.resolve'),
    canViewReports: can('admin.reports.view'),
    canResolveReports: can('admin.reports.resolve'),
    canViewShop: can('admin.shop.view'),
    canEditShop: can('admin.shop.edit'),
    canCreateShopItems: can('admin.shop.create'),
    canDeleteShopItems: can('admin.shop.delete'),
    canSendNotifications: can('admin.notifications.send'),
    canViewSettings: can('admin.settings.view'),
    canEditSettings: can('admin.settings.edit'),
    canViewAnalytics: can('admin.analytics.view'),
    canViewLogs: can('admin.logs.view'),
    isAdmin,
    role,
  };
}