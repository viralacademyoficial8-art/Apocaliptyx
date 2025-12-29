// src/components/PushNotificationManager.tsx

'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Check } from 'lucide-react';
import { initOneSignal, requestNotificationPermission, isSubscribed } from '@/lib/onesignal';

interface PushNotificationManagerProps {
  showButton?: boolean;
  className?: string;
}

export function PushNotificationManager({ 
  showButton = true,
  className = ''
}: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initOneSignal();
      setInitialized(true);
      
      // Verificar estado actual
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      const sub = await isSubscribed();
      setSubscribed(sub);
    }

    init();
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        setSubscribed(true);
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showButton) return null;
  if (!initialized) return null;

  // Ya suscrito
  if (subscribed && permission === 'granted') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg cursor-default ${className}`}
      >
        <Check className="w-4 h-4" />
        <span className="text-sm">Notificaciones activas</span>
      </button>
    );
  }

  // Denegado
  if (permission === 'denied') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
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