'use client';

import { useState } from 'react';
import { Trophy, Lock, Star, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Achievement {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  category: string;
  icon: string;
  iconLocked: string;
  color: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  progress: number;
  progressMax: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  isSecret: boolean;
}

interface AchievementsGridProps {
  achievements: Achievement[];
  totalPoints: number;
}

const rarityColors = {
  common: 'border-gray-500 bg-gray-500/10',
  rare: 'border-blue-500 bg-blue-500/10',
  epic: 'border-purple-500 bg-purple-500/10',
  legendary: 'border-yellow-500 bg-yellow-500/10',
  mythic: 'border-pink-500 bg-pink-500/10',
};

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
  mythic: 'Mítico',
};

const categoryLabels: Record<string, string> = {
  predictions: 'Predicciones',
  social: 'Social',
  content: 'Contenido',
  community: 'Comunidad',
  special: 'Especial',
};

export function AchievementsGrid({ achievements, totalPoints }: AchievementsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const categories = ['all', ...new Set(achievements.map((a) => a.category))];

  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) {
      return false;
    }
    if (showUnlockedOnly && !achievement.isUnlocked) {
      return false;
    }
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="bg-muted/50 rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Puntos de logro</p>
              <p className="text-2xl font-bold text-yellow-400">
                {totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Desbloqueados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {achievements.length - unlockedCount}
              </p>
              <p className="text-xs text-muted-foreground">Bloqueados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[150px] bg-muted border-border">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">Todas</SelectItem>
            {categories
              .filter((c) => c !== 'all')
              .map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat] || cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={selectedRarity} onValueChange={setSelectedRarity}>
          <SelectTrigger className="w-[150px] bg-muted border-border">
            <SelectValue placeholder="Rareza" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(rarityLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
            showUnlockedOnly
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-muted border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Solo desbloqueados
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-xl border p-4 transition-all hover:scale-[1.02] ${
              achievement.isUnlocked
                ? rarityColors[achievement.rarity]
                : 'border-border bg-muted/30 opacity-60'
            }`}
          >
            {/* Secret Achievement Overlay */}
            {achievement.isSecret && !achievement.isUnlocked && (
              <div className="absolute inset-0 bg-card/80 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Logro secreto</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div
                className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                style={{
                  backgroundColor: achievement.isUnlocked
                    ? `${achievement.color}20`
                    : undefined,
                }}
              >
                {achievement.isUnlocked ? achievement.icon : achievement.iconLocked}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{achievement.nameEs}</h4>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      rarityColors[achievement.rarity]
                    }`}
                  >
                    {rarityLabels[achievement.rarity]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {achievement.descriptionEs}
                </p>

                {/* Progress */}
                {!achievement.isUnlocked && (
                  <div className="space-y-1">
                    <Progress
                      value={(achievement.progress / achievement.progressMax) * 100}
                      className="h-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress} / {achievement.progressMax}
                    </p>
                  </div>
                )}

                {/* Points */}
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">
                    {achievement.points} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No se encontraron logros</p>
        </div>
      )}
    </div>
  );
}
