'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Star,
  Award,
  Zap,
  Calendar,
  BarChart3,
  Activity,
  Crown,
  Medal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamificationData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  apCoins: number;
  rank: {
    name: string;
    nameEs: string;
    icon: string;
    color: string;
  };
  streak: {
    current: number;
    longest: number;
    lastLoginDate: string;
  };
  stats: {
    predictionsTotal: number;
    predictionsCorrect: number;
    predictionsWinRate: number;
    communitiesJoined: number;
    postsCreated: number;
    reactionsReceived: number;
    tournamentsWon: number;
    achievementsUnlocked: number;
  };
  weeklyActivity: number[];
  monthlyXp: number[];
}

interface GamificationStatsProps {
  userId: string;
  compact?: boolean;
}

export function GamificationStats({ userId, compact = false }: GamificationStatsProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      const response = await fetch(`/api/gamification/profile?userId=${userId}`);
      const result = await response.json();

      if (result.profile) {
        setData({
          level: result.profile.level || 1,
          xp: result.profile.current_xp || 0,
          xpToNextLevel: result.profile.xp_to_next_level || 1000,
          apCoins: result.profile.ap_coins || 0,
          rank: result.profile.rank || {
            name: 'Novice',
            nameEs: 'Novato',
            icon: '🌱',
            color: '#9CA3AF',
          },
          streak: {
            current: result.profile.login_streak || 0,
            longest: result.profile.longest_streak || 0,
            lastLoginDate: result.profile.last_login_date || new Date().toISOString(),
          },
          stats: {
            predictionsTotal: result.profile.predictions_total || 0,
            predictionsCorrect: result.profile.predictions_correct || 0,
            predictionsWinRate: result.profile.predictions_win_rate || 0,
            communitiesJoined: result.profile.communities_joined || 0,
            postsCreated: result.profile.posts_created || 0,
            reactionsReceived: result.profile.reactions_received || 0,
            tournamentsWon: result.profile.tournaments_won || 0,
            achievementsUnlocked: result.profile.achievements_unlocked || 0,
          },
          weeklyActivity: result.profile.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
          monthlyXp: result.profile.monthly_xp || [0, 0, 0, 0],
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const xpProgress = (data.xp / data.xpToNextLevel) * 100;

  // Simple bar chart component
  const BarChart = ({ values, labels, color }: { values: number[]; labels: string[]; color: string }) => {
    const max = Math.max(...values, 1);
    return (
      <div className="flex items-end justify-between gap-1 h-20">
        {values.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn('w-full rounded-t transition-all duration-500', color)}
              style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
            />
            <span className="text-[10px] text-muted-foreground">{labels[i]}</span>
          </div>
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{data.rank.icon}</span>
            <div>
              <p className="font-bold text-white">Nivel {data.level}</p>
              <p className="text-sm text-muted-foreground">{data.rank.nameEs}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-orange-400">{data.streak.current} días</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {data.xp.toLocaleString()} / {data.xpToNextLevel.toLocaleString()} XP
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level & Rank Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${data.rank.color}20` }}
            >
              {data.rank.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Nivel {data.level}</p>
              <p className="text-lg" style={{ color: data.rank.color }}>{data.rank.nameEs}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">{data.apCoins.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">AP Coins</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso de nivel</span>
            <span className="text-purple-400">{Math.round(xpProgress)}%</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data.xp.toLocaleString()} XP</span>
            <span>{data.xpToNextLevel.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-xl p-5 border border-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{data.streak.current} días</p>
              <p className="text-sm text-muted-foreground">Racha actual</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{data.streak.longest}</p>
            <p className="text-xs text-muted-foreground">Mejor racha</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Predicciones"
          value={data.stats.predictionsTotal}
          subValue={`${data.stats.predictionsWinRate}% win rate`}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Torneos Ganados"
          value={data.stats.tournamentsWon}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Logros"
          value={data.stats.achievementsUnlocked}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Reacciones"
          value={data.stats.reactionsReceived}
          color="text-pink-400"
          bgColor="bg-pink-500/10"
        />
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Actividad Semanal</h3>
          </div>
          <BarChart
            values={data.weeklyActivity}
            labels={['L', 'M', 'X', 'J', 'V', 'S', 'D']}
            color="bg-green-500"
          />
        </div>

        {/* Monthly XP */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">XP Mensual</h3>
          </div>
          <BarChart
            values={data.monthlyXp}
            labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* More Stats */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-border">
        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Estadísticas Detalladas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <DetailStat label="Predicciones Correctas" value={data.stats.predictionsCorrect} />
          {/* COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
          <DetailStat label="Comunidades" value={data.stats.communitiesJoined} />
          */}
          <DetailStat label="Posts Creados" value={data.stats.postsCreated} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={cn('rounded-xl p-4 border border-border', bgColor)}>
      <div className={cn('mb-2', color)}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-muted/50 rounded-lg">
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default GamificationStats;
