'use client';

import { useShopStore } from '@/stores/shopStore';
import { ShopItemCard } from './ShopItemCard';
import { Package } from 'lucide-react';

export function ShopItemGrid() {
  const { getFilteredItems, setSelectedItem, setPurchaseModalOpen } = useShopStore();
  const items = getFilteredItems();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No se encontraron items</h3>
        <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ShopItemCard
          key={item.id}
          item={item}
          onViewDetails={() => {
            setSelectedItem(item);
            setPurchaseModalOpen(true);
          }}
        />
      ))}
    </div>
  );
}
