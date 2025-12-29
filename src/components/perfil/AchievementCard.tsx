// src/components/perfil/AchievementCard.tsx

'use client';

import { Lock, Check, Coins, Sparkles } from 'lucide-react';
import { UserAchievement } from '@/stores/profileStore';

interface AchievementCardProps {
  achievement: UserAchievement;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-gray-400' },
  RARE: { bg: 'bg-blue-900/30', border: 'border-blue-500/30', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const rarity = rarityColors[achievement.rarity];
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      className={`relative ${rarity.bg} rounded-xl border ${rarity.border} p-4 transition-all hover:scale-[1.02] ${
        !achievement.isUnlocked ? 'opacity-60' : ''
      }`}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {/* Unlocked check */}
      {achievement.isUnlocked && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-3">{achievement.icon}</div>

      {/* Name & Description */}
      <h3 className="text-white font-bold mb-1">{achievement.name}</h3>
      <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Progreso</span>
          <span className={achievement.isUnlocked ? 'text-green-400' : 'text-white'}>
            {achievement.progress} / {achievement.maxProgress}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              achievement.isUnlocked
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-purple-600 to-purple-400'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400">{achievement.rewardCoins}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400">{achievement.rewardXp} XP</span>
        </div>
      </div>

      {/* Rarity badge */}
      <div className="absolute bottom-3 right-3">
        <span className={`text-xs font-medium ${rarity.text}`}>
          {achievement.rarity}
        </span>
      </div>
    </div>
  );
}