'use client';

import { useState } from 'react';
import { Item } from '@/types';
import { useAuthStore, useItemStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, ShoppingCart, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuthStore();
  const { buyItem } = useItemStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsLoading(true);
    try {
      await buyItem(item.id);
      toast.success(`¡${item.name} comprado!`);
    } catch (error: any) {
      toast.error(error.message || 'Error al comprar el ítem');
    } finally {
      setIsLoading(false);
    }
  };

  const canAfford = user && user.apCoins >= item.priceApCoins;

  const getItemGradient = (type: string) => {
    switch (type) {
      case 'candado':
        return 'from-blue-600/20 to-blue-900/20 border-blue-500/30';
      case 'reloj_arena':
        return 'from-yellow-600/20 to-yellow-900/20 border-yellow-500/30';
      case 'escudo':
        return 'from-purple-600/20 to-purple-900/20 border-purple-500/30';
      default:
        return 'from-gray-600/20 to-gray-900/20 border-gray-500/30';
    }
  };

  return (
    <div className={`relative bg-gradient-to-br ${getItemGradient(item.type)} rounded-lg border-2 overflow-hidden hover:scale-105 transition-all duration-300 group`}>
      <div className="p-6">
        {/* Icon Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-6xl">{item.icon}</div>

          {('durationHours' in item) && (item as any).durationHours && (
            <Badge variant="outline" className="bg-gray-800/50 text-yellow-400 border-yellow-500/30">
              <Clock className="w-3 h-3 mr-1" />
              {(item as any).durationHours}h
            </Badge>
          )}
        </div>

        {/* Item Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed min-h-[60px]">
            {item.description}
          </p>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-400">
              {item.priceApCoins}
            </span>
            <span className="text-sm text-gray-400">AP Coins</span>
          </div>

          <Button
            onClick={handleBuy}
            disabled={isLoading || !canAfford}
            className={`${
              canAfford
                ? 'bg-yellow-600 hover:bg-yellow-700 text-black'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            } font-bold transition-all`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                Comprando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Comprar
              </span>
            )}
          </Button>
        </div>

        {!canAfford && user && (
          <div className="mt-2 text-xs text-red-400 text-center">
            Te faltan {item.priceApCoins - user.apCoins} AP Coins
          </div>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
}
