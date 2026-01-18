'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import {
  Search,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  source: string;
  created_at: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  thisWeek: number;
  thisMonth: number;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    inactive: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/newsletter?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        setTotal(data.total);
        setStats(data.stats);
      } else {
        toast.error('Error al cargar suscriptores');
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const handleToggleStatus = async (subscriberId: string, currentStatus: boolean) => {
    setActionLoading(subscriberId);
    try {
      const res = await fetch(`/api/admin/newsletter/${subscriberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        toast.success(currentStatus ? 'Suscriptor desactivado' : 'Suscriptor activado');
        loadSubscribers();
      } else {
        toast.error('Error al actualizar suscriptor');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (subscriberId: string, email: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${email}?`)) return;

    setActionLoading(subscriberId);
    try {
      const res = await fetch(`/api/admin/newsletter/${subscriberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Suscriptor eliminado');
        loadSubscribers();
      } else {
        toast.error('Error al eliminar suscriptor');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/newsletter/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Exportación completada');
      } else {
        toast.error('Error al exportar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Newsletter"
        subtitle={`${stats.total} suscriptores totales`}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inactivos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSubscribers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="default" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Fuente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Suscrito</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No hay suscriptores</p>
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {subscriber.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inactivo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                        {subscriber.source || 'footer'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(subscriber.subscribed_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === subscriber.id}
                            onClick={() => handleToggleStatus(subscriber.id, subscriber.is_active)}
                            className={subscriber.is_active ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}
                          >
                            {actionLoading === subscriber.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : subscriber.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === subscriber.id}
                            onClick={() => handleDelete(subscriber.id, subscriber.email)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} ({total} suscriptores)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
