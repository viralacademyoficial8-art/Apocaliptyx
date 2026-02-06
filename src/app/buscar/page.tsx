'use client';

export const dynamic = 'force-dynamic';


import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { LandingNavbar } from '@/components/LandingNavbar';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Search,
  Loader2,
  Filter,
  X,
  Flame,
  Users,
  Clock,
  TrendingUp,
  User,
  Trophy,
  Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  participant_count: number;
  resolution_date: string;
  is_featured: boolean;
  is_hot: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  ap_coins: number;
  is_verified: boolean;
  total_predictions: number;
  correct_predictions: number;
}

const CATEGORIES = [
  'Todos',
  'Crypto',
  'Deportes',
  'Tecnología',
  'Política',
  'Entretenimiento',
  'Economía',
  'Ciencia',
  'Gaming',
  'Otros'
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'pool', label: 'Mayor pool' },
  { value: 'ending', label: 'Por terminar' },
];

function SearchContent() {
  const supabase = getSupabaseBrowser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'escenarios' | 'profetas'>('escenarios');

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Guardar búsqueda reciente
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Buscar escenarios y usuarios
  const searchAll = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      // Buscar escenarios
      let scenarioQuery = supabase
        .from('scenarios')
        .select('*')
        .eq('status', 'ACTIVE');

      // Filtrar por búsqueda
      if (searchQuery.trim()) {
        scenarioQuery = scenarioQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Filtrar por categoría
      if (selectedCategory !== 'Todos') {
        scenarioQuery = scenarioQuery.eq('category', selectedCategory);
      }

      // Ordenar escenarios
      switch (sortBy) {
        case 'popular':
          scenarioQuery = scenarioQuery.order('participant_count', { ascending: false });
          break;
        case 'pool':
          scenarioQuery = scenarioQuery.order('total_pool', { ascending: false });
          break;
        case 'ending':
          scenarioQuery = scenarioQuery.order('resolution_date', { ascending: true });
          break;
        case 'recent':
        default:
          scenarioQuery = scenarioQuery.order('created_at', { ascending: false });
      }

      // Buscar usuarios
      let userQuery = supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio, level, ap_coins, is_verified, total_predictions, correct_predictions')
        .eq('is_banned', false);

      if (searchQuery.trim()) {
        userQuery = userQuery.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }

      userQuery = userQuery.order('level', { ascending: false }).limit(50);

      // Ejecutar ambas búsquedas en paralelo
      const [scenariosResult, usersResult] = await Promise.all([
        scenarioQuery.limit(50),
        userQuery
      ]);

      if (scenariosResult.error) throw scenariosResult.error;
      if (usersResult.error) throw usersResult.error;

      setScenarios(scenariosResult.data || []);
      setUsers(usersResult.data || []);

      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy]);

  // Buscar al cargar y cuando cambian filtros
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    searchAll(urlQuery);
  }, [searchParams, searchAll]);

  // Manejar búsqueda
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  };

  // Limpiar búsquedas recientes
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Buscar
            </h1>
          </div>
          <p className="text-muted-foreground">
            Encuentra escenarios y profetas
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar escenarios, profetas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-24 py-6 text-lg bg-card border-border focus-visible:ring-purple-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    router.push('/buscar');
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
              </Button>
            </div>
          </div>
        </form>

        {/* Búsquedas recientes */}
        {!query && recentSearches.length > 0 && (
          <div className="mb-8 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Búsquedas recientes</h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recentQuery, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(recentQuery);
                    router.push(`/buscar?q=${encodeURIComponent(recentQuery)}`);
                  }}
                  className="px-3 py-1.5 bg-muted hover:bg-purple-500/20 hover:text-purple-400 rounded-full text-sm transition-colors"
                >
                  {recentQuery}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                : 'bg-card border-border text-muted-foreground hover:border-border'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {showFilters && (
            <div className="mt-4 p-4 bg-card border border-border rounded-lg space-y-4">
              {/* Categorías */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-purple-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Ordenar por</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aplicar filtros */}
              <Button
                onClick={() => searchAll(query)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Aplicar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Pestañas de resultados */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('escenarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'escenarios'
                ? 'bg-purple-500 text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-border'
            }`}
          >
            <Search className="w-4 h-4" />
            Escenarios
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
              {scenarios.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('profetas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profetas'
                ? 'bg-purple-500 text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-border'
            }`}
          >
            <User className="w-4 h-4" />
            Profetas
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </button>
        </div>

        {/* Resultados */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'escenarios'
                ? `${scenarios.length} escenario${scenarios.length !== 1 ? 's' : ''} encontrado${scenarios.length !== 1 ? 's' : ''}`
                : `${users.length} profeta${users.length !== 1 ? 's' : ''} encontrado${users.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-3 text-muted-foreground">Buscando...</span>
            </div>
          ) : activeTab === 'escenarios' ? (
            scenarios.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron escenarios</h3>
                <p className="text-muted-foreground">
                  {query ? 'Intenta con otros términos de búsqueda' : 'Busca escenarios por título o descripción'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            )
          ) : (
            users.length === 0 ? (
              <div className="text-center py-20">
                <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron profetas</h3>
                <p className="text-muted-foreground">
                  {query ? 'Intenta con otros términos de búsqueda' : 'Busca profetas por nombre de usuario'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

// Componente de tarjeta de escenario
function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
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
      className="rounded-xl border border-border bg-card p-5 hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
    >
      {/* Category & badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full uppercase">
          {scenario.category}
        </span>
        {scenario.is_featured && (
          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
            ⭐ Destacado
          </span>
        )}
        {scenario.is_hot && (
          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
            🔥 Hot
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors text-lg">
        {scenario.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {scenario.description}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400 font-medium">Sí {yesPercent}%</span>
          <span className="text-red-400 font-medium">No {noPercent}%</span>
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
          <span>{scenario.total_pool.toLocaleString()} AP</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{scenario.participant_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className={daysLeft <= 3 ? 'text-red-400' : ''}>
            {daysLeft > 0 ? `${daysLeft}d` : 'Cerrado'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de usuario (profeta)
function UserCard({ user }: { user: UserProfile }) {
  const router = useRouter();
  const accuracy = user.total_predictions > 0
    ? Math.round((user.correct_predictions / user.total_predictions) * 100)
    : 0;

  return (
    <div
      onClick={() => router.push(`/perfil/${user.username}`)}
      className="rounded-xl border border-border bg-card p-5 hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
    >
      {/* Header con avatar y verificación */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xl font-bold">
              {user.username[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-purple-300 transition-colors truncate">
              {user.display_name || user.username}
            </h3>
            {user.is_verified && (
              <span className="text-blue-400 flex-shrink-0">✓</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {user.bio}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{user.level}</span>
          </div>
          <p className="text-xs text-muted-foreground">Nivel</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400">
            <Target className="w-4 h-4" />
            <span className="font-semibold">{accuracy}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Precisión</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{user.ap_coins.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">AP</p>
        </div>
      </div>

      {/* Predicciones */}
      <div className="mt-3 text-center">
        <span className="text-xs text-muted-foreground">
          {user.total_predictions} predicciones · {user.correct_predictions} correctas
        </span>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}