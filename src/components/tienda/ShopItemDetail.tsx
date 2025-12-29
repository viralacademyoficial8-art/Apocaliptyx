'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Sparkles } from 'lucide-react';
import type { ShopItem } from '@/stores/shopStore';
import { useShopStore } from '@/stores/shopStore';

const typeIcons: Record<string, string> = {
  PROTECTION: '🛡️',
  BOOST: '⚡',
  POWER: '✨',
  COSMETIC: '👑',
  SPECIAL: '🎁',
  BUNDLE: '📦',
};

export function ShopItemDetail({ item }: { item: ShopItem }) {
  const { addToCart, setPurchaseModalOpen, setSelectedItem } = useShopStore();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tienda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a tienda
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-900/40 via-gray-900 to-black">
              <span className="text-8xl">{typeIcons[item.type]}</span>
            </div>
            <div className="p-5 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-yellow-400 font-bold text-2xl">
                  {item.price.toLocaleString()} <span className="text-yellow-400/60 text-base">AP</span>
                </div>
                {item.isNew && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> NUEVO
                  </span>
                )}
              </div>

              <p className="mt-3 text-gray-400">{item.description}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => addToCart(item, 1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setPurchaseModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                >
                  Ver detalle
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h1 className="text-3xl font-bold text-white">{item.name}</h1>
            <p className="mt-2 text-gray-400">{item.longDescription || item.description}</p>

            {item.effects && item.effects.length > 0 && (
              <div className="mt-6">
                <h2 className="text-white font-bold mb-3">Efectos</h2>
                <div className="space-y-2">
                  {item.effects.map((e, idx) => (
                    <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-200">
                      <div className="font-semibold">{e.description}</div>
                      {e.duration ? <div className="text-sm text-gray-400 mt-1">Duración: {e.duration} horas</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-300">
                Rareza: <span className="text-white font-semibold">{item.rarity}</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-300">
                Tipo: <span className="text-white font-semibold">{item.type}</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-300">
                Stock:{' '}
                <span className="text-white font-semibold">{item.stock === null ? 'Ilimitado' : item.stock}</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-300">
                Máx/usuario:{' '}
                <span className="text-white font-semibold">{item.maxPerUser === null ? 'Sin límite' : item.maxPerUser}</span>
              </div>
            </div>

            <div className="mt-6 text-gray-400 text-sm">
              Tags: <span className="text-gray-200">{item.tags.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
