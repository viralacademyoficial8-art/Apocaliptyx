// src/components/pwa/InstallPrompt.tsx

'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installPrompt } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }

    // Show prompt after 30 seconds on the page
    const timer = setTimeout(() => {
      if (isInstallable && !isDismissed) {
        setIsVisible(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable, isDismissed]);

  const handleInstall = async () => {
    const installed = await installPrompt();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl shadow-purple-500/10">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Download className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Instala Apocaliptics</h3>
            <p className="text-gray-400 text-sm mb-4">
              Accede más rápido y recibe notificaciones de tus predicciones.
            </p>

            {/* Device icons */}
            <div className="flex items-center gap-4 mb-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" /> Móvil
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="w-4 h-4" /> Desktop
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Instalar
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