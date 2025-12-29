'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs ayer',
  icon: Icon,
  iconColor = 'text-purple-400',
  iconBgColor = 'bg-purple-500/20',
  delay = 0,
}: StatsCardProps) {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card border border-border rounded-xl p-5 hover:border-purple-500/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-lg', iconBgColor)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {typeof change === 'number' && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive && 'text-green-400',
              isNegative && 'text-red-400',
            )}
          >
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}
              {change}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {changeLabel}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </motion.div>
  );
}

export function MiniStats({
  label,
  value,
  icon: Icon,
  color = 'text-purple-400',
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn('w-4 h-4', color)} />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-semibold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
