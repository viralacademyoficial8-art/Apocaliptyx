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
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${rankColor}20` }}
          >
            {rankIcon}
          </div>
          <div>
            <p className="text-sm text-gray-400">Rango actual</p>
            <h3 className="font-bold text-lg" style={{ color: rankColor }}>
              {rankNameEs}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Nivel</p>
          <p className="text-2xl font-bold">{level}</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Experiencia</span>
          <span className="text-gray-300">
            {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>

      {/* Next Rank Preview */}
      {nextRankName && nextRankLevel && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Próximo rango</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">{nextRankName}</span>
              <span className="text-gray-500">Nivel {nextRankLevel}</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
