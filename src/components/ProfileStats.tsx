'use client';

import { User } from '@/types';
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Flame,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProfileStatsProps {
  user: User;
}

export function ProfileStats({ user: profileUser }: ProfileStatsProps) {
  const totalScenarios = profileUser.scenariosCreated;
  const wonScenarios = profileUser.scenariosWon;
  const lostScenarios = totalScenarios - wonScenarios;
  const activeScenarios = 3; // Mock - en producción vendría del store

  const stats = [
    {
      icon: Target,
      label: 'Precisión',
      value: `${profileUser.winRate.toFixed(1)}%`,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      icon: Award,
      label: 'Escenarios Ganados',
      value: wonScenarios,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      icon: Zap,
      label: 'Escenarios Activos',
      value: activeScenarios,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Escenarios Perdidos',
      value: lostScenarios,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      icon: Flame,
      label: 'AP Coins',
      value: profileUser.apCoins.toLocaleString(),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      icon: Calendar,
      label: 'Miembro desde',
      value: formatDate(profileUser.createdAt),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`
              ${stat.bgColor} ${stat.borderColor}
              border rounded-xl p-4 sm:p-5 
              flex flex-col justify-between
              transition-transform duration-150
              md:hover:scale-105 md:hover:shadow-lg
            `}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`
                  ${stat.bgColor}
                  p-2 rounded-lg flex items-center justify-center
                `}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs sm:text-sm text-gray-400">
                {stat.label}
              </span>
            </div>

            <div
              className={`
                font-bold break-words
                ${stat.color}
                text-2xl sm:text-3xl
              `}
            >
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
