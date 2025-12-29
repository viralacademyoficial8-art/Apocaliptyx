'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { scenariosService } from '@/services';
import { 
  Search, Filter, Flame, Users, Clock, TrendingUp, 
  Loader2, AlertCircle, ChevronDown, X
} from 'lucide-react';

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

// Categorías disponibles
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

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'pool', label: 'Mayor pool' },
  { value: 'ending', label: 'Por terminar' },
];

export default function ExplorarPage() {
  const router = useRouter();
  
  // Estados
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

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
        setError('Error al cargar escenarios');
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

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explorar Escenarios</h1>
          <p className="text-gray-400">
            Descubre predicciones y apuesta AP Coins en el futuro
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
                placeholder="Buscar escenarios..."
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
              Filtros
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
                <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ordenar por</label>
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
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-400">
          {filteredScenarios.length} escenario{filteredScenarios.length !== 1 ? 's' : ''} encontrado{filteredScenarios.length !== 1 ? 's' : ''}
        </div>

        {/* Scenarios grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">Cargando escenarios...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">No se encontraron escenarios</p>
            <p className="text-gray-500 text-sm mb-4">
              {hasActiveFilters 
                ? 'Intenta con otros filtros de búsqueda'
                : 'Sé el primero en crear uno'
              }
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
              >
                Limpiar filtros
              </button>
            ) : (
              <button
                onClick={() => router.push('/crear')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                Crear escenario
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
  const yesPercent = scenario.total_pool > 0 
    ? Math.round((scenario.yes_pool / scenario.total_pool) * 100) 
    : 50;
  const noPercent = 100 - yesPercent;

  const daysLeft = Math.ceil(
    (new Date(scenario.resolution_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div 
      onClick={() => router.push(`/escenarios/${scenario.id}`)}
      className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-purple-500/50 hover:bg-gray-900 transition-all cursor-pointer group"
    >
      {/* Category & badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
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
          <span className="text-green-400 font-medium">Sí {yesPercent}%</span>
          <span className="text-red-400 font-medium">No {noPercent}%</span>
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
            {daysLeft > 0 ? `${daysLeft}d` : 'Cerrado'}
          </span>
        </div>
      </div>
    </div>
  );
}