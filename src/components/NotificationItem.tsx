'use client';

import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell,
  Trophy,
  AlertCircle,
  UserPlus,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/stores';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotificationStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'scenario_stolen':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'scenario_won':
        return <Trophy className="w-5 h-5 text-green-400" />;
      case 'scenario_lost':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'scenario_completed':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-purple-400" />;
      case 'comment':
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-cyan-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'scenario_stolen':
        return 'border-l-red-500 bg-red-500/5';
      case 'scenario_won':
        return 'border-l-green-500 bg-green-500/5';
      case 'scenario_lost':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'scenario_completed':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'new_follower':
        return 'border-l-purple-500 bg-purple-500/5';
      case 'comment':
      case 'mention':
        return 'border-l-cyan-500 bg-cyan-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const handleOpen = () => {
    // Marcar como leída si aún no lo está
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navegación según el tipo de notificación
    if (notification.relatedScenarioId) {
      // Ruta correcta al detalle de escenario
      router.push(`/escenario/${notification.relatedScenarioId}`);
      return;
    }

    if (notification.relatedUserId) {
      // Aquí asumo que guardas username o id, tú decides qué es
      router.push(`/perfil/${notification.relatedUserId}`);
    }
  };

  const timeAgo = formatDistanceToNow(
    notification.createdAt instanceof Date
      ? notification.createdAt
      : new Date(notification.createdAt),
    {
      addSuffix: true,
      locale: es,
    }
  );

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`
        relative w-full text-left border-l-4 ${getNotificationColor(notification.type)}
        ${notification.isRead ? 'opacity-60' : ''}
        hover:bg-gray-800/50 transition-all cursor-pointer
        p-4 group
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {notification.title}
              </p>
              <p className="text-sm text-gray-400 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {timeAgo}
              </p>
            </div>

            {/* Acción de ver detalles */}
            {(notification.relatedScenarioId || notification.relatedUserId) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                className="p-1 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Ver detalles"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Indicador de no leída */}
        {!notification.isRead && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
    </button>
  );
}
