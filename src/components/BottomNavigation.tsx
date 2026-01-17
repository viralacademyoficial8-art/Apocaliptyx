'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { useEffect, useState, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import {
  Home,
  Search,
  PlusSquare,
  Bell,
  User,
  Compass,
  MessageCircle,
  Trophy,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  requiresAuth?: boolean;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { status } = useSession();
  const { user } = useAuthStore();
  const isAuthenticated = status === 'authenticated';
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Cargar contadores
  const loadCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const notifCount = await notificationsService.countUnread(user.id);
      setUnreadNotifications(notifCount);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCounts();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, loadCounts]);

  // Definir items de navegación
  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Inicio',
    },
    {
      href: '/explorar',
      icon: Compass,
      label: 'Explorar',
    },
    {
      href: '/crear',
      icon: PlusSquare,
      label: 'Crear',
      requiresAuth: true,
    },
    {
      href: '/notificaciones',
      icon: Bell,
      label: 'Alertas',
      badge: unreadNotifications,
      requiresAuth: true,
    },
    {
      href: '/perfil',
      icon: User,
      label: 'Perfil',
      requiresAuth: true,
    },
  ];

  // No mostrar si no está autenticado (mostrar versión simplificada)
  const displayItems = isAuthenticated
    ? navItems
    : navItems.filter(item => !item.requiresAuth);

  // No mostrar en ciertas rutas (login, registro, admin, etc.)
  const hiddenRoutes = ['/login', '/registro', '/admin', '/auth'];
  const shouldHide = hiddenRoutes.some(route => pathname?.startsWith(route));

  if (shouldHide) return null;

  return (
    <>
      {/* Spacer para evitar que el contenido quede detrás del nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation - Solo visible en móvil y tablets pequeñas */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const hasBadge = item.badge !== undefined && item.badge > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {/* Indicador activo */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-b-full" />
                )}

                {/* Icono con badge */}
                <div className="relative">
                  <Icon
                    className="w-6 h-6"
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Badge de notificaciones - solo si hay más de 0 */}
                  {hasBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {item.badge! > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-purple-400' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
