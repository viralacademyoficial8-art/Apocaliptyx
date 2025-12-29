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
  MessageSquare, // 👈 Foro
  ShoppingBag,   // 👈 Ítems NUEVO
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { href: '/admin/escenarios', label: 'Escenarios', icon: FileText },
      { href: '/admin/reportes', label: 'Reportes', icon: AlertTriangle, badge: 23 },
      { href: '/admin/anuncios', label: 'Anuncios', icon: Bell },
      { href: '/admin/promociones', label: 'Promociones', icon: Tag },
      { href: '/admin/foro', label: 'Foro', icon: MessageSquare }, // Foro
      { href: '/admin/items', label: 'Ítems', icon: ShoppingBag },  // 👈 NUEVO ENLACE
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { href: '/admin/transacciones', label: 'Transacciones', icon: CreditCard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
      { href: '/admin/logs', label: 'Logs', icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
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

      <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100%-8rem)]">
        {menuItems.map((section) => (
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
                          : 'text-muted-foreground hover:bg-muted',
                        collapsed && 'justify-center',
                      )}
                    >
                      <Icon className="w-5 h-5" />
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

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3 border-t border-border',
          collapsed && 'flex justify-center',
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted',
            collapsed && 'justify-center',
          )}
        >
          <Skull className="w-5 h-5" />
          {!collapsed && <span>Volver a Apocaliptics</span>}
        </Link>
      </div>
    </aside>
  );
}
