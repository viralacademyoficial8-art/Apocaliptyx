'use client';

import { useState, useEffect } from 'react';
import { useSearchStore, useScenarioStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

const categories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'tecnologia', label: '💻 Tecnología' },
  { value: 'politica', label: '🏛️ Política' },
  { value: 'deportes', label: '⚽ Deportes' },
  { value: 'farandula', label: '🎬 Farándula' },
  { value: 'guerra', label: '⚔️ Guerra' },
  { value: 'economia', label: '📈 Economía' },
  { value: 'salud', label: '🏥 Salud' },
];

const statuses = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: '🟢 Activos' },
  { value: 'completed', label: '✅ Completados' },
  { value: 'failed', label: '❌ Fallidos' },
];

const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'ending_soon', label: 'Por vencer pronto' },
];

type StatusValue = 'all' | 'active' | 'completed' | 'failed';
type SortValue =
  | 'recent'
  | 'popular'
  | 'price_asc'
  | 'price_desc'
  | 'ending_soon';

export function SearchFilters() {
  const { filters, setFilters, resetFilters, search } = useSearchStore();
  const { scenarios } = useScenarioStore();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange.min,
    filters.priceRange.max,
  ]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Re-aplicar búsqueda cuando cambian filtros
  useEffect(() => {
    search(scenarios);
  }, [filters, scenarios, search]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceCommit = () => {
    setFilters({ priceRange: { min: priceRange[0], max: priceRange[1] } });
  };

  const handleReset = () => {
    resetFilters();
    setPriceRange([0, 10000]);
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.status !== 'all',
    filters.priceRange.min > 0 || filters.priceRange.max < 10000,
    filters.sortBy !== 'recent',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4 flex-wrap">
        {/* Categoría */}
        <Select
          value={filters.category}
          onValueChange={(value: string) => setFilters({ category: value })}
        >
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.status}
          onValueChange={(value: StatusValue) =>
            setFilters({ status: value })
          }
        >
          <SelectTrigger className="w-44 bg-card border-border">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenar */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: SortValue) =>
            setFilters({ sortBy: value })
          }
        >
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rango de precio */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <span className="text-sm text-muted-foreground">Precio:</span>
          <span className="text-sm font-medium">
            {priceRange[0]} - {priceRange[1]} AP
          </span>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceCommit}
            min={0}
            max={10000}
            step={100}
            className="w-32"
          />
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Mobile – Sheet */}
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="bg-card border-border h-[80vh]"
          >
            <SheetHeader>
              <SheetTitle>Filtros de Búsqueda</SheetTitle>
              <SheetDescription>
                Ajusta los filtros para encontrar escenarios específicos
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-6 overflow-y-auto">
              {/* Categoría */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Categoría
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value: string) =>
                    setFilters({ category: value })
                  }
                >
                  <SelectTrigger className="w-full bg-muted border-border">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={filters.status}
                  onValueChange={(value: StatusValue) =>
                    setFilters({ status: value })
                  }
                >
                  <SelectTrigger className="w-full bg-muted border-border">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ordenar por
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: SortValue) =>
                    setFilters({ sortBy: value })
                  }
                >
                  <SelectTrigger className="w-full bg-muted border-border">
                    <SelectValue placeholder="Seleccionar orden" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Precio */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rango de Precio: {priceRange[0]} - {priceRange[1]} AP Coins
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  onValueCommit={handlePriceCommit}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 AP</span>
                  <span>10,000 AP</span>
                </div>
              </div>
            </div>

            <SheetFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-border"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
              <SheetClose asChild>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Aplicar Filtros
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
