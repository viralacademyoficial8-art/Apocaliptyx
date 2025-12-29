'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useSearchStore,
  useScenarioStore,
  useAuthStore,
} from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { LandingNavbar } from '@/components/LandingNavbar';
import { SearchBar } from '@/components/SearchBar';
import { SearchFilters } from '@/components/SearchFilters';
import { SearchResults } from '@/components/SearchResults';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { scenarios, fetchScenarios } = useScenarioStore();
  const {
    setQuery,
    search,
    query,
    recentSearches,
    clearRecentSearches,
  } = useSearchStore();

  // Cargar escenarios si aún no están en memoria
  useEffect(() => {
    if (scenarios.length === 0) {
      fetchScenarios();
    }
  }, [scenarios.length, fetchScenarios]);

  // Leer query de la URL y lanzar búsqueda
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      search(scenarios);
    }
  }, [searchParams, scenarios, setQuery, search]);

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Buscar Escenarios
            </h1>
          </div>
          <p className="text-muted-foreground">
            Encuentra predicciones sobre cualquier tema
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <SearchBar variant="full" autoFocus />
        </div>

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
                    search(scenarios);
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
          <SearchFilters />
        </div>

        {/* Resultados */}
        <SearchResults />
      </main>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
