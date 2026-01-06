'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Users,
  Trophy,
  ShoppingBag,
  Gamepad2,
  Radio,
  TrendingUp,
  Settings,
  Menu,
  X,
  Sparkles,
  Crown,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  highlight?: boolean;
  requiresAuth?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: <Home className="w-6 h-6" />, label: 'Inicio', href: '/' },
  { icon: <Search className="w-6 h-6" />, label: 'Buscar', href: '/buscar' },
  { icon: <Compass className="w-6 h-6" />, label: 'Explorar', href: '/explorar' },
  { icon: <Film className="w-6 h-6" />, label: 'Reels', href: '/reels', highlight: true },
  { icon: <MessageCircle className="w-6 h-6" />, label: 'Foro', href: '/foro' },
  { icon: <Users className="w-6 h-6" />, label: 'Comunidades', href: '/comunidades' },
  { icon: <Radio className="w-6 h-6" />, label: 'En Vivo', href: '/streaming' },
];

const socialNavItems: NavItem[] = [
  { icon: <Heart className="w-6 h-6" />, label: 'Notificaciones', href: '/notificaciones', requiresAuth: true },
  { icon: <MessageCircle className="w-6 h-6" />, label: 'Mensajes', href: '/mensajes', requiresAuth: true },
];

const featureNavItems: NavItem[] = [
  { icon: <Trophy className="w-6 h-6" />, label: 'Torneos', href: '/torneos' },
  { icon: <Target className="w-6 h-6" />, label: 'Predicciones', href: '/dashboard' },
  { icon: <TrendingUp className="w-6 h-6" />, label: 'Leaderboard', href: '/leaderboard' },
  { icon: <ShoppingBag className="w-6 h-6" />, label: 'Tienda', href: '/tienda' },
  { icon: <Sparkles className="w-6 h-6" />, label: 'Coleccionables', href: '/coleccionables' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [messages, setMessages] = useState(0);

  // Load notification counts
  useEffect(() => {
    if (isAuthenticated) {
      loadNotificationCounts();
    }
  }, [isAuthenticated]);

  const loadNotificationCounts = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const data = await response.json();
      setNotifications(data.count || 0);
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    if (item.requiresAuth && !isAuthenticated) return null;

    const active = isActive(item.href);
    const badge = item.label === 'Notificaciones' ? notifications : item.label === 'Mensajes' ? messages : item.badge;

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative',
          active
            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
          item.highlight && !active && 'text-pink-400'
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <div className={cn(
          'relative',
          active && 'text-purple-400'
        )}>
          {item.icon}
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span className={cn(
          'font-medium whitespace-nowrap transition-opacity duration-200',
          isExpanded ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100',
          'hidden lg:block'
        )}>
          {item.label}
        </span>
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-gray-950/95 backdrop-blur-md border-r border-gray-800/50 z-40',
          'flex flex-col py-6 transition-all duration-300',
          isExpanded ? 'w-64' : 'w-20',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className={cn(
            'font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',
            'transition-opacity duration-200',
            isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-0'
          )}>
            Apocaliptyx
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {/* Main */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-800/50" />

          {/* Social */}
          {isAuthenticated && (
            <>
              <div className="space-y-1">
                {socialNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
              <div className="my-4 border-t border-gray-800/50" />
            </>
          )}

          {/* Features */}
          <div className={cn(
            'transition-opacity duration-200',
            isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-50'
          )}>
            {(isExpanded || isMobileOpen) && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Funciones
              </p>
            )}
            <div className="space-y-1">
              {featureNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        </nav>

        {/* Create Button */}
        {isAuthenticated && (
          <div className="px-3 mt-4">
            <Link
              href="/crear"
              className={cn(
                'flex items-center justify-center gap-3 py-3 rounded-xl',
                'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
                'text-white font-medium transition-all duration-200',
                isExpanded || isMobileOpen ? 'px-4' : 'px-3'
              )}
            >
              <PlusSquare className="w-5 h-5" />
              {(isExpanded || isMobileOpen) && <span>Crear</span>}
            </Link>
          </div>
        )}

        {/* User Profile / Settings */}
        <div className="px-3 mt-4 pt-4 border-t border-gray-800/50">
          {isAuthenticated && user ? (
            <Link
              href="/perfil"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {(user.username || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              {(isExpanded || isMobileOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-gray-500 text-xs truncate">@{user.username}</p>
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                'flex items-center justify-center gap-3 py-3 rounded-xl',
                'border border-gray-700 hover:border-purple-500 hover:bg-purple-500/10',
                'text-gray-300 hover:text-white font-medium transition-all duration-200'
              )}
            >
              {(isExpanded || isMobileOpen) ? 'Iniciar Sesión' : <Crown className="w-5 h-5" />}
            </Link>
          )}

          {/* Settings */}
          <Link
            href="/configuracion"
            className="flex items-center gap-3 px-3 py-2 mt-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {(isExpanded || isMobileOpen) && <span className="text-sm">Configuración</span>}
          </Link>
        </div>
      </aside>

      {/* Spacer for content */}
      <div className="hidden lg:block w-20 flex-shrink-0" />
    </>
  );
}

export default Sidebar;
