'use client';

import { useState } from 'react';
import { Search, Filter, RefreshCw, Check } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getItemId: (item: T) => string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  filters?: React.ReactNode;
  actions?: (item: T) => React.ReactNode;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  bulkActions?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AdminDataTable<T>({
  data,
  columns,
  getItemId,
  searchPlaceholder = 'Buscar...',
  onSearch,
  onRefresh,
  filters,
  actions,
  selectable = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  bulkActions,
  isLoading = false,
  emptyMessage = 'No hay datos',
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const allSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(getItemId(item)));

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {filters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title="Filtros"
              >
                <Filter className="w-5 h-5" />
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                title="Refrescar"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {showFilters && filters && (
          <div className="mt-4 pt-4 border-t border-gray-800">{filters}</div>
        )}

        {selectedIds.length > 0 && bulkActions && (
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {selectedIds.length} seleccionado(s)
            </span>
            {bulkActions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50">
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <button
                    onClick={onSelectAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      allSelected
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    aria-label="Seleccionar todo"
                  >
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}

              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={`transition-colors ${
                      isSelected ? 'bg-purple-900/20' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelect?.(id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          aria-label={`Seleccionar ${id}`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-300">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}

                    {actions && <td className="px-4 py-3 text-right">{actions(item)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
