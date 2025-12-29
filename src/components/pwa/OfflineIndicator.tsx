// src/components/pwa/OfflineIndicator.tsx

'use client';

import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        Sin conexión - Algunas funciones pueden no estar disponibles
      </div>
    </div>
  );
}