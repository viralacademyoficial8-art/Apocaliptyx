// src/components/perfil/ProfileAchievements.tsx

'use client';

import { useState } from 'react';
import { Trophy, Filter } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { AchievementCard } from './AchievementCard';

export function ProfileAchievements() {
  const { achievements } = useProfileStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked' && !a.isUnlocked) return false;
    if (filter === 'locked' && a.isUnlocked) return false;
    if (rarityFilter !== 'all' && a.rarity !== rarityFilter) return false;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Logros</h2>
            <p className="text-gray-400 text-sm">
              {unlockedCount} de {achievements.length} desbloqueados
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">Todos</option>
            <option value="unlocked">Desbloqueados</option>
            <option value="locked">Bloqueados</option>
          </select>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">Todas las rarezas</option>
            <option value="COMMON">Común</option>
            <option value="RARE">Raro</option>
            <option value="EPIC">Épico</option>
            <option value="LEGENDARY">Legendario</option>
          </select>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Progreso total</span>
          <span className="text-white font-medium">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay logros que mostrar</p>
        </div>
      )}
    </div>
  );
}