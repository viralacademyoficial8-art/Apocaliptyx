'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SearchBarProps {
  variant?: 'navbar' | 'full';
  autoFocus?: boolean;
  onSearch?: () => void;
}

interface QuickResult {
  id: string;
  title: string;
  category: string;
}

export function SearchBar({
  variant = 'navbar',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [localQuery, setLocalQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Trending searches (estos podrían venir de la DB también)
  const trendingSearches = [
    'Bitcoin',
    'Elecciones',
    'IA',
    'Deportes',
    'Crypto',
  ];

  // Cargar búsquedas recientes
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda rápida mientras escribe (debounced)
  useEffect(() => {
    if (!localQuery.trim() || localQuery.length < 2) {
      setQuickResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('scenarios')
          .select('id, title, category')
          .eq('status', 'ACTIVE')
          .or(`title.ilike.%${localQuery}%,description.ilike.%${localQuery}%`)
          .limit(5);

        setQuickResults(data || []);
      } catch (error) {
        console.error('Quick search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  // Guardar búsqueda reciente
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery ?? localQuery;
    if (!finalQuery.trim()) return;

    saveRecentSearch(finalQuery);
    setIsOpen(false);

    if (onSearch) onSearch();

    router.push(`/buscar?q=${encodeURIComponent(finalQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setQuickResults([]);
    inputRef.current?.focus();
  };

  const handleResultClick = (scenarioId: string) => {
    setIsOpen(false);
    router.push(`/escenario/${scenarioId}`);
  };

  // 🌐 Variante NAVBAR
  if (variant === 'navbar') {
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar escenarios..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-8 w-40 sm:w-48 md:w-56 lg:w-64 bg-muted border-border focus-visible:ring-purple-500 focus-visible:border-purple-500"
          />
          {localQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden w-[280px] sm:w-[320px] md:min-w-[300px]"
          >
            {/* Resultados rápidos */}
            {localQuery.length >= 2 && (
              <div className="p-3 border-b border-border">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  </div>
                ) : quickResults.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Resultados</span>
                    {quickResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.id)}
                        className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors"
                      >
                        <div className="font-medium line-clamp-1">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.category}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSearch()}
                      className="w-full text-center text-sm text-purple-400 hover:text-purple-300 py-2"
                    >
                      Ver todos los resultados →
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No se encontraron resultados
                  </p>
                )}
              </div>
            )}

            {/* Recientes */}
            {recentSearches.length > 0 && !localQuery && (
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recientes
                  </span>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((searchText, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(searchText)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                    >
                      {searchText}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            {!localQuery && (
              <div className="p-3">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </span>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(trend)}
                      className="px-2 py-1 text-xs bg-muted hover:bg-purple-500/20 hover:text-purple-400 rounded-full transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 📄 Variante FULL (página /buscar)
  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar escenarios, usuarios, categorías..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className="pl-12 pr-24 py-6 text-lg bg-card border-border focus-visible:ring-purple-500 focus-visible:border-purple-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {localQuery && (
            <button
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <Button
            onClick={() => handleSearch()}
            disabled={isSearching || !localQuery.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Buscar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}