'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usersService } from '@/services';
import { getSupabaseClient } from '@/lib/supabase';
import {
  BarChart3,
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Loader2,
  AlertCircle,
  Zap,
  Clock,
  DollarSign,
  Activity,
  PieChart,
  Crown,
  Flame,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalScenarios: number;
  activeScenarios: number;
  resolvedScenarios: number;
  totalPredictions: number;
  totalPool: number;
  avgWinRate: number;
  totalAP: number;
  topPredictors: number;
}

interface UserData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  ap_coins: number;
  level: number;
  total_predictions: number;
  correct_predictions: number;
  is_verified: boolean;
}

interface ScenarioData {
  id: string;
  status: string;
  category: string;
  total_pool: number;
}

interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export default function EstadisticasPage() {
  const router = useRouter();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [topUsers, setTopUsers] = useState<UserData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const supabase = getSupabaseClient();

        // Load users for stats
        const users = await usersService.getLeaderboard(100);
        setTopUsers(users.slice(0, 5));

        // Calculate user stats
        const totalUsers = users.length;
        const totalAP = users.reduce((sum, u) => sum + u.ap_coins, 0);
        const avgWinRate = users.length > 0
          ? users.reduce((sum, u) => {
              const rate = u.total_predictions > 0
                ? (u.correct_predictions / u.total_predictions) * 100
                : 0;
              return sum + rate;
            }, 0) / users.length
          : 0;
        const topPredictors = users.filter((u) => {
          const rate = u.total_predictions > 0
            ? (u.correct_predictions / u.total_predictions) * 100
            : 0;
          return rate >= 60 && u.total_predictions >= 5;
        }).length;

        // Load scenario stats
        const { data: scenariosData, error: scenariosError } = await supabase
          .from('scenarios')
          .select('id, status, category, total_pool');

        if (scenariosError) throw scenariosError;

        const scenarios = scenariosData as ScenarioData[] | null;

        const totalScenarios = scenarios?.length || 0;
        const activeScenarios = scenarios?.filter((s) => s.status === 'ACTIVE').length || 0;
        const resolvedScenarios = scenarios?.filter((s) => s.status === 'RESOLVED').length || 0;
        const totalPool = scenarios?.reduce((sum, s) => sum + (s.total_pool || 0), 0) || 0;

        // Category stats
        const categoryMap: Record<string, number> = {};
        scenarios?.forEach((s) => {
          const cat = s.category || 'OTROS';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const categoryColors: Record<string, string> = {
          TECNOLOGIA: '#3B82F6',
          POLITICA: '#EF4444',
          DEPORTES: '#22C55E',
          FARANDULA: '#EC4899',
          GUERRA: '#F97316',
          ECONOMIA: '#EAB308',
          SALUD: '#14B8A6',
          CIENCIA: '#8B5CF6',
          ENTRETENIMIENTO: '#F43F5E',
          OTROS: '#6B7280',
        };

        const categoryStatsArr: CategoryStat[] = Object.entries(categoryMap)
          .map(([category, count]) => ({
            category,
            count,
            percentage: totalScenarios > 0 ? (count / totalScenarios) * 100 : 0,
            color: categoryColors[category] || '#6B7280',
          }))
          .sort((a, b) => b.count - a.count);

        setCategoryStats(categoryStatsArr);

        // Load predictions count
        const { count: totalPredictions } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers,
          totalScenarios,
          activeScenarios,
          resolvedScenarios,
          totalPredictions: totalPredictions || 0,
          totalPool,
          avgWinRate,
          totalAP,
          topPredictors,
        });

        setError(null);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-400">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400 mb-4">{error || 'Error desconocido'}</p>
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Estadísticas</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Métricas y análisis de la plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Actualizado en tiempo real</span>
          </div>
        </header>

        {/* Main Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div
            onClick={() => router.push('/comunidad')}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4 cursor-pointer hover:from-blue-500/30 hover:to-blue-600/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-blue-400/70">Usuarios</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalUsers}</div>
            <div className="text-sm text-gray-400 mt-1">Profetas activos</div>
          </div>

          {/* Total Scenarios */}
          <div
            onClick={() => router.push('/explorar')}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4 cursor-pointer hover:from-purple-500/30 hover:to-purple-600/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400/70">Escenarios</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.totalScenarios}</div>
            <div className="text-sm text-gray-400 mt-1">Escenarios totales</div>
          </div>

          {/* Total Predictions */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400/70">Predicciones</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.totalPredictions.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">Predicciones hechas</div>
          </div>

          {/* Total Pool */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <span className="text-xs text-yellow-400/70">Pool Total</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.totalPool.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">AP Coins en juego</div>
          </div>
        </section>

        {/* Secondary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Estado de Escenarios
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-400">Activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-400">{stats.activeScenarios}</span>
                  <span className="text-xs text-gray-500">
                    ({stats.totalScenarios > 0 ? ((stats.activeScenarios / stats.totalScenarios) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-400">Resueltos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-400">{stats.resolvedScenarios}</span>
                  <span className="text-xs text-gray-500">
                    ({stats.totalScenarios > 0 ? ((stats.resolvedScenarios / stats.totalScenarios) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-gray-400">Otros</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400">
                    {stats.totalScenarios - stats.activeScenarios - stats.resolvedScenarios}
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${stats.totalScenarios > 0 ? (stats.activeScenarios / stats.totalScenarios) * 100 : 0}%` }}
                />
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${stats.totalScenarios > 0 ? (stats.resolvedScenarios / stats.totalScenarios) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Win Rate Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Rendimiento Global
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Win Rate Promedio</span>
                  <span className={`font-bold text-2xl ${
                    stats.avgWinRate >= 50 ? 'text-green-400' :
                    stats.avgWinRate >= 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {stats.avgWinRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stats.avgWinRate >= 50 ? 'bg-green-500' :
                      stats.avgWinRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.avgWinRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Top Predictores</span>
                  </div>
                  <span className="font-bold text-yellow-400">{stats.topPredictors}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Usuarios con 60%+ win rate</p>
              </div>

              <div className="pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Total AP en Circulación</span>
                  </div>
                  <span className="font-bold text-purple-400">{stats.totalAP.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Prophets */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Top Profetas
            </h3>
            <div className="space-y-3">
              {topUsers.map((user, index) => {
                const winRate = user.total_predictions > 0
                  ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(0)
                  : '0';
                return (
                  <div
                    key={user.id}
                    onClick={() => router.push(`/perfil/${user.username}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-amber-600/20 text-amber-500' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name || user.username}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {(user.display_name || user.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{user.display_name || user.username}</div>
                      <div className="text-xs text-gray-500">{user.ap_coins.toLocaleString()} AP</div>
                    </div>
                    <div className="text-xs text-green-400">{winRate}%</div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => router.push('/leaderboard')}
              className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              Ver ranking completo
            </button>
          </div>
        </section>

        {/* Categories Distribution */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Distribución por Categoría
          </h3>

          {categoryStats.length > 0 ? (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.count}</span>
                      <span className="text-xs text-gray-500">({cat.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de categorías disponibles</p>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/comunidad')}
            className="flex items-center justify-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-blue-400">Ver Comunidad</span>
          </button>

          <button
            onClick={() => router.push('/leaderboard')}
            className="flex items-center justify-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition-colors"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-yellow-400">Ver Rankings</span>
          </button>

          <button
            onClick={() => router.push('/explorar')}
            className="flex items-center justify-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors"
          >
            <Target className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-purple-400">Explorar Escenarios</span>
          </button>
        </section>
      </div>

      <Footer />
    </div>
  );
}
