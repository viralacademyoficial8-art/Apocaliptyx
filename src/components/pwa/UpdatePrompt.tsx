// src/components/pwa/UpdatePrompt.tsx

'use client';

import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function UpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-down">
      <div className="bg-blue-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-white" />
          <div className="flex-1">
            <p className="text-white font-medium">Nueva versión disponible</p>
            <p className="text-blue-200 text-sm">Actualiza para obtener las últimas mejoras</p>
          </div>
          <button
            onClick={updateServiceWorker}
            className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}