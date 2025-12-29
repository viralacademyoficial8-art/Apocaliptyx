// src/components/perfil/InventoryItem.tsx

'use client';

import { Check, Play, Clock } from 'lucide-react';
import { InventoryItem as InventoryItemType } from '@/stores/profileStore';

interface InventoryItemProps {
  item: InventoryItemType;
  onEquip?: () => void;
  onUnequip?: () => void;
  onUse?: () => void;
}

const typeIcons: Record<string, string> = {
  PROTECTION: '🛡️',
  BOOST: '⚡',
  POWER: '✨',
  COSMETIC: '👑',
  SPECIAL: '🎁',
  BUNDLE: '📦',
};

const rarityColors: Record<string, { bg: string; border: string }> = {
  COMMON: { bg: 'bg-gray-800', border: 'border-gray-700' },
  RARE: { bg: 'bg-blue-900/30', border: 'border-blue-500/30' },
  EPIC: { bg: 'bg-purple-900/30', border: 'border-purple-500/30' },
  LEGENDARY: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/30' },
};

export function InventoryItemCard({ item, onEquip, onUnequip, onUse }: InventoryItemProps) {
  const rarity = rarityColors[item.rarity];
  const isConsumable = ['PROTECTION', 'BOOST', 'POWER', 'SPECIAL'].includes(item.type);
  const isCosmetic = item.type === 'COSMETIC';

  return (
    <div className={`${rarity.bg} rounded-xl border ${rarity.border} p-4 relative`}>
      {/* Equipped badge */}
      {item.isEquipped && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" />
          Equipado
        </div>
      )}

      {/* Quantity */}
      {item.quantity > 1 && (
        <div className="absolute top-2 left-2 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {item.quantity}
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-3 text-center">{typeIcons[item.type]}</div>

      {/* Info */}
      <h3 className="text-white font-bold text-center mb-1">{item.name}</h3>
      <p className="text-gray-400 text-xs text-center mb-3 line-clamp-2">{item.description}</p>

      {/* Expiration */}
      {item.expiresAt && (
        <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs mb-3">
          <Clock className="w-3 h-3" />
          Expira: {new Date(item.expiresAt).toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isConsumable && (
          <button
            onClick={onUse}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Usar
          </button>
        )}
        {isCosmetic && (
          <button
            onClick={item.isEquipped ? onUnequip : onEquip}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              item.isEquipped
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {item.isEquipped ? 'Desequipar' : 'Equipar'}
          </button>
        )}
      </div>
    </div>
  );
}