'use client';

import { useState } from 'react';
import { ShoppingCart, Star, Eye, Sparkles, Clock, Check } from 'lucide-react';
import type { ShopItem } from '@/stores/shopStore';
import { useShopStore } from '@/stores/shopStore';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface ShopItemCardProps {
  item: ShopItem;
  onViewDetails?: () => void;
}

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  COMMON: { bg: 'bg-gray-500/20', text: 'text-muted-foreground', border: 'border-gray-500/30' },
  RARE: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  EPIC: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  LEGENDARY: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
};

const typeIcons: Record<string, string> = {
  PROTECTION: '🛡️',
  BOOST: '⚡',
  POWER: '✨',
  COSMETIC: '👑',
  SPECIAL: '🎁',
  BUNDLE: '📦',
};

export function ShopItemCard({ item, onViewDetails }: ShopItemCardProps) {
  const router = useRouter();
  const { addToCart, cart } = useShopStore();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  const rarity = rarityColors[item.rarity];
  const isInCart = cart.some((ci) => ci.item.id === item.id);
  const cartItem = cart.find((ci) => ci.item.id === item.id);
  const canAddMore = !item.maxPerUser || (cartItem?.quantity || 0) < item.maxPerUser;

  const handleAddToCart = async () => {
    if (!canAddMore) return;
    if (item.stock === 0) return;

    setIsAdding(true);
    addToCart(item);
    await new Promise((r) => setTimeout(r, 250));
    setIsAdding(false);
  };

  return (
    <div
      className={`group relative bg-card rounded-xl border ${rarity.border} overflow-hidden hover:border-opacity-60 transition-all hover:shadow-lg hover:shadow-purple-500/10`}
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {item.isNew && (
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t('shop.item.new').toUpperCase()}
          </span>
        )}
        {item.isOnSale && item.originalPrice && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
          </span>
        )}
        {item.isFeatured && (
          <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> {t('shop.item.featured').toUpperCase()}
          </span>
        )}
      </div>

      {item.stock !== null && item.stock <= 50 && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2 py-1 text-xs font-bold rounded-full ${
              item.stock === 0
                ? 'bg-muted text-muted-foreground'
                : item.stock <= 10
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {item.stock === 0 ? t('shop.item.soldOut') : `${item.stock} ${t('shop.available')}`}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push(`/tienda/${item.id}`)}
        className={`h-40 w-full flex items-center justify-center ${rarity.bg}`}
      >
        <span className="text-6xl">{typeIcons[item.type]}</span>
      </button>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${rarity.bg} ${rarity.text}`}>{item.rarity}</span>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{item.rating}</span>
            <span>({item.reviews})</span>
          </div>
        </div>

        <h3 className="text-white font-bold mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{item.description}</p>

        {item.effects && item.effects.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-purple-400 line-clamp-1">✨ {item.effects[0].description}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-yellow-400">{item.price.toLocaleString()}</span>
            <span className="text-yellow-400/60 text-sm">AP</span>
            {item.originalPrice && <span className="text-muted-foreground line-through text-sm">{item.originalPrice.toLocaleString()}</span>}
          </div>
          {item.purchaseCount > 1000 && <span className="text-xs text-muted-foreground">{(item.purchaseCount / 1000).toFixed(1)}k {t('shop.sold')}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={item.stock === 0 || !canAddMore || isAdding}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
              item.stock === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : isInCart
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isInCart ? (
              <>
                <Check className="w-4 h-4" />
                {t('shop.inCart')} ({cartItem?.quantity})
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {t('shop.add')}
              </>
            )}
          </button>

          <button
            onClick={onViewDetails}
            type="button"
            className="p-2.5 bg-muted hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {item.isOnSale && item.saleEndsAt && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-center gap-2 text-red-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>{t('shop.activeSale')}</span>
        </div>
      )}
    </div>
  );
}
