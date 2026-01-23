'use client';

import { ShoppingBag, Sparkles, Clock, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function ShopHero() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-red-900/50 border border-purple-500/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

      <div className="relative px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {t('shop.specialOffers')}
            </span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {t('shop.limitedTime')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('shop.heroTitle')}{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              {t('shop.heroTitleHighlight')}
            </span>
          </h1>

          <p className="text-lg text-foreground mb-8">
            {t('shop.heroSubtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">{t('shop.exclusiveItems')}</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg">
              <Percent className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">{t('shop.activeDiscounts')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
