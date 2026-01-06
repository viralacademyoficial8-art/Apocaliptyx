'use client';

import { Flame, Calendar, Target, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentPredictionStreak: number;
  longestPredictionStreak: number;
  currentCorrectStreak: number;
  longestCorrectStreak: number;
  totalLoginDays: number;
}

export function StreakDisplay({
  currentLoginStreak,
  longestLoginStreak,
  currentPredictionStreak,
  longestPredictionStreak,
  currentCorrectStreak,
  longestCorrectStreak,
  totalLoginDays,
}: StreakDisplayProps) {
  const streaks = [
    {
      label: 'Racha de Login',
      current: currentLoginStreak,
      best: longestLoginStreak,
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      label: 'Racha de Predicciones',
      current: currentPredictionStreak,
      best: longestPredictionStreak,
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Racha Correcta',
      current: currentCorrectStreak,
      best: longestCorrectStreak,
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Rachas
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          {totalLoginDays} días totales
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {streaks.map((streak, index) => (
          <div
            key={index}
            className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${streak.bgColor} ${streak.color}`}>
                {streak.icon}
              </div>
              <span className="text-xs text-gray-400">{streak.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${streak.color}`}>
                {streak.current}
              </span>
              <span className="text-xs text-gray-500">días</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mejor: {streak.best} días
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
