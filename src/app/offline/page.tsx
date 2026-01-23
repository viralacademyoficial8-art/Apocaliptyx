// src/app/offline/page.tsx

'use client';

export const dynamic = 'force-dynamic';


import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Sin conexión
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Parece que no tienes conexión a internet. Verifica tu conexión e intenta de nuevo.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Reintentar
        </button>

        {/* Tips */}
        <div className="mt-12 text-left bg-card rounded-xl p-6 border border-border">
          <h2 className="text-white font-medium mb-3">Mientras tanto puedes:</h2>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• Verificar tu conexión WiFi o datos móviles</li>
            <li>• Activar y desactivar el modo avión</li>
            <li>• Acercarte a tu router</li>
            <li>• Reiniciar tu dispositivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}