'use client';

import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/stores';
import { NotificationItem } from './NotificationItem';
import { Bell, Check, Trash2, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    fetchNotifications,
    clearAll,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Carga inicial de notificaciones (mock / API en el futuro)
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-gray-300" />
          {unreadCount > 0 && (
            <>
              {/* Badge con número */}
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
              {/* Pulse animation */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[400px] max-w-[95vw] bg-gray-900 border-gray-800 p-0 max-h-[600px] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10">
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
                    if (confirm('¿Eliminar todas las notificaciones?')) {
                      clearAll();
                    }
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
                  ? 'bg-gray-800 text-white font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-gray-800 text-white font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-3 text-center">
            <p className="text-xs text-gray-500">
              Mostrando {filteredNotifications.length} de{' '}
              {notifications.length} notificaciones
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
