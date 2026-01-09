'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

interface TransactionStats {
  [type: string]: {
    count: number;
    total: number;
  };
}

interface Summary {
  totalTransactions: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
}

const TYPE_COLORS: Record<string, string> = {
  purchase: 'bg-blue-500/20 text-blue-400',
  reward: 'bg-green-500/20 text-green-400',
  bonus: 'bg-yellow-500/20 text-yellow-400',
  prediction_win: 'bg-emerald-500/20 text-emerald-400',
  prediction_loss: 'bg-red-500/20 text-red-400',
  steal: 'bg-orange-500/20 text-orange-400',
  shield: 'bg-purple-500/20 text-purple-400',
  daily: 'bg-cyan-500/20 text-cyan-400',
  mission: 'bg-pink-500/20 text-pink-400',
  transfer: 'bg-indigo-500/20 text-indigo-400',
  admin_grant: 'bg-lime-500/20 text-lime-400',
  admin_deduct: 'bg-rose-500/20 text-rose-400',
  refund: 'bg-teal-500/20 text-teal-400',
};

const TYPE_LABELS: Record<string, string> = {
  purchase: 'Compra',
  reward: 'Recompensa',
  bonus: 'Bonus',
  prediction_win: 'Victoria Predicción',
  prediction_loss: 'Pérdida Predicción',
  steal: 'Robo',
  shield: 'Escudo',
  daily: 'Bonus Diario',
  mission: 'Misión',
  transfer: 'Transferencia',
  admin_grant: 'Admin Grant',
  admin_deduct: 'Admin Deducción',
  refund: 'Reembolso',
};

export default function AdminTransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [formData, setFormData] = useState({
    userId: '',
    amount: 0,
    type: 'admin_grant',
    description: '',
  });
  const limit = 50;

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setStats(data.stats || {});
        setSummary(data.summary || null);
      } else {
        toast.error(data.error || 'Error al cargar transacciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCreateTransaction = async () => {
    if (!formData.userId.trim() || formData.amount === 0) {
      toast.error('Usuario ID y cantidad son requeridos');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Transacción creada. Nuevo balance: ${data.newBalance} AP`);
        setShowModal(false);
        setFormData({ userId: '', amount: 0, type: 'admin_grant', description: '' });
        loadTransactions();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al crear transacción');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Transacciones"
        subtitle="Historial de movimientos de AP coins"
      />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalTransactions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Transacciones</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">+{summary.totalIn.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Entradas</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">-{summary.totalOut.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Salidas</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.netFlow >= 0 ? '+' : ''}{summary.netFlow.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Flujo Neto</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Type Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Por Tipo de Transacción</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats).map(([type, data]) => (
                <div
                  key={type}
                  className={`px-3 py-2 rounded-lg ${TYPE_COLORS[type] || 'bg-gray-500/20 text-gray-400'}`}
                >
                  <p className="text-sm font-medium">{TYPE_LABELS[type] || type}</p>
                  <p className="text-xs opacity-80">
                    {data.count} tx • {data.total >= 0 ? '+' : ''}{data.total.toLocaleString()} AP
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="User ID..."
                value={filters.userId}
                onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({ type: '', userId: '', dateFrom: '', dateTo: '' });
                setPage(1);
              }}
            >
              Limpiar
            </Button>
          </div>

          <PermissionGate permission="admin.users.edit">
            <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </PermissionGate>
        </div>

        {/* Transactions Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cantidad</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descripción</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {tx.user?.avatar_url ? (
                              <img src={tx.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{tx.user?.username || 'Usuario'}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {tx.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[tx.type] || 'bg-gray-500/20 text-gray-400'}`}>
                            {TYPE_LABELS[tx.type] || tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`flex items-center justify-end gap-1 font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.amount >= 0 ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {tx.balance_after?.toLocaleString() || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {tx.description || '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-3">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Nueva Transacción Manual</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Otorgar o deducir AP coins a un usuario
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">ID del Usuario *</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData(f => ({ ...f, userId: e.target.value }))}
                  placeholder="UUID del usuario"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="admin_grant">Admin Grant (positivo)</option>
                  <option value="admin_deduct">Admin Deducción (negativo)</option>
                  <option value="reward">Recompensa</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">Reembolso</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Cantidad * (usar negativo para deducir)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
                  placeholder="100 o -50"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Razón de la transacción..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTransaction}
                disabled={actionLoading}
                className={formData.amount >= 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {formData.amount >= 0 ? 'Otorgar' : 'Deducir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
