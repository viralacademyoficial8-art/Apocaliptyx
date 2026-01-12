'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { scenariosService } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/stores';
import { formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Search, Filter, Flame, Users, Clock, TrendingUp,
  Loader2, AlertCircle, ChevronDown, X, Trophy, ShoppingBag, ArrowRight
} from 'lucide-react';
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from '@/components/animations';

// Tipo para escenarios
interface ScenarioData {
  id: string;
  title: string;
  description: string;
  category: string;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  participant_count: number;
  resolution_date: string;
  is_featured: boolean;
  is_hot: boolean;
  created_at: string;
}

// Tipo para stats del usuario
interface UserStats {
  apCoins: number;
  scenariosWon: number;
  scenariosCreated: number;
}

// Category keys for translations
const CATEGORY_KEYS = [
  'all', 'crypto', 'sports', 'technology', 'politics',
  'entertainment', 'economy', 'science', 'gaming', 'other'
];

export default function ExplorarPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  // Translated categories and sort options
  const CATEGORIES = [
    { key: 'all', label: t('common.all'), value: 'Todos' },
    { key: 'crypto', label: 'Crypto', value: 'Crypto' },
    { key: 'sports', label: t('home.categories.sports'), value: 'Deportes' },
    { key: 'technology', label: t('home.categories.technology'), value: 'Tecnología' },
    { key: 'politics', label: t('home.categories.politics'), value: 'Política' },
    { key: 'entertainment', label: t('home.categories.entertainment'), value: 'Entretenimiento' },
    { key: 'economy', label: t('home.categories.economy'), value: 'Economía' },
    { key: 'science', label: t('home.categories.science'), value: 'Ciencia' },
    { key: 'gaming', label: 'Gaming', value: 'Gaming' },
    { key: 'other', label: t('explore.other'), value: 'Otros' },
  ];

  const SORT_OPTIONS = [
    { value: 'recent', label: t('scenarios.sort.latest') },
    { value: 'popular', label: t('scenarios.sort.popular') },
    { value: 'pool', label: t('explore.highestPool') },
    { value: 'ending', label: t('scenarios.sort.ending') },
  ];

  // Estados
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    apCoins: 0,
    scenariosWon: 0,
    scenariosCreated: 0,
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar stats del usuario desde Supabase
  useEffect(() => {
    async function loadUserStats() {
      if (!isAuthenticated || !user?.id) return;

      const supabase = getSupabaseClient();

      try {
        // Obtener AP Coins del usuario
        const { data: userData } = await supabase
          .from('users')
          .select('ap_coins')
          .eq('id', user.id)
          .single();

        // Contar escenarios creados por el usuario
        const { count: scenariosCreated } = await supabase
          .from('scenarios')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id);

        // Contar predicciones ganadas (status = 'WON')
        const { count: scenariosWon } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'WON');

        setUserStats({
          apCoins: (userData as { ap_coins: number } | null)?.ap_coins || 0,
          scenariosWon: scenariosWon || 0,
          scenariosCreated: scenariosCreated || 0,
        });
      } catch (err) {
        console.error('Error loading user stats:', err);
      }
    }

    loadUserStats();
  }, [isAuthenticated, user?.id]);

  // Cargar escenarios de Supabase
  useEffect(() => {
    async function loadScenarios() {
      try {
        setLoading(true);
        const data = await scenariosService.getActive(50);
        setScenarios(data);
        setFilteredScenarios(data);
        setError(null);
      } catch (err) {
        console.error('Error loading scenarios:', err);
        setError(t('explore.loadError'));
      } finally {
        setLoading(false);
      }
    }

    loadScenarios();
  }, []);

  // Filtrar y ordenar escenarios
  useEffect(() => {
    let result = [...scenarios];

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.participant_count - a.participant_count);
        break;
      case 'pool':
        result.sort((a, b) => b.total_pool - a.total_pool);
        break;
      case 'ending':
        result.sort((a, b) => 
          new Date(a.resolution_date).getTime() - new Date(b.resolution_date).getTime()
        );
        break;
      case 'recent':
      default:
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    setFilteredScenarios(result);
  }, [scenarios, searchQuery, selectedCategory, sortBy]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todos');
    setSortBy('recent');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Todos' || sortBy !== 'recent';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* User Stats Section - Only when authenticated */}
        {isAuthenticated && user && (
          <FadeInView direction="up" delay={0.05}>
            <div className="space-y-6">
              {/* Welcome Header */}
              <section>
                <p className="text-xs text-zinc-400">{t('dashboard.welcomeBack')}</p>
                <h1 className="text-2xl font-bold text-zinc-50">
                  {user.displayName || user.username}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('dashboard.memberSince')} {formatDate(user.createdAt)}
                </p>
              </section>

              {/* Stats Cards - Datos reales de Supabase */}
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StaggerItem>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.apCoins')}</p>
                      <p className="text-xl font-bold">
                        {userStats.apCoins.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.scenariosWon')}</p>
                      <p className="text-xl font-bold">{userStats.scenariosWon}</p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.scenariosCreated')}</p>
                      <p className="text-xl font-bold">{userStats.scenariosCreated}</p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Featured Scenarios Section */}
              {scenarios.filter(s => s.is_featured || s.is_hot).length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      {t('dashboard.featuredScenarios')}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedCategory('Todos');
                        setSortBy('popular');
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenarios
                      .filter(s => s.is_featured || s.is_hot)
                      .slice(0, 6)
                      .map((scenario) => (
                        <ScenarioCard key={scenario.id} scenario={scenario} />
                      ))}
                  </div>
                </section>
              )}

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/tienda')}
                  className="p-5 rounded-xl bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all text-left"
                >
                  <h3 className="font-semibold text-white mb-1">{t('dashboard.goToShop')}</h3>
                  <p className="text-sm text-zinc-400">{t('dashboard.shopDescription')}</p>
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="p-5 rounded-xl bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all text-left"
                >
                  <h3 className="font-semibold text-white mb-1">{t('dashboard.viewLeaderboard')}</h3>
                  <p className="text-sm text-zinc-400">{t('dashboard.leaderboardDescription')}</p>
                </button>
              </div>
            </div>
          </FadeInView>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('explore.title')}</h1>
          <p className="text-gray-400">
            {t('explore.subtitle')}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={`${t('common.search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              {t('common.filter')}
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
              {/* Categories */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('scenarios.create.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('leaderboard.sortByLabel')}</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {t('explore.clearFilters')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-400">
          {filteredScenarios.length} {t('explore.scenariosFound')}
        </div>

        {/* Scenarios grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">{t('dashboard.loadingScenarios')}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              {t('errors.serverError.retry')}
            </button>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">{t('explore.noScenarios')}</p>
            <p className="text-gray-500 text-sm mb-4">
              {hasActiveFilters
                ? t('explore.tryOtherFilters')
                : t('explore.beFirstToCreate')
              }
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
              >
                {t('explore.clearFilters')}
              </button>
            ) : (
              <button
                onClick={() => router.push('/crear')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                {t('scenarios.createScenario')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Componente de tarjeta de escenario
function ScenarioCard({ scenario }: { scenario: ScenarioData }) {
  const router = useRouter();
  const { t } = useTranslation();
  const yesPercent = scenario.total_pool > 0
    ? Math.round((scenario.yes_pool / scenario.total_pool) * 100)
    : 50;
  const noPercent = 100 - yesPercent;

  const daysLeft = Math.ceil(
    (new Date(scenario.resolution_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={() => router.push(`/escenario/${scenario.id}`)}
      className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-purple-500/50 hover:bg-gray-900 transition-all cursor-pointer group"
    >
      {/* Category & badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
          {scenario.category}
        </span>
        {scenario.is_featured && (
          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
            ⭐ {t('shop.item.featured')}
          </span>
        )}
        {scenario.is_hot && (
          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
            🔥 {t('scenarios.card.hot')}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors text-lg">
        {scenario.title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {scenario.description}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400 font-medium">{t('common.yes')} {yesPercent}%</span>
          <span className="text-red-400 font-medium">{t('common.no')} {noPercent}%</span>
        </div>
        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${yesPercent}%` }}
          />
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${noPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-yellow-500" />
          <span>{scenario.total_pool.toLocaleString()} AP</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{scenario.participant_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className={daysLeft <= 3 ? 'text-red-400' : ''}>
            {daysLeft > 0 ? `${daysLeft}d` : t('scenarios.card.closed')}
          </span>
        </div>
      </div>
    </div>
  );
}