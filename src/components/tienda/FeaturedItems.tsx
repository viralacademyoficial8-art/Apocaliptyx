'use client';

import { Star, ChevronRight } from 'lucide-react';
import { useShopStore } from '@/stores/shopStore';
import { ShopItemCard } from './ShopItemCard';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

export function FeaturedItems() {
  const { getFeaturedItems, setSelectedItem, setPurchaseModalOpen } = useShopStore();
  const { t } = useTranslation();
  const featuredItems = getFeaturedItems().slice(0, 4);

  if (featuredItems.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Star className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{t('shop.featuredItems')}</h2>
            <p className="text-muted-foreground text-sm">{t('shop.mostPopular')}</p>
          </div>
        </div>
        <Link
          href="/tienda"
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t('shop.viewShop')} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            onViewDetails={() => {
              setSelectedItem(item);
              setPurchaseModalOpen(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
