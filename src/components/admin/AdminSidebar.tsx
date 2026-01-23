'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  CreditCard,
  Settings,
  ScrollText,
  Shield,
  ChevronLeft,
  ChevronRight,
  Skull,
  Bell,
  Tag,
  MessageSquare,
  ShoppingBag,
  Trophy,
  Store,
  LucideIcon,
  Target,
  Sparkles,
  Award,
  Medal,
  Users2,
  Flame,
  Send,
  MessageCircle,
  Film,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/roles';

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  permission?: Permission; // Permiso requerido para ver este item
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Menú completo con permisos requeridos
const allMenuItems: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'admin.dashboard' },
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users, permission: 'admin.users.view' },
      { href: '/admin/escenarios', label: 'Escenarios', icon: FileText, permission: 'admin.scenarios.view' },
      { href: '/admin/reportes', label: 'Reportes', icon: AlertTriangle, permission: 'admin.reports.view' },
      { href: '/admin/foro', label: 'Foro', icon: MessageSquare, permission: 'admin.scenarios.view' },
      // COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
      // { href: '/admin/comunidades', label: 'Comunidades', icon: Users2, permission: 'admin.scenarios.view' },
    ],
  },
  {
    title: 'Tienda & Items',
    items: [
      { href: '/admin/tienda', label: 'Tienda', icon: Store, permission: 'admin.shop.view' },
      { href: '/admin/promociones', label: 'Promociones', icon: Tag, permission: 'admin.shop.edit' },
      { href: '/admin/coleccionables', label: 'Coleccionables', icon: Sparkles, permission: 'admin.shop.edit' },
    ],
  },
  {
    title: 'Gamificación',
    items: [
      { href: '/admin/logros', label: 'Logros', icon: Trophy, permission: 'admin.shop.edit' },
      { href: '/admin/misiones', label: 'Misiones', icon: Target, permission: 'admin.shop.edit' },
      { href: '/admin/titulos', label: 'Títulos', icon: Award, permission: 'admin.shop.edit' },
      { href: '/admin/rangos', label: 'Rangos', icon: Shield, permission: 'admin.shop.edit' },
      { href: '/admin/torneos', label: 'Torneos', icon: Medal, permission: 'admin.shop.edit' },
      { href: '/admin/streaks', label: 'Rachas', icon: Flame, permission: 'admin.users.view' },
      { href: '/admin/leaderboards', label: 'Leaderboards', icon: BarChart3, permission: 'admin.analytics.view' },
    ],
  },
  {
    title: 'Moderación',
    items: [
      { href: '/admin/chat', label: 'Chat', icon: MessageCircle, permission: 'admin.scenarios.view' },
      { href: '/admin/contenido', label: 'Contenido', icon: Film, permission: 'admin.scenarios.view' },
    ],
  },
  {
    title: 'Comunicación',
    items: [
      { href: '/admin/anuncios', label: 'Anuncios', icon: Bell, permission: 'admin.notifications.send' },
      { href: '/admin/notificaciones', label: 'Notificaciones', icon: Send, permission: 'admin.notifications.send' },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, permission: 'admin.notifications.send' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { href: '/admin/transacciones', label: 'Transacciones', icon: CreditCard, permission: 'admin.analytics.view' },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'admin.analytics.view' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings, permission: 'admin.settings.view' },
      { href: '/admin/logs', label: 'Logs', icon: ScrollText, permission: 'admin.logs.view' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { can, role, roleName, roleIcon, roleColor, isAdmin } = usePermissions();

  // Filtrar menú según permisos del usuario
  const filteredMenuItems = allMenuItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Si no requiere permiso, mostrar siempre
        if (!item.permission) return true;
        // Si requiere permiso, verificar
        return can(item.permission);
      }),
    }))
    .filter((section) => section.items.length > 0); // Eliminar secciones vacías

  // Si no es admin, no mostrar nada
  if (!isAdmin) {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        )}
        {collapsed && <Shield className="w-6 h-6 text-red-500" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-muted rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Badge de rol */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            roleColor.bg
          )}>
            <span className="text-lg">{roleIcon}</span>
            <div>
              <p className={cn('text-sm font-medium', roleColor.text)}>{roleName}</p>
              <p className="text-xs text-muted-foreground">Rol activo</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100%-12rem)]">
        {filteredMenuItems.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3 border-t border-border',
          collapsed && 'flex justify-center',
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Volver a Apocaliptyx' : undefined}
        >
          <Skull className="w-5 h-5" />
          {!collapsed && <span>Volver a Apocaliptyx</span>}
        </Link>
      </div>
    </aside>
  );
}