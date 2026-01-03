// src/components/OnlineStatus.tsx

'use client';

import { useEffect, useState } from 'react';
import { presenceService, UserStatus, UserPresence } from '@/services/presence.service';

interface OnlineStatusProps {
  userId: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OnlineStatus({ userId, showText = false, size = 'md' }: OnlineStatusProps) {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    // Obtener estado inicial
    presenceService.getUserStatus(userId).then(setPresence);

    // Suscribirse a cambios
    const unsubscribe = presenceService.subscribeToUserStatus(userId, setPresence);

    return () => unsubscribe();
  }, [userId]);

  if (!presence) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColor = presenceService.getStatusColor(presence.status);
  const statusText = presenceService.getStatusText(presence.status, presence.lastSeen);

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <span 
          className={`block rounded-full ${sizeClasses[size]} ${statusColor}`}
          title={statusText}
        />
        {presence.status === 'online' && (
          <span 
            className={`absolute inset-0 rounded-full ${statusColor} animate-ping opacity-75`}
            style={{ animationDuration: '2s' }}
          />
        )}
      </div>
      {showText && (
        <span className={`text-xs ${
          presence.status === 'online' ? 'text-green-400' :
          presence.status === 'away' ? 'text-yellow-400' :
          'text-gray-400'
        }`}>
          {statusText}
        </span>
      )}
    </div>
  );
}

// Componente para iniciar tracking del usuario actual
export function PresenceTracker({ userId }: { userId: string }) {
  useEffect(() => {
    if (userId) {
      presenceService.startTracking(userId);
    }

    return () => {
      presenceService.stopTracking();
    };
  }, [userId]);

  return null; // No renderiza nada, solo hace tracking
}