// src/components/perfil/ProfileInventory.tsx

'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { InventoryItemCard } from './InventoryItem';

export function ProfileInventory() {
  // 👇 Alias para que NO se llame "useItem" (y ESLint deje de creer que es un Hook)
  const {
    inventory,
    equipItem,
    unequipItem,
    useItem: consumeItem,
  } = useProfileStore();

  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredInventory = inventory.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Inventario</h2>
            <p className="text-muted-foreground text-sm">{totalItems} items</p>
          </div>
        </div>

        {/* Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-white text-sm"
        >
          <option value="all">Todos los tipos</option>
          <option value="PROTECTION">Protección</option>
          <option value="BOOST">Boosts</option>
          <option value="POWER">Poderes</option>
          <option value="COSMETIC">Cosméticos</option>
          <option value="SPECIAL">Especiales</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredInventory.map((item) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            onEquip={() => equipItem(item.id)}
            onUnequip={() => unequipItem(item.id)}
            onUse={() => consumeItem(item.id)}
          />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tienes items en tu inventario</p>
        </div>
      )}
    </div>
  );
}
