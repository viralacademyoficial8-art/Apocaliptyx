'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, 
  FileText, 
  Flame,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  Loader2,
  Trophy,
  Coins
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalScenarios: number;
  activeScenarios: number;
  totalVolume: number;
  totalTransactions: number;
  categoryDistribution: { category: string; count: number }[];
  topScenarios: { title: string; pool: number }[];
  topUsers: { username: string; ap_coins: number }[];
  recentUsers: { username: string; created_at: string }[];
}

function BarRow({ label, value, max, color = 'bg-purple-600' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="text-foreground font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Total usuarios
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Usuarios activos (no baneados)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', false);

      // Total escenarios
      const { count: totalScenarios } = await supabase
        .from('scenarios')
        .select('*', { count: 'exact', head: true });

      // Escenarios activos
      const { count: activeScenarios } = await supabase
        .from('scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

      // Volumen total
      const { data: volumeData } = await supabase
        .from('scenarios')
        .select('total_pool');
      const totalVolume = volumeData?.reduce((sum, s) => sum + (s.total_pool || 0), 0) || 0;

      // Total transacciones
      const { count: totalTransactions } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true });

      // Distribución por categoría
      const { data: scenarios } = await supabase
        .from('scenarios')
        .select('category');
      
      const categoryCount: Record<string, number> = {};
      scenarios?.forEach(s => {
        const cat = s.category || 'otros';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const categoryDistribution = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Top escenarios por pool
      const { data: topScenariosData } = await supabase
        .from('scenarios')
        .select('title, total_pool')
        .order('total_pool', { ascending: false })
        .limit(5);
      const topScenarios = topScenariosData?.map(s => ({ 
        title: s.title, 
        pool: s.total_pool || 0 
      })) || [];

      // Top usuarios por AP Coins
      const { data: topUsersData } = await supabase
        .from('users')
        .select('username, ap_coins')
        .order('ap_coins', { ascending: false })
        .limit(5);
      const topUsers = topUsersData?.map(u => ({ 
        username: u.username, 
        ap_coins: u.ap_coins || 0 
      })) || [];

      // Usuarios recientes
      const { data: recentUsersData } = await supabase
        .from('users')
        .select('username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      const recentUsers = recentUsersData || [];

      setData({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalScenarios: totalScenarios || 0,
        activeScenarios: activeScenarios || 0,
        totalVolume,
        totalTransactions: totalTransactions || 0,
        categoryDistribution,
        topScenarios,
        topUsers,
        recentUsers,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Error al cargar analytics</p>
      </div>
    );
  }

  const maxCategory = Math.max(...data.categoryDistribution.map(c => c.count), 1);
  const maxPool = Math.max(...data.topScenarios.map(s => s.pool), 1);
  const maxCoins = Math.max(...data.topUsers.map(u => u.ap_coins), 1);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Analytics Dashboard" 
        subtitle="Estadísticas en tiempo real de la plataforma"
      />

      <div className="p-6 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Usuarios Totales</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Usuarios Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.activeScenarios}</p>
                <p className="text-xs text-muted-foreground">Escenarios Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Volumen Total AP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalScenarios}</p>
                <p className="text-xs text-muted-foreground">Total Escenarios</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalTransactions}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.categoryDistribution.length}</p>
                <p className="text-xs text-muted-foreground">Categorías</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por Categoría */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Distribución por Categoría</h3>
            </div>
            {data.categoryDistribution.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {data.categoryDistribution.map((item) => (
                  <BarRow 
                    key={item.category} 
                    label={item.category} 
                    value={item.count} 
                    max={maxCategory}
                    color="bg-purple-500"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Top Escenarios */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Top Escenarios por Pool</h3>
            </div>
            {data.topScenarios.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {data.topScenarios.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">{item.pool.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Usuarios */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Top Usuarios por AP Coins</h3>
            </div>
            {data.topUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {data.topUsers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                      <span className="text-sm">@{item.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">{item.ap_coins.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usuarios Recientes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Usuarios Recientes</h3>
            </div>
            {data.recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {data.recentUsers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {item.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm">@{item.username}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}