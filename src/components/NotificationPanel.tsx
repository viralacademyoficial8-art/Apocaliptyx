'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Inbox, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url: string | null;
  data?: {
    scenario_id?: string;
    post_id?: string;
    user_id?: string;
    community_id?: string;
    conversation_id?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
}

export function NotificationPanel() {
  const supabase = getSupabaseBrowser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  // Cargar notificaciones
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, is_read, link_url, data, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar al abrir o cuando cambia userId
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Recargar cuando se abre el panel
  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId, fetchNotifications]);

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Eliminar todas
  const clearAll = async () => {
    if (!userId) return;
    if (!confirm('¿Eliminar todas las notificaciones?')) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (!error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Construir link de navegación (con fallback a data si link_url es null)
  const getNotificationLink = (notification: Notification): string | null => {
    // Primero intentar con link_url
    if (notification.link_url) return notification.link_url;

    // Fallback: construir link desde data para notificaciones antiguas
    let data = notification.data as Record<string, unknown> | string | null | undefined;

    // Si data es un string, parsearlo
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data) as Record<string, unknown>;
      } catch {
        return null;
      }
    }

    if (!data || typeof data !== 'object') return null;

    // Obtener scenario_id (puede venir como string, UUID, o en diferentes formatos)
    const scenarioId = (data.scenario_id || data.scenarioId || data.scenario)?.toString();
    const usrId = (data.user_id || data.userId)?.toString();
    const commId = (data.community_id || data.communityId)?.toString();
    const convId = (data.conversation_id || data.conversationId)?.toString();

    // Para notificaciones de escenarios
    const scenarioTypes = [
      'scenario_stolen',
      'scenario_created',
      'scenario_recovered',
      'prediction_won',
      'prediction_lost',
      'scenario_resolved',
      'scenario_vote',
      'scenario_expiring'
    ];

    if (scenarioTypes.includes(notification.type) && scenarioId) {
      return `/escenario/${scenarioId}`;
    }

    if (notification.type === 'new_follower' && usrId) {
      return `/perfil/${usrId}`;
    }

    if (['community_post', 'community_comment', 'community_like'].includes(notification.type) && commId) {
      return `/foro/comunidad/${commId}`;
    }

    if (['message_received', 'message_reaction'].includes(notification.type) && convId) {
      return `/mensajes?conv=${convId}`;
    }

    return null;
  };

  // Click en notificación
  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    console.log('link_url:', notification.link_url);
    console.log('data:', notification.data);

    // Marcar como leída primero
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Intentar obtener link directamente de link_url primero
    let link = notification.link_url;

    // Si no hay link_url, intentar construirlo desde data
    if (!link) {
      link = getNotificationLink(notification);
    }

    console.log('Final link:', link);

    // Navegar directamente
    if (link) {
      setIsOpen(false);
      // Small timeout to ensure dropdown closes first
      setTimeout(() => {
        window.location.href = link;
      }, 100);
    } else {
      console.warn('No link found for notification:', notification.id);
      alert('No se encontró link para esta notificación. Revisa la consola para más detalles.');
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <>
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[400px] max-w-[95vw] bg-card border-border p-0 max-h-[600px] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </h3>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    title="Marcar todas como leídas"
                  >
                    <Check className="w-3 h-3" />
                    Marcar todas
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  title="Eliminar todas"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`group p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-purple-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Indicador no leído */}
                    <div className="mt-1.5">
                      {!notification.is_read ? (
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${
                        !notification.is_read ? 'text-white' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-card border-t border-border p-3">
            <button
              onClick={() => {
                router.push('/notificaciones');
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}