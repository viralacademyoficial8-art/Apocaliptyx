// src/types/roles.ts

export type UserRole = 'USER' | 'STAFF' | 'MODERATOR' | 'SUPER_ADMIN' | 'ADMIN';

// Permisos disponibles en la plataforma
export type Permission =
  // Panel Admin
  | 'admin.access'              // Acceder al panel de admin
  | 'admin.dashboard'           // Ver dashboard de admin
  // Usuarios
  | 'admin.users.view'          // Ver lista de usuarios
  | 'admin.users.edit'          // Editar usuarios
  | 'admin.users.ban'           // Banear usuarios
  | 'admin.users.delete'        // Eliminar usuarios
  | 'admin.users.change_role'   // Cambiar roles de usuarios
  // Escenarios/Predicciones
  | 'admin.scenarios.view'      // Ver todos los escenarios
  | 'admin.scenarios.edit'      // Editar escenarios
  | 'admin.scenarios.delete'    // Eliminar escenarios
  | 'admin.scenarios.resolve'   // Resolver escenarios
  // Torneos
  | 'admin.tournaments.view'    // Ver torneos
  | 'admin.tournaments.create'  // Crear torneos
  | 'admin.tournaments.edit'    // Editar torneos
  | 'admin.tournaments.delete'  // Eliminar torneos
  // Misiones
  | 'admin.missions.view'       // Ver misiones
  | 'admin.missions.create'     // Crear misiones
  | 'admin.missions.edit'       // Editar misiones
  | 'admin.missions.delete'     // Eliminar misiones
  // Logros
  | 'admin.achievements.view'   // Ver logros
  | 'admin.achievements.create' // Crear logros
  | 'admin.achievements.edit'   // Editar logros
  | 'admin.achievements.delete' // Eliminar logros
  // Reportes
  | 'admin.reports.view'        // Ver reportes
  | 'admin.reports.resolve'     // Resolver reportes
  // Tienda
  | 'admin.shop.view'           // Ver tienda admin
  | 'admin.shop.edit'           // Editar items de tienda
  | 'admin.shop.create'         // Crear items de tienda
  | 'admin.shop.delete'         // Eliminar items de tienda
  // Moderación de contenido
  | 'admin.content.view'        // Ver contenido (posts, reels, etc)
  | 'admin.content.edit'        // Editar contenido
  | 'admin.content.delete'      // Eliminar contenido
  | 'admin.content.moderate'    // Moderar contenido
  // Forum
  | 'admin.forum.view'          // Ver foro admin
  | 'admin.forum.edit'          // Editar posts del foro
  | 'admin.forum.delete'        // Eliminar posts del foro
  | 'admin.forum.moderate'      // Moderar foro
  // Advertencias
  | 'admin.warnings.view'       // Ver advertencias
  | 'admin.warnings.create'     // Crear advertencias
  | 'admin.warnings.delete'     // Eliminar advertencias
  // Transacciones
  | 'admin.transactions.view'   // Ver transacciones
  | 'admin.transactions.create' // Crear transacciones manuales
  // Notificaciones y Anuncios
  | 'admin.notifications.send'  // Enviar notificaciones masivas
  | 'admin.announcements.view'  // Ver anuncios
  | 'admin.announcements.create'// Crear anuncios
  | 'admin.announcements.edit'  // Editar anuncios
  | 'admin.announcements.delete'// Eliminar anuncios
  // Configuración
  | 'admin.settings.view'       // Ver configuración
  | 'admin.settings.edit'       // Editar configuración
  | 'admin.analytics.view'      // Ver analytics
  | 'admin.logs.view'           // Ver logs del sistema
  // Promociones
  | 'admin.promos.view'         // Ver promociones
  | 'admin.promos.create'       // Crear promociones
  | 'admin.promos.edit'         // Editar promociones
  | 'admin.promos.delete'       // Eliminar promociones
  // Soporte
  | 'admin.support.view'        // Ver tickets de soporte
  | 'admin.support.respond'     // Responder tickets
  | 'admin.support.close'       // Cerrar tickets
  // Privilegios especiales
  | 'coins.infinite'            // AP Coins infinitas (no se descuentan)
  | 'shop.free'                 // Compras gratis
  | 'premium.free'              // Premium gratis
  | 'scenarios.unlimited'       // Crear escenarios ilimitados
  | 'bypass.limits';            // Saltarse límites de la plataforma

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Usuario normal - sin permisos de admin
  USER: [],

  // Staff - acceso limitado al panel de admin
  STAFF: [
    'admin.access',
    'admin.dashboard',
    'admin.users.view',
    'admin.scenarios.view',
    'admin.tournaments.view',
    'admin.missions.view',
    'admin.achievements.view',
    'admin.reports.view',
    'admin.reports.resolve',
    'admin.shop.view',
    'admin.content.view',
    'admin.forum.view',
    'admin.warnings.view',
    'admin.transactions.view',
    'admin.announcements.view',
    'admin.promos.view',
    'admin.support.view',
    'coins.infinite',
    'shop.free',
  ],

  // Moderador - más permisos que staff
  MODERATOR: [
    'admin.access',
    'admin.dashboard',
    'admin.users.view',
    'admin.users.edit',
    'admin.users.ban',
    'admin.scenarios.view',
    'admin.scenarios.edit',
    'admin.scenarios.resolve',
    'admin.tournaments.view',
    'admin.tournaments.edit',
    'admin.missions.view',
    'admin.missions.edit',
    'admin.achievements.view',
    'admin.achievements.edit',
    'admin.reports.view',
    'admin.reports.resolve',
    'admin.shop.view',
    'admin.content.view',
    'admin.content.edit',
    'admin.content.moderate',
    'admin.forum.view',
    'admin.forum.edit',
    'admin.forum.moderate',
    'admin.warnings.view',
    'admin.warnings.create',
    'admin.transactions.view',
    'admin.announcements.view',
    'admin.announcements.create',
    'admin.promos.view',
    'admin.promos.create',
    'admin.promos.edit',
    'admin.notifications.send',
    'admin.support.view',
    'admin.support.respond',
    'coins.infinite',
    'shop.free',
    'premium.free',
  ],

  // Super Admin - todos los permisos
  SUPER_ADMIN: [
    'admin.access',
    'admin.dashboard',
    // Usuarios
    'admin.users.view',
    'admin.users.edit',
    'admin.users.ban',
    'admin.users.delete',
    'admin.users.change_role',
    // Escenarios
    'admin.scenarios.view',
    'admin.scenarios.edit',
    'admin.scenarios.delete',
    'admin.scenarios.resolve',
    // Torneos
    'admin.tournaments.view',
    'admin.tournaments.create',
    'admin.tournaments.edit',
    'admin.tournaments.delete',
    // Misiones
    'admin.missions.view',
    'admin.missions.create',
    'admin.missions.edit',
    'admin.missions.delete',
    // Logros
    'admin.achievements.view',
    'admin.achievements.create',
    'admin.achievements.edit',
    'admin.achievements.delete',
    // Reportes
    'admin.reports.view',
    'admin.reports.resolve',
    // Tienda
    'admin.shop.view',
    'admin.shop.edit',
    'admin.shop.create',
    'admin.shop.delete',
    // Contenido
    'admin.content.view',
    'admin.content.edit',
    'admin.content.delete',
    'admin.content.moderate',
    // Forum
    'admin.forum.view',
    'admin.forum.edit',
    'admin.forum.delete',
    'admin.forum.moderate',
    // Advertencias
    'admin.warnings.view',
    'admin.warnings.create',
    'admin.warnings.delete',
    // Transacciones
    'admin.transactions.view',
    'admin.transactions.create',
    // Anuncios
    'admin.announcements.view',
    'admin.announcements.create',
    'admin.announcements.edit',
    'admin.announcements.delete',
    // Promociones
    'admin.promos.view',
    'admin.promos.create',
    'admin.promos.edit',
    'admin.promos.delete',
    // Notificaciones
    'admin.notifications.send',
    // Configuración
    'admin.settings.view',
    'admin.settings.edit',
    'admin.analytics.view',
    'admin.logs.view',
    // Soporte
    'admin.support.view',
    'admin.support.respond',
    'admin.support.close',
    // Privilegios especiales
    'coins.infinite',
    'shop.free',
    'premium.free',
    'scenarios.unlimited',
    'bypass.limits',
  ],

  // ADMIN es alias de SUPER_ADMIN (mismos permisos)
  ADMIN: [
    'admin.access',
    'admin.dashboard',
    // Usuarios
    'admin.users.view',
    'admin.users.edit',
    'admin.users.ban',
    'admin.users.delete',
    'admin.users.change_role',
    // Escenarios
    'admin.scenarios.view',
    'admin.scenarios.edit',
    'admin.scenarios.delete',
    'admin.scenarios.resolve',
    // Torneos
    'admin.tournaments.view',
    'admin.tournaments.create',
    'admin.tournaments.edit',
    'admin.tournaments.delete',
    // Misiones
    'admin.missions.view',
    'admin.missions.create',
    'admin.missions.edit',
    'admin.missions.delete',
    // Logros
    'admin.achievements.view',
    'admin.achievements.create',
    'admin.achievements.edit',
    'admin.achievements.delete',
    // Reportes
    'admin.reports.view',
    'admin.reports.resolve',
    // Tienda
    'admin.shop.view',
    'admin.shop.edit',
    'admin.shop.create',
    'admin.shop.delete',
    // Contenido
    'admin.content.view',
    'admin.content.edit',
    'admin.content.delete',
    'admin.content.moderate',
    // Forum
    'admin.forum.view',
    'admin.forum.edit',
    'admin.forum.delete',
    'admin.forum.moderate',
    // Advertencias
    'admin.warnings.view',
    'admin.warnings.create',
    'admin.warnings.delete',
    // Transacciones
    'admin.transactions.view',
    'admin.transactions.create',
    // Anuncios
    'admin.announcements.view',
    'admin.announcements.create',
    'admin.announcements.edit',
    'admin.announcements.delete',
    // Promociones
    'admin.promos.view',
    'admin.promos.create',
    'admin.promos.edit',
    'admin.promos.delete',
    // Notificaciones
    'admin.notifications.send',
    // Configuración
    'admin.settings.view',
    'admin.settings.edit',
    'admin.analytics.view',
    'admin.logs.view',
    // Soporte
    'admin.support.view',
    'admin.support.respond',
    'admin.support.close',
    // Privilegios especiales
    'coins.infinite',
    'shop.free',
    'premium.free',
    'scenarios.unlimited',
    'bypass.limits',
  ],
};

// Nombres amigables de los roles
export const ROLE_NAMES: Record<UserRole, string> = {
  USER: 'Usuario',
  STAFF: 'Staff',
  MODERATOR: 'Moderador',
  SUPER_ADMIN: 'Administrador',
  ADMIN: 'Administrador',
};

// Colores de los roles
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  USER: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500',
  },
  STAFF: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500',
  },
  MODERATOR: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500',
  },
  SUPER_ADMIN: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500',
  },
  ADMIN: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500',
  },
};

// Iconos de los roles (emoji)
export const ROLE_ICONS: Record<UserRole, string> = {
  USER: '👤',
  STAFF: '🛠️',
  MODERATOR: '🛡️',
  SUPER_ADMIN: '👑',
  ADMIN: '👑',
};

// Jerarquía de roles (mayor número = más poder)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  STAFF: 1,
  MODERATOR: 2,
  SUPER_ADMIN: 3,
  ADMIN: 3,
};

// Funciones de utilidad
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'STAFF' || role === 'MODERATOR' || role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function hasInfiniteCoins(role: UserRole): boolean {
  return hasPermission(role, 'coins.infinite');
}

export function hasFreeShop(role: UserRole): boolean {
  return hasPermission(role, 'shop.free');
}