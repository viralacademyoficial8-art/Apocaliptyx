'use client';

import { useState } from 'react';
import { Package, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CollectibleCard } from './CollectibleCard';

interface Collectible {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  type: 'frame' | 'effect' | 'background' | 'badge_style' | 'emoji_pack' | 'theme';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';
  assetUrl: string;
  previewUrl?: string;
  apCost?: number;
  isTradeable: boolean;
  isLimited: boolean;
  maxSupply?: number;
  currentSupply: number;
  isOwned?: boolean;
  isEquipped?: boolean;
  acquiredAt?: string;
}

interface CollectibleInventoryProps {
  collectibles: Collectible[];
  onEquip?: (id: string) => void;
  onTrade?: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  frame: 'Marcos',
  effect: 'Efectos',
  background: 'Fondos',
  badge_style: 'Insignias',
  emoji_pack: 'Emojis',
  theme: 'Temas',
};

export function CollectibleInventory({
  collectibles,
  onEquip,
  onTrade,
}: CollectibleInventoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const types = ['all', ...new Set(collectibles.map((c) => c.type))];

  const filteredCollectibles = collectibles.filter((collectible) => {
    if (
      searchQuery &&
      !collectible.nameEs.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedType !== 'all' && collectible.type !== selectedType) {
      return false;
    }
    if (selectedRarity !== 'all' && collectible.rarity !== selectedRarity) {
      return false;
    }
    return true;
  });

  // Group by type
  const groupedCollectibles = filteredCollectibles.reduce((acc, collectible) => {
    if (!acc[collectible.type]) {
      acc[collectible.type] = [];
    }
    acc[collectible.type].push(collectible);
    return acc;
  }, {} as Record<string, Collectible[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Package className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Mi Inventario</h2>
            <p className="text-sm text-gray-400">
              {collectibles.length} coleccionables
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar coleccionables..."
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Todos</SelectItem>
            {types
              .filter((t) => t !== 'all')
              .map((type) => (
                <SelectItem key={type} value={type}>
                  {typeLabels[type] || type}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={selectedRarity} onValueChange={setSelectedRarity}>
          <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Rareza" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="common">Común</SelectItem>
            <SelectItem value="rare">Raro</SelectItem>
            <SelectItem value="epic">Épico</SelectItem>
            <SelectItem value="legendary">Legendario</SelectItem>
            <SelectItem value="mythic">Mítico</SelectItem>
            <SelectItem value="exclusive">Exclusivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collectibles Grid by Type */}
      {selectedType === 'all' ? (
        Object.entries(groupedCollectibles).map(([type, items]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {typeLabels[type] || type}
              <span className="text-sm text-gray-400 font-normal">
                ({items.length})
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((collectible) => (
                <CollectibleCard
                  key={collectible.id}
                  collectible={{ ...collectible, isOwned: true }}
                  onEquip={onEquip}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCollectibles.map((collectible) => (
            <CollectibleCard
              key={collectible.id}
              collectible={{ ...collectible, isOwned: true }}
              onEquip={onEquip}
            />
          ))}
        </div>
      )}

      {filteredCollectibles.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tienes coleccionables</p>
        </div>
      )}
    </div>
  );
}
