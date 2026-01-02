'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { createClient } from '@supabase/supabase-js';
import { 
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Settings,
  ShoppingBag,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuditLog {
  id: string;
  category: string;
  action: string;
  description: string;
  admin_id: string;
  target_type: string | null;
  target_id: string | null;
  ip_address: string | null;
  metadata: any;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  USER: User,
  SCENARIO: FileText,
  SYSTEM: Settings,
  SHOP: ShoppingBag,
  MODERATION: Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  USER: 'bg-blue-500/20 text-blue-400',
  SCENARIO: 'bg-purple-500/20 text-purple-400',
  SYSTEM: 'bg-gray-500/20 text-gray-400',
  SHOP: 'bg-yellow-500/20 text-yellow-400',
  MODERATION: 'bg-red-500/20 text-red-400',
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const limit = 20;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }

      setLogs(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / limit);

  // Stats por categoría
  const statsByCategory = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Logs de Auditoría" 
        subtitle={`${total} registros en total`}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <History className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsByCategory['USER'] || 0}</p>
                <p className="text-xs text-muted-foreground">Usuario</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsByCategory['SHOP'] || 0}</p>
                <p className="text-xs text-muted-foreground">Tienda</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsByCategory['MODERATION'] || 0}</p>
                <p className="text-xs text-muted-foreground">Moderación</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsByCategory['SYSTEM'] || 0}</p>
                <p className="text-xs text-muted-foreground">Sistema</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="USER">Usuario</option>
            <option value="SCENARIO">Escenario</option>
            <option value="SYSTEM">Sistema</option>
            <option value="SHOP">Tienda</option>
            <option value="MODERATION">Moderación</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay logs</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descripción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const IconComponent = CATEGORY_ICONS[log.category] || History;
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[log.category] || 'bg-gray-500/20 text-gray-400'}`}>
                            <IconComponent className="w-3 h-3" />
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{log.action}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {log.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
                <span className="text-sm">
                  Página {page} de {totalPages}
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
          )}
        </div>
      </div>
    </div>
  );
}