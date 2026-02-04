'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Coins,
  Shield,
  Zap,
  ShoppingBag,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trophy,
  Flame,
} from 'lucide-react';
import { walletService } from '@/services/wallet.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface FinanceSummary {
  active: { category: string; total_amount: number; description: string }[];
  passive: { category: string; total_amount: number; description: string }[];
  totals: { active_total: number; passive_total: number; grand_total: number };
}

interface ScenarioPayout {
  id: string;
  scenario_id: string;
  recipient_id: string;
  payout_amount: number;
  theft_pool_at_resolution: number;
  scenario_result: 'YES' | 'NO';
  was_fulfilled: boolean;
  status: string;
  created_at: string;
  scenario?: { title: string; category: string };
  recipient?: { username: string; avatar_url: string };
}

export default function TransaccionesPage() {
  const [loading, setLoading] = useState(true);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [recentPayouts, setRecentPayouts] = useState<ScenarioPayout[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'passive' | 'payouts'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, payouts] = await Promise.all([
        walletService.getFinanceSummary(),
        walletService.getAllPayouts({ limit: 50 }),
      ]);
      setFinanceSummary(summary);
      setRecentPayouts(payouts);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'active_scenario_pools':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'expired_scenario_pools':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'protection_shields':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'prophet_seals':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'other_items':
        return <ShoppingBag className="w-5 h-5 text-purple-400" />;
      default:
        return <Coins className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'active_scenario_pools':
        return 'Pools de Escenarios Activos';
      case 'expired_scenario_pools':
        return 'Pools de Escenarios Vencidos';
      case 'protection_shields':
        return 'Escudos de Protección';
      case 'prophet_seals':
        return 'Sellos de Profeta';
      case 'other_items':
        return 'Otros Items';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Transacciones y Finanzas
          </h1>
          <p className="text-muted-foreground mt-1">
            Administración de AP Coins del sistema
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-muted-foreground">AP Coins Activas</span>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {financeSummary?.totals.active_total.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            En pools de escenarios vigentes
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-muted-foreground">AP Coins Pasivas</span>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {financeSummary?.totals.passive_total.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Escenarios vencidos, escudos, items
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-muted-foreground">Total Sistema</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {financeSummary?.totals.grand_total.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            AP Coins en circulación controlada
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Resumen', icon: CreditCard },
            { id: 'active', label: 'AP Activas', icon: TrendingUp },
            { id: 'passive', label: 'AP Pasivas', icon: TrendingDown },
            { id: 'payouts', label: 'Pagos Realizados', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Resumen General</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AP Coins Activas */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  AP Coins Activas
                </h4>
                <div className="space-y-2">
                  {financeSummary?.active.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <span className="text-sm">{getCategoryLabel(item.category)}</span>
                      </div>
                      <span className="font-semibold text-green-400">
                        {item.total_amount.toLocaleString()} AP
                      </span>
                    </div>
                  ))}
                  {(!financeSummary?.active || financeSummary.active.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay AP coins activas</p>
                  )}
                </div>
              </div>

              {/* AP Coins Pasivas */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  AP Coins Pasivas
                </h4>
                <div className="space-y-2">
                  {financeSummary?.passive.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <span className="text-sm">{getCategoryLabel(item.category)}</span>
                      </div>
                      <span className="font-semibold text-red-400">
                        {item.total_amount.toLocaleString()} AP
                      </span>
                    </div>
                  ))}
                  {(!financeSummary?.passive || financeSummary.passive.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay AP coins pasivas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              AP Coins Activas - Detalle
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Estas son las AP Coins que están en pools de escenarios vigentes.
              Se redistribuirán cuando los escenarios se resuelvan.
            </p>
            <div className="space-y-3">
              {financeSummary?.active.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border border-green-500/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="font-medium">{getCategoryLabel(item.category)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {item.total_amount.toLocaleString()} AP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'passive' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              AP Coins Pasivas - Detalle
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Estas son las AP Coins que ya no están en circulación activa.
              Incluyen escenarios vencidos, compra de escudos, sellos y otros items.
            </p>
            <div className="space-y-3">
              {financeSummary?.passive.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border border-red-500/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="font-medium">{getCategoryLabel(item.category)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <span className="text-2xl font-bold text-red-400">
                    {item.total_amount.toLocaleString()} AP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Pagos de Escenarios Resueltos
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Historial de pagos realizados a holders de escenarios cumplidos.
            </p>

            {recentPayouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay pagos registrados aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      payout.was_fulfilled
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payout.was_fulfilled ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {payout.was_fulfilled ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payout.scenario?.title || 'Escenario'}</p>
                        <p className="text-sm text-muted-foreground">
                          Holder: @{(payout as any).recipient?.username || 'Usuario'}
                          {' • '}
                          {formatDistanceToNow(new Date(payout.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {payout.was_fulfilled ? (
                        <p className="text-lg font-bold text-green-400">
                          +{payout.payout_amount.toLocaleString()} AP
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-red-400">
                          Sin pago
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Pool: {payout.theft_pool_at_resolution.toLocaleString()} AP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
