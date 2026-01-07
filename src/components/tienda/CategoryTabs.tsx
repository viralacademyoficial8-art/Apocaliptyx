'use client';

import { Shield, Zap, Sparkles, Crown, Package, Gift, LayoutGrid } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import { useTranslation } from '@/hooks/useTranslation';

export function CategoryTabs() {
  const { filters, setFilters } = useShopStore();
  const { t } = useTranslation();

  const categories = [
    { id: 'all', label: t('shop.categories.all'), icon: LayoutGrid },
    { id: 'PROTECTION', label: t('shop.categories.protection'), icon: Shield },
    { id: 'BOOST', label: t('shop.categories.boost'), icon: Zap },
    { id: 'POWER', label: t('shop.categories.power'), icon: Sparkles },
    { id: 'COSMETIC', label: t('shop.categories.cosmetic'), icon: Crown },
    { id: 'BUNDLE', label: t('shop.categories.bundle'), icon: Package },
    { id: 'SPECIAL', label: t('shop.categories.special'), icon: Gift },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = filters.category === category.id;

        return (
          <button
            key={category.id}
            onClick={() => setFilters({ category: category.id })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              isActive ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
