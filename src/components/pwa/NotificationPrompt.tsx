// src/components/pwa/NotificationPrompt.tsx

'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function NotificationPrompt() {
  const { notificationPermission, requestNotificationPermission, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show if:
    // 1. Notifications are supported
    // 2. Permission is not granted or denied
    // 3. User hasn't dismissed recently
    // 4. App is installed (optional, can remove this condition)

    if (notificationPermission === 'unsupported' || notificationPermission === 'granted') {
      return;
    }

    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        setIsDismissed(true);
        return;
      }
    }

    // Show after user has been on site for a bit
    const timer = setTimeout(() => {
      if (notificationPermission === 'default' && !isDismissed) {
        setIsVisible(true);
      }
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [notificationPermission, isDismissed]);

  const handleAllow = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', new Date().toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Bell className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Activa las notificaciones</h3>
            <p className="text-gray-400 text-sm mb-4">
              Recibe alertas cuando tus predicciones se resuelvan o te roben un escenario.
            </p>

            {/* Benefits */}
            <ul className="space-y-1 mb-4 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Resultados de predicciones
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Alertas de robos
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Bonus diarios
              </li>
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAllow}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                Activar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}