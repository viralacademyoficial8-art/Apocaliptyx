'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usersService } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();

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
        setError(t('leaderboard.loadError'));
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
      label: t('leaderboard.sortBy.apCoins'),
      icon: Award,
      description: t('leaderboard.sortBy.apCoinsDesc'),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      id: 'level' as SortOption,
      label: t('leaderboard.sortBy.level'),
      icon: Flame,
      description: t('leaderboard.sortBy.levelDesc'),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    {
      id: 'correct_predictions' as SortOption,
      label: t('leaderboard.sortBy.accuracy'),
      icon: Target,
      description: t('leaderboard.sortBy.accuracyDesc'),
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      id: 'total_earnings' as SortOption,
      label: t('leaderboard.sortBy.earnings'),
      icon: TrendingUp,
      description: t('leaderboard.sortBy.earningsDesc'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('leaderboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            {t('errors.serverError.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                {t('rankings.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('rankings.subtitle')}
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
                    {t('leaderboard.yourPosition')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                    #{currentPosition}
                  </div>
                  <p className="text-xs text-gray-200/80 mt-1">
                    {t('leaderboard.keepWinning')} 🔥
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/perfil/${user.username}`)}
                className="px-4 py-2 border border-yellow-500/30 hover:bg-yellow-500/10 rounded-lg text-sm"
              >
                {t('leaderboard.viewMyProfile')}
              </button>
            </div>
          </section>
        )}

        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Prophets Card */}
          <div
            onClick={() => router.push('/comunidad')}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 hover:border-blue-500/30 transition-all group"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t('leaderboard.totalProphets')}
              </div>
              <div className="text-2xl font-bold">{users.length}</div>
            </div>
            <div className="text-muted-foreground group-hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Current Leader Card */}
          <div
            onClick={() => sortedUsers.length > 0 && router.push(`/perfil/${sortedUsers[0].username}`)}
            className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:from-yellow-500/20 hover:to-amber-500/20 hover:border-yellow-500/50 transition-all group"
          >
            <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t('leaderboard.currentLeader')}
              </div>
              <div className="flex items-center gap-2">
                {sortedUsers.length > 0 && sortedUsers[0].avatar_url ? (
                  <Image
                    src={sortedUsers[0].avatar_url}
                    alt={sortedUsers[0].display_name || sortedUsers[0].username}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-yellow-400"
                  />
                ) : sortedUsers.length > 0 ? (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-yellow-400">
                    {(sortedUsers[0].display_name || sortedUsers[0].username).charAt(0).toUpperCase()}
                  </div>
                ) : null}
                <span className="text-base sm:text-lg font-bold truncate text-yellow-400">
                  {sortedUsers.length > 0
                    ? sortedUsers[0].display_name || sortedUsers[0].username
                    : '-'}
                </span>
                {sortedUsers.length > 0 && sortedUsers[0].is_verified && (
                  <span className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white">✓</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-yellow-600 group-hover:text-yellow-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Average Win Rate Card */}
          <div
            onClick={() => router.push('/estadisticas')}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 hover:border-green-500/30 transition-all group"
          >
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t('leaderboard.avgWinRate')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {avgWinRate.toFixed(1)}%
                </span>
                {/* Mini indicator */}
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  avgWinRate >= 50
                    ? 'bg-green-500/20 text-green-400'
                    : avgWinRate >= 30
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}>
                  {avgWinRate >= 50 ? '↑' : avgWinRate >= 30 ? '→' : '↓'}
                </div>
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-green-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </section>

        {/* Sort Options */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('leaderboard.sortByLabel')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.id;

              // Get top user for this category
              const getTopUserForCategory = () => {
                if (users.length === 0) return null;
                const sorted = [...users].sort((a, b) => {
                  switch (option.id) {
                    case 'ap_coins': return b.ap_coins - a.ap_coins;
                    case 'level': return b.level - a.level;
                    case 'correct_predictions': return b.correct_predictions - a.correct_predictions;
                    case 'total_earnings': return b.total_earnings - a.total_earnings;
                    default: return 0;
                  }
                });
                return sorted[0];
              };

              const getTopValue = (topUser: UserData | null) => {
                if (!topUser) return '-';
                switch (option.id) {
                  case 'ap_coins': return topUser.ap_coins.toLocaleString();
                  case 'level': return `Lvl ${topUser.level}`;
                  case 'correct_predictions': return `${topUser.correct_predictions}/${topUser.total_predictions}`;
                  case 'total_earnings': return topUser.total_earnings.toLocaleString();
                  default: return '-';
                }
              };

              const topUser = getTopUserForCategory();
              const topValue = getTopValue(topUser);

              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`
                    ${option.bgColor} ${option.borderColor}
                    border-2 rounded-xl p-3 sm:p-4 transition-all text-left relative overflow-hidden
                    ${isActive
                      ? 'scale-[1.02] sm:scale-105 shadow-lg ring-2 ring-offset-2 ring-offset-gray-950'
                      : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                    }
                    ${isActive ? option.borderColor.replace('border-', 'ring-').replace('/30', '/50') : ''}
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')} animate-pulse`} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`p-1.5 rounded-lg ${option.bgColor}`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${option.color}`} />
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {option.label}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">
                    {option.description}
                  </p>

                  {/* Top User Preview */}
                  {topUser && (
                    <div
                      className="flex items-center gap-2 pt-2 border-t border-border cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/perfil/${topUser.username}`);
                      }}
                    >
                      {topUser.avatar_url ? (
                        <Image
                          src={topUser.avatar_url}
                          alt={topUser.display_name || topUser.username}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {(topUser.display_name || topUser.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-muted-foreground">Top #1</div>
                        <div className="text-xs font-medium truncate text-foreground hover:text-foreground transition-colors">
                          {topUser.display_name || topUser.username}
                        </div>
                      </div>
                      <div className={`text-xs font-bold ${option.color}`}>
                        {topValue}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Leaderboard Cards */}
        <section className="space-y-3">
          {/* Header Row */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">{t('rankings.position')}</div>
            <div className="col-span-4">{t('leaderboard.prophet')}</div>
            <div className="col-span-2 text-center">{t('leaderboard.sortBy.level')}</div>
            <div className="col-span-2 text-center">{t('leaderboard.sortBy.apCoins')}</div>
            <div className="col-span-1 text-center">{t('leaderboard.sortBy.accuracy')}</div>
            <div className="col-span-2 text-center">{t('rankings.metrics.winRate')}</div>
          </div>

          {/* User Cards */}
          <div className="space-y-2">
            {sortedUsers.map((u, index) => {
              const position = index + 1;
              const winRate = u.total_predictions > 0
                ? ((u.correct_predictions / u.total_predictions) * 100).toFixed(1)
                : '0.0';
              const isCurrentUser = user?.id === u.id;
              const isTop3 = position <= 3;

              // Estilos especiales para top 3
              const getPositionStyles = () => {
                if (position === 1) return {
                  bg: 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20',
                  border: 'border-yellow-500/50',
                  ring: 'ring-2 ring-yellow-500/30',
                  glow: 'shadow-lg shadow-yellow-500/20',
                  avatar: 'ring-4 ring-yellow-400',
                  badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
                };
                if (position === 2) return {
                  bg: 'bg-gradient-to-r from-gray-400/15 via-slate-400/10 to-gray-400/15',
                  border: 'border-gray-400/40',
                  ring: 'ring-2 ring-gray-400/20',
                  glow: 'shadow-md shadow-gray-400/10',
                  avatar: 'ring-4 ring-gray-400',
                  badge: 'bg-gradient-to-r from-gray-300 to-gray-400 text-black',
                };
                if (position === 3) return {
                  bg: 'bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-amber-600/15',
                  border: 'border-amber-600/40',
                  ring: 'ring-2 ring-amber-600/20',
                  glow: 'shadow-md shadow-amber-600/10',
                  avatar: 'ring-4 ring-amber-600',
                  badge: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
                };
                return {
                  bg: 'bg-card/50',
                  border: 'border-border',
                  ring: '',
                  glow: '',
                  avatar: 'ring-2 ring-gray-700',
                  badge: 'bg-muted text-foreground',
                };
              };

              const styles = getPositionStyles();

              return (
                <div
                  key={u.id}
                  onClick={() => router.push(`/perfil/${u.username}`)}
                  className={`
                    relative overflow-hidden rounded-xl border cursor-pointer
                    transition-all duration-300 ease-out
                    hover:scale-[1.01] hover:-translate-y-0.5
                    ${styles.bg} ${styles.border} ${styles.ring} ${styles.glow}
                    ${isCurrentUser ? 'ring-2 ring-purple-500/50' : ''}
                  `}
                >
                  {/* Efecto de brillo para top 3 */}
                  {isTop3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                  )}

                  <div className="relative p-4">
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center gap-3">
                        {/* Position Badge */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${styles.badge}`}>
                          {position === 1 && <Crown className="w-5 h-5" />}
                          {position === 2 && <Medal className="w-5 h-5" />}
                          {position === 3 && <Medal className="w-5 h-5" />}
                          {position > 3 && `#${position}`}
                        </div>

                        {/* Avatar */}
                        <div className={`relative rounded-full ${styles.avatar}`}>
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.display_name || u.username}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                              {(u.display_name || u.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {u.display_name || u.username}
                            </span>
                            {u.is_verified && (
                              <span className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white">✓</span>
                              </span>
                            )}
                            {u.is_premium && (
                              <span className="flex-shrink-0 text-yellow-400 text-sm">★</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">@{u.username}</div>
                        </div>

                        {/* Level Badge */}
                        <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                          <span className="text-purple-400 font-bold text-sm">Lvl {u.level}</span>
                        </div>
                      </div>

                      {/* Stats Grid Mobile */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <div className="text-yellow-400 font-bold">{u.ap_coins.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">AP Coins</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <div className="text-green-400 font-bold">{u.correct_predictions}/{u.total_predictions}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Aciertos</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <div className={`font-bold ${
                            parseFloat(winRate) >= 60 ? 'text-green-400' :
                            parseFloat(winRate) >= 40 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {winRate}%
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                      {/* Position */}
                      <div className="col-span-1">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${styles.badge}`}>
                          {position === 1 && <Crown className="w-5 h-5" />}
                          {position === 2 && <Medal className="w-5 h-5" />}
                          {position === 3 && <Medal className="w-5 h-5" />}
                          {position > 3 && `#${position}`}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`relative rounded-full ${styles.avatar}`}>
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.display_name || u.username}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                              {(u.display_name || u.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {u.display_name || u.username}
                            </span>
                            {u.is_verified && (
                              <span className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white">✓</span>
                              </span>
                            )}
                            {u.is_premium && (
                              <span className="flex-shrink-0 text-yellow-400 text-sm">★</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">@{u.username}</div>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="col-span-2 flex justify-center">
                        <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                          <span className="text-purple-400 font-bold">Lvl {u.level}</span>
                        </div>
                      </div>

                      {/* AP Coins */}
                      <div className="col-span-2 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-bold">{u.ap_coins.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Predictions */}
                      <div className="col-span-1 text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">
                            {u.correct_predictions}/{u.total_predictions}
                          </span>
                        </div>
                      </div>

                      {/* Win Rate */}
                      <div className="col-span-2 flex justify-center">
                        <div className={`relative px-4 py-2 rounded-xl border ${
                          parseFloat(winRate) >= 60
                            ? 'bg-green-500/10 border-green-500/30'
                            : parseFloat(winRate) >= 40
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          <span className={`font-bold text-lg ${
                            parseFloat(winRate) >= 60 ? 'text-green-400' :
                            parseFloat(winRate) >= 40 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {winRate}%
                          </span>
                          {/* Mini progress bar */}
                          <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                parseFloat(winRate) >= 60 ? 'bg-green-400' :
                                parseFloat(winRate) >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(parseFloat(winRate), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('leaderboard.noProphets')}</p>
            </div>
          )}
        </section>

        {/* Info Footer */}
        <section className="text-center text-xs sm:text-sm text-muted-foreground pb-4 sm:pb-8">
          <p>
            {t('leaderboard.infoText1')}
          </p>
          <p className="mt-2">
            {t('leaderboard.infoText2')} 📈
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}