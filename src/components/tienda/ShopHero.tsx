'use client';

import { ShoppingBag, Sparkles, Clock, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function ShopHero() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 dark:border-purple-500/20">
      {/* Light mode: vibrant gradient | Dark mode: darker gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 dark:from-purple-900/50 dark:via-pink-900/50 dark:to-red-900/50" />

      {/* Overlay for better text readability in light mode */}
      <div className="absolute inset-0 bg-white/10 dark:bg-transparent" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 dark:opacity-10" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 dark:bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300/20 dark:bg-pink-500/20 rounded-full blur-3xl" />

      <div className="relative px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-yellow-400/90 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-400 text-sm font-medium rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-4 h-4" />
              {t('shop.specialOffers')}
            </span>
            <span className="px-3 py-1 bg-white/90 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-full flex items-center gap-1 shadow-sm">
              <Clock className="w-4 h-4" />
              {t('shop.limitedTime')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-md">
            {t('shop.heroTitle')}{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
              {t('shop.heroTitleHighlight')}
            </span>
          </h1>

          <p className="text-lg text-white/90 dark:text-white/70 mb-8 drop-shadow-sm">
            {t('shop.heroSubtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 dark:bg-card/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 dark:border-transparent">
              <ShoppingBag className="w-5 h-5 text-white dark:text-purple-400" />
              <span className="text-white dark:text-foreground font-medium">{t('shop.exclusiveItems')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 dark:bg-card/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 dark:border-transparent">
              <Percent className="w-5 h-5 text-white dark:text-green-400" />
              <span className="text-white dark:text-foreground font-medium">{t('shop.activeDiscounts')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
