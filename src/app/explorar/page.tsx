'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { scenariosService } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/lib/stores';
import { formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Search, Filter, Flame, Users, Clock, TrendingUp,
  Loader2, AlertCircle, ChevronDown, X, Trophy, ShoppingBag, ArrowRight, Swords, User, Crown, Infinity
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
  creator_id: string;
  current_holder_id?: string | null;
  creator_username?: string;
  holder_username?: string;
  steal_count?: number;
  theft_pool?: number;
  current_price?: number;
}

// Tipo para stats del usuario
interface UserStats {
  apCoins: number;
  scenariosWon: number;
  scenariosCreated: number;
  scenariosStolen: number;
}

// Category keys for translations
const CATEGORY_KEYS = [
  'all', 'crypto', 'sports', 'technology', 'politics',
  'entertainment', 'economy', 'science', 'gaming', 'other'
];

export default function ExplorarPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, refreshBalance } = useAuthStore();
  const { hasInfiniteCoins } = usePermissions();

  // Verificar autenticación usando session de NextAuth (más confiable)
  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Usar datos de Zustand si existen, sino crear objeto temporal de session
  const currentUser = user || (session?.user ? {
    id: session.user.id || "",
    email: session.user.email || "",
    username: (session.user as { username?: string }).username || session.user.email?.split("@")[0] || "user",
    displayName: session.user.name || "Usuario",
    avatarUrl: session.user.image || "",
    createdAt: new Date(),
    role: (session.user as { role?: string }).role || "USER",
  } : null);

  // Cargar datos del usuario desde la BD cuando esté autenticado
  useEffect(() => {
    if (status === "authenticated" && session?.user && !user) {
      refreshBalance();
    }
  }, [status, session, user, refreshBalance]);

  // Translated categories and sort options
  // 'value' is the DB value (UPPERCASE), 'label' is the display name
  const CATEGORIES = [
    { key: 'all', label: t('common.all'), value: 'Todos' },
    { key: 'featured', label: '⭐ Destacados', value: 'Destacados' },
    { key: 'sports', label: t('home.categories.sports'), value: 'DEPORTES' },
    { key: 'technology', label: t('home.categories.technology'), value: 'TECNOLOGIA' },
    { key: 'politics', label: t('home.categories.politics'), value: 'POLITICA' },
    { key: 'entertainment', label: t('home.categories.entertainment'), value: 'ENTRETENIMIENTO' },
    { key: 'economy', label: t('home.categories.economy'), value: 'ECONOMIA' },
    { key: 'war', label: '⚔️ Guerra', value: 'GUERRA' },
    { key: 'health', label: '🏥 Salud', value: 'SALUD' },
    { key: 'science', label: t('home.categories.science'), value: 'CIENCIA' },
    { key: 'farandula', label: '🎭 Farándula', value: 'FARANDULA' },
    { key: 'other', label: t('explore.other'), value: 'OTROS' },
  ];

  const SORT_OPTIONS = [
    { value: 'newest', label: '🆕 Más recientes' },
    { value: 'trending', label: '🔥 Tendencias' },
    { value: 'mostStolen', label: '⚔️ Más robados' },
    { value: 'mostVoted', label: '🗳️ Más votados' },
    { value: 'popular', label: '👥 Más populares' },
    { value: 'pool', label: '💰 Mayor pool' },
    { value: 'ending', label: '⏰ Por terminar' },
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
    scenariosStolen: 0,
  });
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  // Search dropdown
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<ScenarioData[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Trending searches for scenarios
  const trendingSearches = ['Bitcoin', 'Trump', 'IA', 'Mundial', 'Crypto'];

  // Cargar stats del usuario desde Supabase
  useEffect(() => {
    async function loadUserStats() {
      // Usar isLoggedIn y currentUser para mayor confiabilidad
      if (!isLoggedIn || !currentUser?.id) return;

      const supabase = getSupabaseClient();

      try {
        // Obtener AP Coins y fecha de creación del usuario
        const { data: userData } = await supabase
          .from('users')
          .select('ap_coins, created_at')
          .eq('id', currentUser.id)
          .single();

        // Contar escenarios creados por el usuario
        const { count: scenariosCreated } = await supabase
          .from('scenarios')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', currentUser.id);

        // Contar predicciones ganadas (status = 'WON')
        const { count: scenariosWon } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .eq('status', 'WON');

        // Contar escenarios robados (thief_id = user.id)
        const { count: scenariosStolen } = await supabase
          .from('scenario_steal_history')
          .select('*', { count: 'exact', head: true })
          .eq('thief_id', currentUser.id);

        setUserStats({
          apCoins: (userData as { ap_coins: number } | null)?.ap_coins || 0,
          scenariosWon: scenariosWon || 0,
          scenariosCreated: scenariosCreated || 0,
          scenariosStolen: scenariosStolen || 0,
        });

        // Establecer la fecha de creación real del usuario
        const createdAt = (userData as { created_at?: string } | null)?.created_at;
        if (createdAt) {
          setUserCreatedAt(new Date(createdAt));
        }
      } catch (err) {
        console.error('Error loading user stats:', err);
      }
    }

    loadUserStats();
  }, [isLoggedIn, currentUser?.id]);

  // Función para cargar escenarios de Supabase
  const loadScenarios = useCallback(async () => {
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
  }, [t]);

  // Cargar escenarios al montar y cuando la página vuelve a ser visible
  useEffect(() => {
    // Cargar al montar
    loadScenarios();

    // Recargar cuando el usuario vuelve a la pestaña/página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadScenarios();
      }
    };

    // Recargar cuando el usuario navega de vuelta (popstate/focus)
    const handleFocus = () => {
      loadScenarios();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadScenarios]);

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
      if (selectedCategory === 'Destacados') {
        // Filtrar por escenarios destacados o hot
        result = result.filter(s => s.is_featured || s.is_hot);
      } else {
        // Case-insensitive comparison to handle both old lowercase and new UPPERCASE categories
        result = result.filter(s => s.category?.toUpperCase() === selectedCategory.toUpperCase());
      }
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        // Ordenar por más recientes (fecha de creación)
        result.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'trending':
        // Ordenamiento tendencias: 1) Más robados, 2) Más votados
        result.sort((a, b) => {
          const stealDiff = (b.steal_count || 0) - (a.steal_count || 0);
          if (stealDiff !== 0) return stealDiff;
          return b.participant_count - a.participant_count;
        });
        break;
      case 'mostStolen':
        // Ordenar solo por más robados
        result.sort((a, b) => (b.steal_count || 0) - (a.steal_count || 0));
        break;
      case 'mostVoted':
        // Ordenar solo por más votados (participantes)
        result.sort((a, b) => b.participant_count - a.participant_count);
        break;
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
      default:
        // Por defecto, ordenar por más recientes
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
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Todos' || sortBy !== 'newest';

  // Cargar búsquedas recientes al montar
  useEffect(() => {
    const saved = localStorage.getItem('recentScenarioSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar resultados rápidos cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setQuickResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = scenarios
      .filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      )
      .slice(0, 5);

    setQuickResults(results);
  }, [searchQuery, scenarios]);

  // Guardar búsqueda reciente
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentScenarioSearches', JSON.stringify(updated));
  };

  // Ejecutar búsqueda
  const handleSearchSubmit = (query?: string) => {
    const finalQuery = query ?? searchQuery;
    if (!finalQuery.trim()) return;

    saveRecentSearch(finalQuery);
    setSearchQuery(finalQuery);
    setIsSearchOpen(false);
  };

  // Manejar teclas en el input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  // Navegar a un escenario
  const handleQuickResultClick = (scenarioId: string) => {
    setIsSearchOpen(false);
    router.push(`/escenario/${scenarioId}`);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    setQuickResults([]);
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* User Stats Section - Only when authenticated */}
        {isLoggedIn && currentUser && (
          <FadeInView direction="up" delay={0.05}>
            <div className="space-y-6">
              {/* Welcome Header */}
              <section>
                <p className="text-xs text-zinc-400">{t('dashboard.welcomeBack')}</p>
                <h1 className="text-2xl font-bold text-zinc-50">
                  {currentUser.displayName || currentUser.username}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('dashboard.memberSince')} {formatDate(userCreatedAt || new Date(currentUser.createdAt))}
                </p>
              </section>

              {/* Stats Cards - Datos reales de Supabase (Clickeables) */}
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StaggerItem>
                  <div
                    onClick={() => router.push('/tienda')}
                    className={`rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${
                      hasInfiniteCoins
                        ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-orange-500/50 hover:bg-zinc-900'
                    }`}
                  >
                    <Flame className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.apCoins')}</p>
                      {hasInfiniteCoins ? (
                        <div className="flex items-center gap-1">
                          <Infinity className="w-6 h-6 text-yellow-400" />
                          <span className="text-xs text-yellow-500/70">∞</span>
                        </div>
                      ) : (
                        <p className="text-xl font-bold">
                          {userStats.apCoins.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div
                    onClick={() => router.push('/perfil/historial')}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3 cursor-pointer hover:border-yellow-500/50 hover:bg-zinc-900 transition-all"
                  >
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.scenariosWon')}</p>
                      <p className="text-xl font-bold">{userStats.scenariosWon}</p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div
                    onClick={() => router.push(`/perfil/${currentUser.username}`)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900 transition-all"
                  >
                    <ShoppingBag className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.scenariosCreated')}</p>
                      <p className="text-xl font-bold">{userStats.scenariosCreated}</p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div
                    onClick={() => currentUser?.username && router.push(`/perfil/${currentUser.username}/escenarios-robados`)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3 cursor-pointer hover:border-red-500/50 hover:bg-zinc-900 transition-all"
                  >
                    <Swords className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{t('dashboard.scenariosStolen')}</p>
                      <p className="text-xl font-bold">{userStats.scenariosStolen}</p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Featured Scenarios Section - Los más interactuados de toda la plataforma */}
              {scenarios.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      {t('dashboard.featuredScenarios')}
                    </h2>
                    <div className="flex items-center gap-2">
                      {/* Filter button */}
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                          showFilters
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        {t('common.filter')}
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById('todos-los-escenarios')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filters panel */}
                  {showFilters && (
                    <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                      {/* Categories */}
                      <div>
                        <label className="text-sm text-zinc-400 mb-2 block">{t('scenarios.create.category')}</label>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.key}
                              onClick={() => {
                                setSelectedCategory(cat.value);
                                // Scroll to results section
                                setTimeout(() => {
                                  document.getElementById('todos-los-escenarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedCategory === cat.value
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="text-sm text-zinc-400 mb-2 block">{t('leaderboard.sortByLabel')}</label>
                        <div className="flex flex-wrap gap-2">
                          {SORT_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value);
                                // Scroll to results section
                                setTimeout(() => {
                                  document.getElementById('todos-los-escenarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                sortBy === option.value
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clear filters */}
                      {(selectedCategory !== 'Todos' || sortBy !== 'newest') && (
                        <button
                          onClick={() => {
                            setSelectedCategory('Todos');
                            setSortBy('newest');
                          }}
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          {t('explore.clearFilters')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Grid de escenarios destacados - ordenados por más interactuados */}
                  {(() => {
                    const sortedScenarios = [...scenarios].sort((a, b) => {
                      // Algoritmo: prioridad a los más robados, luego los más votados
                      const scoreA = (a.steal_count || 0) * 2 + a.participant_count;
                      const scoreB = (b.steal_count || 0) * 2 + b.participant_count;
                      return scoreB - scoreA;
                    });
                    const visibleScenarios = showAllFeatured ? sortedScenarios : sortedScenarios.slice(0, 6);
                    const remainingCount = sortedScenarios.length - 6;

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {visibleScenarios.map((scenario) => (
                            <ScenarioCard key={scenario.id} scenario={scenario} />
                          ))}
                        </div>

                        {/* Botón Ver más / Ver menos */}
                        {sortedScenarios.length > 6 && (
                          <button
                            onClick={() => setShowAllFeatured(!showAllFeatured)}
                            className="w-full mt-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/70 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllFeatured ? 'rotate-180' : ''}`} />
                            {showAllFeatured ? 'Ver menos' : `Ver ${remainingCount} más`}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </section>
              )}

            </div>
          </FadeInView>
        )}

        {/* All Scenarios Section - Con filtros aplicados */}
        <section id="todos-los-escenarios" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Todos los Escenarios
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredScenarios.length} {t('explore.scenariosFound')})
              </span>
            </h2>
          </div>

          {/* Grid de todos los escenarios filtrados */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-3 text-muted-foreground">{t('dashboard.loadingScenarios')}</span>
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
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">{t('explore.noScenarios')}</p>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? t('explore.tryOtherFilters')
                  : t('explore.beFirstToCreate')
                }
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg"
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
        </section>

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

  // Determinar si fue robado (holder diferente al creador)
  const wasStolen = scenario.current_holder_id && scenario.current_holder_id !== scenario.creator_id;

  // Calcular el valor AP correcto: theft_pool si existe, sino total_pool, sino current_price
  const displayPool = (scenario.theft_pool && scenario.theft_pool > 0)
    ? scenario.theft_pool
    : (scenario.total_pool > 0 ? scenario.total_pool : (scenario.current_price || 0));

  return (
    <div
      onClick={() => router.push(`/escenario/${scenario.id}`)}
      className="rounded-xl border border-border bg-card/60 p-5 hover:border-purple-500/50 hover:bg-card transition-all cursor-pointer group"
    >
      {/* Category & badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
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
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors text-lg">
        {scenario.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
        {scenario.description}
      </p>

      {/* Creator & Owner Tags */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {scenario.creator_username && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 hover:border-blue-500/40 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/perfil/${scenario.creator_username}`);
            }}
          >
            <User className="w-3 h-3" />
            {t('scenarios.card.createdBy')} @{scenario.creator_username}
          </span>
        )}
        {wasStolen && scenario.holder_username && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/perfil/${scenario.holder_username}`);
            }}
          >
            <Crown className="w-3 h-3" />
            {t('scenarios.card.ownedBy')} @{scenario.holder_username}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400 font-medium">{t('common.yes')} {yesPercent}%</span>
          <span className="text-red-400 font-medium">{t('common.no')} {noPercent}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
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
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-yellow-500" />
          <span>{displayPool.toLocaleString()} AP</span>
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