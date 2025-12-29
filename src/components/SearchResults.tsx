'use client';

import Link from 'next/link';
import { useSearchStore } from '@/lib/stores';
import { ScenarioCard } from '@/components/ScenarioCard';
import { Loader2, SearchX, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchResults() {
  const { query, results, isSearching } = useSearchStore();

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Buscando escenarios...</p>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <TrendingUp className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Descubre escenarios</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Usa la barra de búsqueda para encontrar predicciones sobre tecnología, política, deportes y más.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-border">
            Ver todos los escenarios
          </Button>
        </Link>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sin resultados</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          No encontramos escenarios para &quot;
          <span className="text-foreground font-medium">{query}</span>
          &quot;.
          <br />
          Intenta con otros términos o ajusta los filtros.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border"
            onClick={() => useSearchStore.getState().resetFilters()}
          >
            Limpiar filtros
          </Button>
          <Link href="/crear">
            <Button className="bg-purple-600 hover:bg-purple-700">Crear este escenario</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">{results.length}</span>{' '}
          resultado{results.length !== 1 ? 's' : ''} para &quot;
          <span className="text-foreground">{query}</span>
          &quot;
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {results.map((scenario: any) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
