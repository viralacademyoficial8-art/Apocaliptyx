'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingCart } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';

export function ShopCart() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, clearCart, purchaseCart, isLoading } = useShopStore();
  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tienda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a tienda
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Tu carrito</h1>
        </div>

        {cart.length === 0 ? (
          <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-400">Tu carrito está vacío.</p>
            <Link href="/tienda" className="inline-block mt-4 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
              Ir a tienda
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4">
            {cart.map(({ item, quantity }) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                  {item.type === 'PROTECTION' && '🛡️'}
                  {item.type === 'BOOST' && '⚡'}
                  {item.type === 'POWER' && '✨'}
                  {item.type === 'COSMETIC' && '👑'}
                  {item.type === 'SPECIAL' && '🎁'}
                  {item.type === 'BUNDLE' && '📦'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{item.name}</div>
                  <div className="text-yellow-400 font-bold">{item.price.toLocaleString()} AP</div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, quantity - 1)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-200" />
                    </button>
                    <span className="text-white w-10 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, quantity + 1)}
                      disabled={item.maxPerUser ? quantity >= item.maxPerUser : false}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-gray-200" />
                    </button>
                  </div>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))}

            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-3xl font-bold text-yellow-400">{total.toLocaleString()} AP</span>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={purchaseCart}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Comprar ahora
                    </>
                  )}
                </button>

                <button onClick={clearCart} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
