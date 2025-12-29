'use client';

import {
  TrendingUp, TrendingDown, Target, Flame, Trophy,
  Coins, Percent, Zap, Shield, Award,
} from 'lucide-react';
import { UserStats } from '@/stores/profileStore';

interface ProfileStatsProps {
  stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statCards = [
    { label: 'Predicciones', value: stats.totalPredictions, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Aciertos', value: stats.correctPredictions, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Precisión', value: `${stats.accuracy.toFixed(1)}%`, icon: Percent, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Racha Actual', value: stats.currentStreak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { label: 'Mejor Racha', value: stats.bestStreak, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { label: 'Ganancias', value: `${(stats.totalEarnings / 1000).toFixed(0)}k`, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    {
      label: 'Beneficio Neto',
      value: `${stats.netProfit >= 0 ? '+' : ''}${(stats.netProfit / 1000).toFixed(0)}k`,
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bg: stats.netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    { label: 'Robos Exitosos', value: stats.stealsSuccessful, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Escenarios Creados', value: stats.scenariosCreated, icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { label: 'Top', value: `${stats.percentile}%`, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
