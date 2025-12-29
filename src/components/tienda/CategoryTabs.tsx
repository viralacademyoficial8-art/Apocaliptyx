'use client';

import { Shield, Zap, Sparkles, Crown, Package, Gift, LayoutGrid } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';

const categories = [
  { id: 'all', label: 'Todos', icon: LayoutGrid },
  { id: 'PROTECTION', label: 'Protección', icon: Shield },
  { id: 'BOOST', label: 'Boosts', icon: Zap },
  { id: 'POWER', label: 'Poderes', icon: Sparkles },
  { id: 'COSMETIC', label: 'Cosméticos', icon: Crown },
  { id: 'BUNDLE', label: 'Packs', icon: Package },
  { id: 'SPECIAL', label: 'Especiales', icon: Gift },
];

export function CategoryTabs() {
  const { filters, setFilters } = useShopStore();

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
