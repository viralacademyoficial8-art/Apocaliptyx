'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-purple-400',
  iconBg = 'bg-purple-500/20',
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {change && (
            <p
              className={`text-sm mt-1 ${
                change.type === 'increase' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change.type === 'increase' ? '+' : '-'}
              {Math.abs(change.value)}%
              <span className="text-muted-foreground ml-1">vs ayer</span>
            </p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export function StatsGrid({
  children,
  columns = 4,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid ${gridCols[columns]} gap-4`}>{children}</div>;
}
