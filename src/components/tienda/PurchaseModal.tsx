'use client';

import { useEffect, useState } from 'react';
import { X, ShoppingCart, Star, Shield, Check, Minus, Plus, Sparkles } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import { useTranslation } from '@/hooks/useTranslation';

const rarityGradients: Record<string, string> = {
  COMMON: 'from-gray-700 to-gray-900',
  RARE: 'from-blue-700 to-blue-950',
  EPIC: 'from-purple-700 to-purple-950',
  LEGENDARY: 'from-yellow-700 to-orange-950',
};

const typeIcons: Record<string, string> = {
  PROTECTION: '🛡️',
  BOOST: '⚡',
  POWER: '✨',
  COSMETIC: '👑',
  SPECIAL: '🎁',
  BUNDLE: '📦',
};

export function PurchaseModal() {
  const { selectedItem: item, isPurchaseModalOpen, setPurchaseModalOpen, setSelectedItem, addToCart, purchaseItem, isLoading, cart } =
    useShopStore();
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isPurchaseModalOpen) setQuantity(1);
  }, [isPurchaseModalOpen]);

  if (!isPurchaseModalOpen || !item) return null;

  const cartItem = cart.find((ci) => ci.item.id === item.id);
  const currentInCart = cartItem?.quantity || 0;

  const maxByUser = item.maxPerUser ? item.maxPerUser - currentInCart : 99;
  const maxByStock = item.stock === null ? 99 : Math.max(0, item.stock - currentInCart);
  const maxCanBuy = Math.max(0, Math.min(maxByUser, maxByStock));

  const totalPrice = item.price * quantity;

  const handleClose = () => {
    setPurchaseModalOpen(false);
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (maxCanBuy <= 0) return;
    addToCart(item, quantity);
    handleClose();
  };

  const handleBuyNow = async () => {
    if (item.stock === 0) return;
    const success = await purchaseItem(item, quantity);
    if (success) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-card rounded-2xl border border-border overflow-hidden">
        <div className={`relative h-48 bg-gradient-to-br ${rarityGradients[item.rarity]} flex items-center justify-center`}>
          <span className="text-8xl">{typeIcons[item.type]}</span>

          <div className="absolute top-4 left-4 flex flex-col gap-2">
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
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  item.rarity === 'LEGENDARY'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : item.rarity === 'EPIC'
                    ? 'bg-purple-500/20 text-purple-400'
                    : item.rarity === 'RARE'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-500/20 text-muted-foreground'
                }`}
              >
                {item.rarity}
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-2">{item.name}</h2>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-foreground font-medium">{item.rating}</span>
              <span className="text-muted-foreground">({item.reviews} {t('shop.reviews')})</span>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{item.longDescription || item.description}</p>

          {item.effects && item.effects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">{t('shop.item.effect')}</h3>
              <div className="space-y-2">
                {item.effects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-foreground">{effect.description}</span>
                    {effect.duration && <span className="ml-auto text-muted-foreground text-sm">({effect.duration}h)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('shop.quantity')}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="text-xl font-bold text-foreground w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, maxCanBuy), q + 1))}
                  disabled={quantity >= maxCanBuy}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {item.maxPerUser && <p className="text-xs text-muted-foreground mt-1">{t('shop.maxPerUser')}: {item.maxPerUser}</p>}
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-yellow-400">{totalPrice.toLocaleString()}</span>
                <span className="text-yellow-400/60">AP</span>
              </div>
              {item.originalPrice && <p className="text-sm text-muted-foreground line-through">{(item.originalPrice * quantity).toLocaleString()} AP</p>}
            </div>
          </div>

          {item.stock !== null && item.stock <= 20 && item.stock > 0 && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-400 text-sm">
              <Shield className="w-4 h-4" />
              {t('shop.onlyLeft', { count: item.stock })}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={maxCanBuy <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('shop.addToCart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isLoading || item.stock === 0 || maxCanBuy <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('shop.buyNow')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
