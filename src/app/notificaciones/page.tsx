"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";
import { notificationsService, type Notification, type NotificationType } from "@/services/notifications.service";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Bell,
  BellRing,
  Trophy,
  UserPlus,
  Gift,
  ShoppingBag,
  Target,
  Star,
  Check,
  CheckCheck,
  Trash2,
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
  Sparkles,
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
  ArrowLeft,
  Video,
  Radio,
  SmilePlus,
  Palette,
  Users,
  Gamepad2,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

// Función para formato de tiempo relativo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Hace un momento";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4)
    return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12)
    return `Hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `Hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
}

// Configuración de iconos y colores por tipo (40+ tipos)
const notificationConfig: Record<
  NotificationType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  // Usuario
  welcome: { icon: Gift, color: "text-green-400", bgColor: "bg-green-500/20" },
  new_follower: { icon: UserPlus, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  daily_login: { icon: Calendar, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  login_streak: { icon: Flame, color: "text-orange-400", bgColor: "bg-orange-500/20" },
  level_up: { icon: TrendingUp, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  account_verified: { icon: BadgeCheck, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  premium_activated: { icon: Crown, color: "text-amber-400", bgColor: "bg-amber-500/20" },

  // Escenarios
  scenario_created: { icon: FileText, color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  scenario_stolen: { icon: Swords, color: "text-red-400", bgColor: "bg-red-500/20" },
  scenario_recovered: { icon: Shield, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  prediction_won: { icon: Trophy, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  prediction_lost: { icon: Target, color: "text-red-400", bgColor: "bg-red-500/20" },
  scenario_resolved: { icon: Check, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  scenario_expiring: { icon: Clock, color: "text-orange-400", bgColor: "bg-orange-500/20" },
  scenario_vote: { icon: Vote, color: "text-violet-400", bgColor: "bg-violet-500/20" },

  // Tienda
  purchase: { icon: ShoppingBag, color: "text-pink-400", bgColor: "bg-pink-500/20" },
  item_used: { icon: Sparkles, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  gift_received: { icon: Gift, color: "text-rose-400", bgColor: "bg-rose-500/20" },
  coins_received: { icon: Coins, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  promo_code: { icon: Ticket, color: "text-lime-400", bgColor: "bg-lime-500/20" },

  // Logros
  achievement_unlocked: { icon: Star, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  medal_earned: { icon: Medal, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  ranking_position: { icon: BarChart3, color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  win_streak: { icon: Zap, color: "text-orange-400", bgColor: "bg-orange-500/20" },

  // Social
  comment_received: { icon: MessageCircle, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  like_received: { icon: Heart, color: "text-red-400", bgColor: "bg-red-500/20" },
  mention: { icon: AtSign, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  comment_reply: { icon: Reply, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },

  // Comunidades
  community_post: { icon: FileText, color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  community_like: { icon: Heart, color: "text-red-400", bgColor: "bg-red-500/20" },
  community_comment: { icon: MessageCircle, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  community_reply: { icon: Reply, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },

  // Reels y Streaming
  reel_like: { icon: Video, color: "text-pink-400", bgColor: "bg-pink-500/20" },
  stream_like: { icon: Radio, color: "text-red-400", bgColor: "bg-red-500/20" },
  stream_started: { icon: Radio, color: "text-red-400", bgColor: "bg-red-500/20" },

  // Chat
  message_received: { icon: MessageCircle, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  message_reaction: { icon: SmilePlus, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },

  // Coleccionables
  collectible_purchased: { icon: Palette, color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/20" },

  // Comunidades extra
  community_new_member: { icon: Users, color: "text-green-400", bgColor: "bg-green-500/20" },
  community_join_request: { icon: UserPlus, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  community_request_approved: { icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/20" },
  community_request_rejected: { icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/20" },
  community_ownership_transferred: { icon: Crown, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },

  // Torneos
  tournament_joined: { icon: Gamepad2, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  tournament_registration: { icon: ClipboardCheck, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },

  // Sistema
  system_announcement: { icon: Megaphone, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  maintenance: { icon: Wrench, color: "text-gray-400", bgColor: "bg-gray-500/20" },
  account_warning: { icon: AlertTriangle, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  account_restored: { icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/20" },
};

type FilterType = "all" | "unread" | "read";

export default function NotificacionesPage() {
  const router = useRouter();
  const { status } = useSession();
  const { user } = useAuthStore();
  const isAuthenticated = status === "authenticated";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [hydrated, setHydrated] = useState(false);

  // Esperar hidratación
  useEffect(() => {
    setHydrated(true);
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationsService.getByUserId(user.id, 100);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    loadNotifications();
  }, [hydrated, user?.id, router, loadNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;

    const success = await notificationsService.markAsRead(notification.id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    setMarkingAll(true);
    const success = await notificationsService.markAllAsRead(user.id);
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
    setMarkingAll(false);
  };

  const handleDelete = async (notificationId: string) => {
    const success = await notificationsService.delete(notificationId);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.id) return;
    
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar todas las notificaciones?");
    if (!confirmed) return;

    // Eliminar una por una (podríamos agregar un método batch al servicio)
    for (const notification of notifications) {
      await notificationsService.delete(notification.id);
    }
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-8 max-w-3xl pb-20 md:pb-8">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
                <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
                Notificaciones
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-sm">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}
              </p>
            </div>
          </div>

          {/* Botones de acción compactos */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-[10px] sm:text-sm font-medium transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">Marcar</span> todas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-[10px] sm:text-sm font-medium transition-colors"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Eliminar</span> todas
              </button>
            )}
          </div>
        </div>

        {/* Filtros en línea */}
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Sin leer ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-colors ${
              filter === "read"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Leídas ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-500">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-30" />
              <p className="text-base sm:text-lg font-medium">No hay notificaciones</p>
              <p className="text-xs sm:text-sm text-center px-4">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : filter === "read"
                  ? "No tienes notificaciones leídas"
                  : "Cuando tengas actividad, aparecerá aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => {
                const config =
                  notificationConfig[notification.type] ||
                  notificationConfig.system_announcement;
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={`relative group p-3 sm:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.is_read ? "bg-purple-500/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-2.5 sm:gap-4">
                      {/* Icono */}
                      <div
                        className={`flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full ${config.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${config.color}`} />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm sm:text-base font-medium leading-tight ${
                              !notification.is_read ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2">
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          {notification.link_url && (
                            <span className="text-[10px] sm:text-xs text-purple-400">
                              Click para ver más →
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones - visibles en hover en desktop, siempre en móvil */}
                      <div className="flex-shrink-0 flex items-start gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification);
                            }}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Marcar como leída"
                          >
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}