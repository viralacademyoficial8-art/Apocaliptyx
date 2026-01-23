// src/components/perfil/LevelProgress.tsx

'use client';

import { Sparkles } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LevelProgress({
  level,
  xp,
  xpToNextLevel,
  size = 'md',
  showLabel = true,
}: LevelProgressProps) {
  const progress = (xp / xpToNextLevel) * 100;
  
  const sizes = {
    sm: { height: 'h-1.5', text: 'text-xs', icon: 'w-3 h-3' },
    md: { height: 'h-2', text: 'text-sm', icon: 'w-4 h-4' },
    lg: { height: 'h-3', text: 'text-base', icon: 'w-5 h-5' },
  };

  const s = sizes[size];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`${s.icon} text-yellow-400`} />
            <span className={`${s.text} font-bold text-white`}>Nivel {level}</span>
          </div>
          <span className={`${s.text} text-muted-foreground`}>
            {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className={`w-full ${s.height} bg-muted rounded-full overflow-hidden`}>
        <div
          className={`${s.height} bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}