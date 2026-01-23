// src/components/NotificationBell.tsx

'use client';

import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { initOneSignal, requestNotificationPermission, isSubscribed } from '@/lib/onesignal';

export function NotificationBell() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      await initOneSignal();
      const sub = await isSubscribed();
      setSubscribed(sub);
    }
    checkSubscription();
  }, []);

  const handleClick = async () => {
    if (subscribed) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }

    setLoading(true);
    const granted = await requestNotificationPermission();
    setSubscribed(granted);
    setLoading(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors ${
          subscribed 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-muted text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title={subscribed ? 'Notificaciones activas' : 'Activar notificaciones'}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : subscribed ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-muted text-white text-xs rounded-lg whitespace-nowrap z-50">
          ✅ Notificaciones ya activas
        </div>
      )}
    </div>
  );
}