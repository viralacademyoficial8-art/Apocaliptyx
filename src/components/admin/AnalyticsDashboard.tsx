'use client';

import { useEffect, useMemo } from 'react';
import { BarChart3, Users, Activity, FileText, Wallet, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { StatCard, StatsGrid } from './AdminStats';

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="text-foreground">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
        <div className="h-full bg-purple-600/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const { analytics, fetchStats, isLoading, error } = useAdminStore();

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const data = analytics;
  const maxUsers = useMemo(() => Math.max(...(data?.charts.userGrowth.map(x => x.users) || [0])), [data]);
  const maxTx = useMemo(() => Math.max(...(data?.charts.dailyTransactions.map(x => x.count) || [0])), [data]);
  const maxCat = useMemo(() => Math.max(...(data?.charts.categoryDistribution.map(x => x.count) || [0])), [data]);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando estadísticas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-red-800 rounded-xl p-6 text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">
        No hay datos disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatCard title="Usuarios totales" value={data.overview.totalUsers} icon={Users} />
        <StatCard title="Activos" value={data.overview.activeUsers} icon={Activity} />
        <StatCard title="Escenarios activos" value={data.overview.activeScenarios} icon={FileText} />
        <StatCard title="Volumen total" value={data.overview.totalVolume} icon={Wallet} />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-300" />
            <h3 className="text-white font-semibold">Crecimiento de usuarios</h3>
          </div>
          <div className="space-y-3">
            {data.charts.userGrowth.map((x) => (
              <BarRow key={x.date} label={x.date} value={x.users} max={maxUsers} />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-300" />
            <h3 className="text-white font-semibold">Transacciones diarias</h3>
          </div>
          <div className="space-y-3">
            {data.charts.dailyTransactions.map((x) => (
              <BarRow key={x.date} label={`${x.date} (vol: ${x.volume.toLocaleString()})`} value={x.count} max={maxTx} />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-300" />
            <h3 className="text-white font-semibold">Distribución por categorías</h3>
          </div>
          <div className="space-y-3">
            {data.charts.categoryDistribution.map((x) => (
              <BarRow key={x.category} label={x.category} value={x.count} max={maxCat} />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-300" />
            <h3 className="text-white font-semibold">Top escenarios por pool</h3>
          </div>
          <div className="space-y-3">
            {data.charts.topScenarios.map((x) => (
              <div key={x.title} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{x.title}</span>
                <span className="text-white font-medium">{x.pool.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Top usuarios</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-3">Por ganancias</div>
            <div className="space-y-2">
              {data.topUsers.byEarnings.map(u => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{u.username}</span>
                  <span className="text-white">{u.totalEarnings.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-3">Por predicciones</div>
            <div className="space-y-2">
              {data.topUsers.byPredictions.map(u => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{u.username}</span>
                  <span className="text-white">{u.totalPredictions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-3">Por nivel</div>
            <div className="space-y-2">
              {data.topUsers.byLevel.map(u => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{u.username}</span>
                  <span className="text-white">Lv {u.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
