'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usersService } from '@/services';
import {
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Crown,
  Award,
  Users,
  Loader2,
  AlertCircle,
  Medal,
} from 'lucide-react';

// Tipo para usuarios de Supabase
interface UserData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  ap_coins: number;
  level: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  total_earnings: number;
  is_verified: boolean;
  is_premium: boolean;
}

type SortOption = 'ap_coins' | 'level' | 'correct_predictions' | 'total_earnings';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('ap_coins');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar leaderboard de Supabase
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setIsLoading(true);
        const data = await usersService.getLeaderboard(50);
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Error al cargar el ranking');
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  // Ordenar usuarios
  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'ap_coins':
        return b.ap_coins - a.ap_coins;
      case 'level':
        return b.level - a.level;
      case 'correct_predictions':
        return b.correct_predictions - a.correct_predictions;
      case 'total_earnings':
        return b.total_earnings - a.total_earnings;
      default:
        return b.ap_coins - a.ap_coins;
    }
  });

  // Calcular posición del usuario actual
  const currentPosition = user 
    ? sortedUsers.findIndex((u) => u.id === user.id) + 1 
    : 0;

  // Calcular win rate promedio
  const avgWinRate = users.length > 0
    ? users.reduce((sum, u) => {
        const rate = u.total_predictions > 0 
          ? (u.correct_predictions / u.total_predictions) * 100 
          : 0;
        return sum + rate;
      }, 0) / users.length
    : 0;

  const sortOptions = [
    {
      id: 'ap_coins' as SortOption,
      label: 'AP Coins',
      icon: Award,
      description: 'Monedas totales',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      id: 'level' as SortOption,
      label: 'Nivel',
      icon: Flame,
      description: 'Nivel de profeta',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    {
      id: 'correct_predictions' as SortOption,
      label: 'Aciertos',
      icon: Target,
      description: 'Predicciones correctas',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      id: 'total_earnings' as SortOption,
      label: 'Ganancias',
      icon: TrendingUp,
      description: 'AP Coins ganadas',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400">Cargando ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                Leaderboard
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Ranking de los mejores profetas de Apocaliptics
              </p>
            </div>
          </div>
        </header>

        {/* User Position Card */}
        {user && currentPosition > 0 && (
          <section className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-200/80">
                    Tu posición actual
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                    #{currentPosition}
                  </div>
                  <p className="text-xs text-gray-200/80 mt-1">
                    Sigue ganando escenarios para subir en el ranking 🔥
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/perfil/${user.username}`)}
                className="px-4 py-2 border border-yellow-500/30 hover:bg-yellow-500/10 rounded-lg text-sm"
              >
                Ver mi perfil
              </button>
            </div>
          </section>
        )}

        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-xs sm:text-sm text-gray-400">
                Total Profetas
              </div>
              <div className="text-2xl font-bold">{users.length}</div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xs sm:text-sm text-gray-400">
                Líder Actual
              </div>
              <div className="text-base sm:text-lg font-bold truncate">
                {sortedUsers.length > 0 
                  ? sortedUsers[0].display_name || sortedUsers[0].username 
                  : '-'}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-xs sm:text-sm text-gray-400">
                Win Rate Promedio
              </div>
              <div className="text-2xl font-bold">
                {avgWinRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </section>

        {/* Sort Options */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Ordenar por:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`
                    ${option.bgColor} ${option.borderColor}
                    border-2 rounded-lg p-3 sm:p-4 transition-all text-left
                    ${isActive
                      ? 'scale-[1.02] sm:scale-105 shadow-lg'
                      : 'opacity-80 hover:opacity-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${option.color}`} />
                    <span className="font-semibold text-sm sm:text-base">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Leaderboard Table */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Profeta
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    AP Coins
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aciertos
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedUsers.map((u, index) => {
                  const position = index + 1;
                  const winRate = u.total_predictions > 0 
                    ? ((u.correct_predictions / u.total_predictions) * 100).toFixed(1)
                    : '0.0';
                  const isCurrentUser = user?.id === u.id;

                  return (
                    <tr 
                      key={u.id}
                      onClick={() => router.push(`/perfil/${u.username}`)}
                      className={`
                        cursor-pointer transition-colors
                        ${isCurrentUser 
                          ? 'bg-yellow-500/10 hover:bg-yellow-500/20' 
                          : 'hover:bg-gray-800/50'
                        }
                      `}
                    >
                      {/* Position */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {position === 1 && (
                            <Medal className="w-5 h-5 text-yellow-400" />
                          )}
                          {position === 2 && (
                            <Medal className="w-5 h-5 text-gray-400" />
                          )}
                          {position === 3 && (
                            <Medal className="w-5 h-5 text-amber-600" />
                          )}
                          <span className={`font-bold ${
                            position <= 3 ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            #{position}
                          </span>
                        </div>
                      </td>

                      {/* User info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {(u.display_name || u.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {u.display_name || u.username}
                              {u.is_verified && (
                                <span className="text-blue-400 text-xs">✓</span>
                              )}
                              {u.is_premium && (
                                <span className="text-yellow-400 text-xs">★</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                          Lvl {u.level}
                        </span>
                      </td>

                      {/* AP Coins */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-yellow-400 font-semibold">
                          {u.ap_coins.toLocaleString()}
                        </span>
                      </td>

                      {/* Correct Predictions */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-green-400">
                          {u.correct_predictions}/{u.total_predictions}
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="px-4 py-4 text-center">
                        <span className={`font-medium ${
                          parseFloat(winRate) >= 60 
                            ? 'text-green-400' 
                            : parseFloat(winRate) >= 40 
                              ? 'text-yellow-400' 
                              : 'text-red-400'
                        }`}>
                          {winRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay profetas en el ranking aún
              </div>
            )}
          </div>
        </section>

        {/* Info Footer */}
        <section className="text-center text-xs sm:text-sm text-gray-500 pb-4 sm:pb-8">
          <p>
            El ranking se actualiza en tiempo real basado en la actividad de los profetas.
          </p>
          <p className="mt-2">
            ¿Quieres llegar al top? Crea escenarios precisos y sube tu win rate 📈
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}