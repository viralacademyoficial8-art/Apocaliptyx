'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

interface CollectibleCardProps {
  collectible: Collectible;
  onPurchase?: (id: string) => void;
  onEquip?: (id: string) => void;
  onPreview?: (collectible: Collectible) => void;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-500',
  mythic: 'from-pink-500 to-rose-500',
  exclusive: 'from-red-500 to-pink-500',
};

const rarityBorders = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
  mythic: 'border-pink-500',
  exclusive: 'border-red-500',
};

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
  mythic: 'Mítico',
  exclusive: 'Exclusivo',
};

const typeLabels = {
  frame: 'Marco',
  effect: 'Efecto',
  background: 'Fondo',
  badge_style: 'Insignia',
  emoji_pack: 'Emojis',
  theme: 'Tema',
};

export function CollectibleCard({
  collectible,
  onPurchase,
  onEquip,
  onPreview,
}: CollectibleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-gray-800/50 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
        rarityBorders[collectible.rarity]
      } ${isHovered ? 'scale-105 shadow-lg' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rarity Glow */}
      <div
        className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
          rarityColors[collectible.rarity]
        }`}
      />

      {/* Limited Badge */}
      {collectible.isLimited && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Limitado
          </span>
        </div>
      )}

      {/* Owned Badge */}
      {collectible.isOwned && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Obtenido
          </span>
        </div>
      )}

      {/* Asset Preview */}
      <div
        className="relative h-32 flex items-center justify-center cursor-pointer"
        onClick={() => onPreview?.(collectible)}
      >
        {collectible.type === 'effect' || collectible.assetUrl.endsWith('.gif') ? (
          <img
            src={collectible.assetUrl}
            alt={collectible.nameEs}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            src={collectible.previewUrl || collectible.assetUrl}
            alt={collectible.nameEs}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Info */}
      <div className="relative p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{typeLabels[collectible.type]}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded bg-gradient-to-r ${
              rarityColors[collectible.rarity]
            }`}
          >
            {rarityLabels[collectible.rarity]}
          </span>
        </div>

        <h4 className="font-semibold truncate">{collectible.nameEs}</h4>

        {/* Supply */}
        {collectible.isLimited && collectible.maxSupply && (
          <div className="text-xs text-gray-400">
            {collectible.currentSupply} / {collectible.maxSupply} disponibles
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2">
          {collectible.apCost !== undefined && collectible.apCost !== null ? (
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              🪙 {collectible.apCost.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-gray-500">No disponible</span>
          )}

          {collectible.isOwned ? (
            <Button
              size="sm"
              onClick={() => onEquip?.(collectible.id)}
              className={
                collectible.isEquipped
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-500'
              }
            >
              {collectible.isEquipped ? 'Equipado' : 'Equipar'}
            </Button>
          ) : collectible.apCost !== undefined && collectible.apCost !== null ? (
            <Button
              size="sm"
              onClick={() => onPurchase?.(collectible.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Comprar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
