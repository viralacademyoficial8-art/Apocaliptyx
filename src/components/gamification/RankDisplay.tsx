'use client';

import { Crown, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RankDisplayProps {
  rankName: string;
  rankNameEs: string;
  rankIcon: string;
  rankColor: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  nextRankName?: string;
  nextRankLevel?: number;
}

export function RankDisplay({
  rankName,
  rankNameEs,
  rankIcon,
  rankColor,
  level,
  xp,
  xpToNextLevel,
  nextRankName,
  nextRankLevel,
}: RankDisplayProps) {
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <div className="bg-muted/50 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${rankColor}20` }}
          >
            {rankIcon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rango actual</p>
            <h3 className="font-bold text-lg" style={{ color: rankColor }}>
              {rankNameEs}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Nivel</p>
          <p className="text-2xl font-bold">{level}</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Experiencia</span>
          <span className="text-foreground">
            {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>

      {/* Next Rank Preview */}
      {nextRankName && nextRankLevel && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Próximo rango</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">{nextRankName}</span>
              <span className="text-muted-foreground">Nivel {nextRankLevel}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
