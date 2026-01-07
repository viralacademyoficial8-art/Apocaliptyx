'use client';

import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import { useTranslation } from '@/hooks/useTranslation';

export function ShopCartSidebar() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, updateCartQuantity, getCartTotal, clearCart, purchaseCart, isLoading } =
    useShopStore();
  const { t } = useTranslation();

  const total = getCartTotal();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setCartOpen(false)} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">{t('shop.cart.title')}</h2>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-sm rounded-full">{cart.length}</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">{t('shop.cart.empty')}</p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                  {item.type === 'PROTECTION' && '🛡️'}
                  {item.type === 'BOOST' && '⚡'}
                  {item.type === 'POWER' && '✨'}
                  {item.type === 'COSMETIC' && '👑'}
                  {item.type === 'SPECIAL' && '🎁'}
                  {item.type === 'BUNDLE' && '📦'}
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-yellow-400 font-bold">{item.price.toLocaleString()} AP</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, quantity - 1)}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-white w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, quantity + 1)}
                      disabled={item.maxPerUser ? quantity >= item.maxPerUser : false}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors self-start"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold text-yellow-400">{total.toLocaleString()} AP</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={purchaseCart}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t('shop.buyNow')}
                  </>
                )}
              </button>
              <button onClick={clearCart} className="w-full py-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
                {t('shop.clearCart')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
