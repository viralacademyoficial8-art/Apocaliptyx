// src/components/NotificationCenter.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { useAuthStore } from '@/lib/stores';
import { notificationsService, type Notification, type NotificationType } from '@/services/notifications.service';
import toast from 'react-hot-toast';
import {
  Bell,
  BellRing,
  Trophy,
  UserPlus,
  Gift,
  ShoppingBag,
  Target,
  Star,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  X,
  Loader2,
  Swords,
  Shield,
  Calendar,
  TrendingUp,
  Flame,
  BadgeCheck,
  Crown,
  FileText,
  Clock,
  Vote,
  Package,
  Sparkles,
  Send,
  Coins,
  Ticket,
  Medal,
  BarChart3,
  Zap,
  MessageCircle,
  Heart,
  AtSign,
  Reply,
  Megaphone,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Video,
  Radio,
  SmilePlus,
  Palette,
  Users,
  Gamepad2,
  ClipboardCheck
} from 'lucide-react';

// Función para formato de tiempo relativo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `Hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `Hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
}

// Configuración de iconos y colores por tipo (40+ tipos)
const notificationConfig: Record<NotificationType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  // Usuario
  welcome: { icon: Gift, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  new_follower: { icon: UserPlus, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  daily_login: { icon: Calendar, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  login_streak: { icon: Flame, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  level_up: { icon: TrendingUp, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  account_verified: { icon: BadgeCheck, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  premium_activated: { icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },

  // Escenarios
  scenario_created: { icon: FileText, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  scenario_stolen: { icon: Swords, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  scenario_recovered: { icon: Shield, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  prediction_won: { icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  prediction_lost: { icon: Target, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  scenario_resolved: { icon: Check, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  scenario_expiring: { icon: Clock, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  scenario_vote: { icon: Vote, color: 'text-violet-400', bgColor: 'bg-violet-500/20' },

  // Tienda
  purchase: { icon: ShoppingBag, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  item_used: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  gift_received: { icon: Gift, color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  coins_received: { icon: Coins, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  promo_code: { icon: Ticket, color: 'text-lime-400', bgColor: 'bg-lime-500/20' },

  // Logros
  achievement_unlocked: { icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  medal_earned: { icon: Medal, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  ranking_position: { icon: BarChart3, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  win_streak: { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },

  // Social
  comment_received: { icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  like_received: { icon: Heart, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  mention: { icon: AtSign, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  comment_reply: { icon: Reply, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },

  // Comunidades
  community_post: { icon: FileText, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  community_like: { icon: Heart, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  community_comment: { icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  community_reply: { icon: Reply, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },

  // Reels y Streaming
  reel_like: { icon: Video, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  stream_like: { icon: Radio, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  stream_started: { icon: Radio, color: 'text-red-400', bgColor: 'bg-red-500/20' },

  // Chat
  message_received: { icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  message_reaction: { icon: SmilePlus, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },

  // Coleccionables
  collectible_purchased: { icon: Palette, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/20' },

  // Comunidades extra
  community_new_member: { icon: Users, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  community_join_request: { icon: UserPlus, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  community_request_approved: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  community_request_rejected: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  community_ownership_transferred: { icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },

  // Torneos
  tournament_joined: { icon: Gamepad2, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  tournament_registration: { icon: ClipboardCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },

  // Sistema
  system_announcement: { icon: Megaphone, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  maintenance: { icon: Wrench, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  account_warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  account_restored: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

export function NotificationCenter() {
  const supabase = getSupabaseBrowser();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshBalance } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Determinar autenticación desde NextAuth
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Cargar datos del usuario si no están en Zustand
  useEffect(() => {
    if (isAuthenticated && !user?.id) {
      refreshBalance();
    }
  }, [isAuthenticated, user?.id, refreshBalance]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationsService.getByUserId(user.id, 20);
      setNotifications(data);
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await notificationsService.countUnread(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [user?.id]);

  // Cargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotifications();
    }
  }, [isOpen, user?.id, loadNotifications]);

  // Cargar contador de no leídas al montar y suscribirse a realtime
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUnreadCount();

      // Setup real-time subscription for new notifications
      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New notification received:', payload);
            const newNotification = payload.new as Notification;

            // Add to notifications list if panel is open
            setNotifications(prev => [newNotification, ...prev].slice(0, 20));

            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast(newNotification.title, {
              icon: '🔔',
              style: { background: '#1f2937', color: '#fff' },
              duration: 4000,
            });
          }
        )
        .subscribe((status) => {
          console.log('Notification subscription status:', status);
        });

      // Fallback: Actualizar cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user?.id, loadUnreadCount]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;
    
    const success = await notificationsService.markAsRead(notification.id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    
    setMarkingAll(true);
    const success = await notificationsService.markAllAsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
    setMarkingAll(false);
  };

  const handleDelete = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    const success = await notificationsService.delete(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);
    if (notification.link_url) {
      router.push(notification.link_url);
      setIsOpen(false);
    }
  };

  // No mostrar si no está autenticado
  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'bg-purple-500/20 text-purple-400' 
            : 'hover:bg-gray-800 text-gray-400 hover:text-white'
        }`}
        aria-label="Notificaciones"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Badge contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Marcar todas como leídas"
                >
                  {markingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {notifications.map((notification) => {
                  const config = notificationConfig[notification.type] || notificationConfig.system_announcement;
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`relative group px-4 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-purple-500/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icono */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>

                        {/* Indicador no leído */}
                        {!notification.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        )}
                      </div>

                      {/* Botón eliminar (visible en hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="absolute right-2 top-2 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/95">
              <button
                onClick={() => {
                  router.push('/notificaciones');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-purple-400 hover:text-purple-300 py-1"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}