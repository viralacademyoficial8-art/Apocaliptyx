'use client';

import { User, PROPHET_LEVELS } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Crown, Medal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';

interface LeaderboardTableProps {
  users: User[];
  sortBy: 'reputation' | 'winRate' | 'apCoins' | 'scenariosWon';
}

export function LeaderboardTable({ users, sortBy }: LeaderboardTableProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'reputation':
        return b.reputationScore - a.reputationScore;
      case 'winRate':
        return b.winRate - a.winRate;
      case 'apCoins':
        return b.apCoins - a.apCoins;
      case 'scenariosWon':
        return b.scenariosWon - a.scenariosWon;
      default:
        return b.reputationScore - a.reputationScore;
    }
  });

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="flex items-center gap-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">1°</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1">
            <Medal className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-bold">2°</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1">
            <Medal className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-bold">3°</span>
          </div>
        );
      default:
        return (
          <div className="w-8 text-center">
            <span className="text-gray-500 font-semibold">{position}°</span>
          </div>
        );
    }
  };

  const getRowStyle = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-yellow-500/10 border-l-4 border-yellow-500';
    }
    if (position === 1) {
      return 'bg-gradient-to-r from-yellow-500/10 to-transparent';
    }
    if (position === 2) {
      return 'bg-gradient-to-r from-gray-400/10 to-transparent';
    }
    if (position === 3) {
      return 'bg-gradient-to-r from-orange-400/10 to-transparent';
    }
    return 'hover:bg-gray-800/50';
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'reputation':
        return 'Reputación';
      case 'winRate':
        return 'Win Rate';
      case 'apCoins':
        return 'AP Coins';
      case 'scenariosWon':
        return 'Ganados';
      default:
        return 'Reputación';
    }
  };

  const getSortValue = (user: User) => {
    switch (sortBy) {
      case 'reputation':
        return user.reputationScore.toLocaleString();
      case 'winRate':
        return `${user.winRate.toFixed(1)}%`;
      case 'apCoins':
        return user.apCoins.toLocaleString();
      case 'scenariosWon':
        return user.scenariosWon;
      default:
        return user.reputationScore.toLocaleString();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 text-left">
            <th className="p-4 text-gray-400 font-semibold">Posición</th>
            <th className="p-4 text-gray-400 font-semibold">Profeta</th>
            <th className="p-4 text-gray-400 font-semibold">Nivel</th>
            <th className="p-4 text-gray-400 font-semibold">
              {getSortLabel()}
            </th>
            <th className="p-4 text-gray-400 font-semibold">Escenarios</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => {
            const position = index + 1;
            const isCurrentUser = currentUser?.id === user.id;
            const prophetLevel = PROPHET_LEVELS[user.prophetLevel];

            return (
              <tr
                key={user.id}
                onClick={() => router.push(`/perfil/${user.username}`)}
                className={`
                  border-b border-gray-800/50 transition-all cursor-pointer
                  ${getRowStyle(position, isCurrentUser)}
                `}
              >
                {/* Posición */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getPositionBadge(position)}
                    {position <= 10 && position > 3 && (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                      >
                        Top 10
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Usuario */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-gray-700">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-purple-600 to-pink-600">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {user.displayName}
                        {isCurrentUser && (
                          <Badge className="bg-yellow-500 text-black text-xs">
                            Tú
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Nivel de profeta */}
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={`${prophetLevel.color} border-gray-700`}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    {prophetLevel.name}
                  </Badge>
                </td>

                {/* Valor ordenado */}
                <td className="p-4">
                  <div className="font-bold text-lg">
                    {getSortValue(user)}
                  </div>
                </td>

                {/* Escenarios */}
                <td className="p-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">
                        {user.scenariosWon}
                      </span>
                      <span className="text-gray-500">ganados</span>
                    </div>
                    <div className="text-gray-500">
                      {user.scenariosCreated} creados
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedUsers.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">
            No hay profetas en el leaderboard aún
          </p>
        </div>
      )}
    </div>
  );
}
