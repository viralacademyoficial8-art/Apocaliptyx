// src/components/PushNotificationManager.tsx

'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Check } from 'lucide-react';
import { pushNotificationsService } from '@/services/pushNotifications.service';
import { useAuthStore } from '@/lib/stores';
import toast from 'react-hot-toast';

interface PushNotificationManagerProps {
  showButton?: boolean;
  className?: string;
}

export function PushNotificationManager({ 
  showButton = true,
  className = ''
}: PushNotificationManagerProps) {
  const { user } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      // Verificar si el navegador soporta push
      if (!pushNotificationsService.isSupported()) {
        setPermission('unsupported');
        setInitialized(true);
        return;
      }

      // Registrar service worker
      await pushNotificationsService.registerServiceWorker();
      
      // Verificar estado actual del permiso
      setPermission(pushNotificationsService.getPermissionState());
      
      // Verificar si el usuario está suscrito
      if (user?.id) {
        const sub = await pushNotificationsService.isSubscribed(user.id);
        setSubscribed(sub);
      }
      
      setInitialized(true);
    }

    init();
  }, [user?.id]);

  const handleEnableNotifications = async () => {
    if (!user?.id) {
      toast.error('Debes iniciar sesión para activar notificaciones');
      return;
    }

    setLoading(true);
    try {
      const success = await pushNotificationsService.subscribe(user.id);
      
      if (success) {
        setPermission('granted');
        setSubscribed(true);
        toast.success('¡Notificaciones activadas! 🔔');
        
        // Mostrar notificación de prueba
        setTimeout(() => {
          pushNotificationsService.showLocalNotification(
            '¡Bienvenido a Apocaliptyx! 🎉',
            {
              body: 'Ahora recibirás notificaciones de mensajes, likes y más.',
              icon: '/icon-192x192.png',
            }
          );
        }, 1000);
      } else {
        const currentPermission = pushNotificationsService.getPermissionState();
        setPermission(currentPermission);
        
        if (currentPermission === 'denied') {
          toast.error('Notificaciones bloqueadas. Habilítalas en la configuración del navegador.');
        } else {
          toast.error('No se pudieron activar las notificaciones');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Error al activar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await pushNotificationsService.unsubscribe(user.id);
      setSubscribed(false);
      toast.success('Notificaciones desactivadas');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Error al desactivar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!showButton) return null;
  if (!initialized) return null;

  // No soportado
  if (permission === 'unsupported') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed ${className}`}
        title="Tu navegador no soporta notificaciones push"
      >
        <BellOff className="w-4 h-4" />
        <span className="text-sm">No soportado</span>
      </button>
    );
  }

  // Ya suscrito
  if (subscribed && permission === 'granted') {
    return (
      <button
        onClick={handleDisableNotifications}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors ${className}`}
        title="Clic para desactivar notificaciones"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        <span className="text-sm">Notificaciones activas</span>
      </button>
    );
  }

  // Denegado
  if (permission === 'denied') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed ${className}`}
        title="Las notificaciones fueron bloqueadas. Habilítalas en la configuración del navegador."
      >
        <BellOff className="w-4 h-4" />
        <span className="text-sm">Notificaciones bloqueadas</span>
      </button>
    );
  }

  // Mostrar botón para activar
  return (
    <button
      onClick={handleEnableNotifications}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      <span className="text-sm">
        {loading ? 'Activando...' : 'Activar notificaciones'}
      </span>
    </button>
  );
}