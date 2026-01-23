// src/components/perfil/BadgeDisplay.tsx

'use client';

import { useState } from 'react';
import { UserBadge } from '@/stores/profileStore';

interface BadgeDisplayProps {
  badges: UserBadge[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

const rarityColors: Record<string, string> = {
  COMMON: 'bg-muted border-border',
  RARE: 'bg-blue-900/50 border-blue-500/50',
  EPIC: 'bg-purple-900/50 border-purple-500/50',
  LEGENDARY: 'bg-yellow-900/50 border-yellow-500/50 shadow-lg shadow-yellow-500/20',
};

export function BadgeDisplay({ badges, maxVisible = 5, size = 'md' }: BadgeDisplayProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleBadges = showAll ? badges : badges.slice(0, maxVisible);
  const hiddenCount = badges.length - maxVisible;
  
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleBadges.map((badge) => (
        <div
          key={badge.id}
          className={`group relative ${sizes[size]} rounded-full border-2 ${rarityColors[badge.rarity]} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
          title={`${badge.name}: ${badge.description}`}
        >
          <span>{badge.icon}</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            <p className="text-white font-medium text-sm">{badge.name}</p>
            <p className="text-muted-foreground text-xs">{badge.description}</p>
          </div>
        </div>
      ))}
      
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className={`${sizes[size]} rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors text-sm font-medium`}
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
}