'use client';

import { Search, Tag, X } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import { useTranslation } from '@/hooks/useTranslation';

export function ShopFilters() {
  const { filters, setFilters, resetFilters } = useShopStore();
  const { t } = useTranslation();

  const hasActiveFilters = Boolean(filters.search) || filters.rarity !== 'all' || filters.showOnSale;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={`${t('shop.searchItems')}...`}
          className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <select
        value={filters.rarity}
        onChange={(e) => setFilters({ rarity: e.target.value })}
        className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="all">{t('shop.rarity.all')}</option>
        <option value="COMMON">{t('shop.rarity.common')}</option>
        <option value="RARE">{t('shop.rarity.rare')}</option>
        <option value="EPIC">{t('shop.rarity.epic')}</option>
        <option value="LEGENDARY">{t('shop.rarity.legendary')}</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ sortBy: e.target.value as any })}
        className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="popular">{t('shop.sortBy.popular')}</option>
        <option value="price_asc">{t('shop.sortBy.priceAsc')}</option>
        <option value="price_desc">{t('shop.sortBy.priceDesc')}</option>
        <option value="newest">{t('shop.sortBy.newest')}</option>
        <option value="rating">{t('shop.sortBy.rating')}</option>
      </select>

      <button
        onClick={() => setFilters({ showOnSale: !filters.showOnSale })}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          filters.showOnSale
            ? 'bg-green-600 text-white'
            : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
        }`}
      >
        <Tag className="w-4 h-4" />
        {t('shop.onSale')}
      </button>

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <X className="w-4 h-4" />
          {t('shop.clear')}
        </button>
      )}
    </div>
  );
}
