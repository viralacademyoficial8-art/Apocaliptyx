'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import {
  FileText,
  Loader2,
  User,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  changes: Record<string, unknown>;
  previous_values: Record<string, unknown>;
  reason: string;
  created_at: string;
  admin?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Filters {
  entityTypes: string[];
  actions: string[];
  admins: { id: string; username: string; display_name: string }[];
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  ban: 'bg-red-500/20 text-red-400',
  unban: 'bg-green-500/20 text-green-400',
  warn: 'bg-yellow-500/20 text-yellow-400',
  resolve: 'bg-purple-500/20 text-purple-400',
  award_achievement: 'bg-purple-500/20 text-purple-400',
  grant_collectible: 'bg-pink-500/20 text-pink-400',
  grant_title: 'bg-pink-500/20 text-pink-400',
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<Filters>({ entityTypes: [], actions: [], admins: [] });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [selectedFilters, setSelectedFilters] = useState({
    adminId: '',
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '50',
        ...(selectedFilters.adminId && { adminId: selectedFilters.adminId }),
        ...(selectedFilters.entityType && { entityType: selectedFilters.entityType }),
        ...(selectedFilters.action && { action: selectedFilters.action }),
        ...(selectedFilters.startDate && { startDate: selectedFilters.startDate }),
        ...(selectedFilters.endDate && { endDate: selectedFilters.endDate }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs || []);
        setFilters(data.filters || { entityTypes: [], actions: [], admins: [] });
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Error al cargar logs');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, selectedFilters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const clearFilters = () => {
    setSelectedFilters({
      adminId: '',
      entityType: '',
      action: '',
      startDate: '',
      endDate: '',
    });
    setPagination(p => ({ ...p, page: 1 }));
  };

  const formatChanges = (changes: Record<string, unknown>) => {
    if (!changes || Object.keys(changes).length === 0) return null;
    return (
      <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs font-mono overflow-x-auto">
        <pre>{JSON.stringify(changes, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Logs de Auditoría"
        subtitle="Historial de acciones administrativas"
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Admin</label>
              <select
                value={selectedFilters.adminId}
                onChange={(e) => setSelectedFilters(f => ({ ...f, adminId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {filters.admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.display_name || admin.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Tipo de Entidad</label>
              <select
                value={selectedFilters.entityType}
                onChange={(e) => setSelectedFilters(f => ({ ...f, entityType: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {filters.entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Acción</label>
              <select
                value={selectedFilters.action}
                onChange={(e) => setSelectedFilters(f => ({ ...f, action: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">Todas</option>
                {filters.actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Desde</label>
              <input
                type="date"
                value={selectedFilters.startDate}
                onChange={(e) => setSelectedFilters(f => ({ ...f, startDate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Hasta</label>
              <input
                type="date"
                value={selectedFilters.endDate}
                onChange={(e) => setSelectedFilters(f => ({ ...f, endDate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
            <Button size="sm" onClick={() => loadLogs()} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {pagination.total} registros</span>
          <span>•</span>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
        </div>

        {/* Logs List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay logs de auditoría</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {log.admin?.avatar_url ? (
                        <img src={log.admin.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {log.admin?.display_name || log.admin?.username || 'Sistema'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                            {log.action}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {log.entity_type}
                          </span>
                        </div>

                        <p className="text-sm mt-1">
                          {log.entity_name && (
                            <span className="font-medium">{log.entity_name}</span>
                          )}
                          {log.reason && (
                            <span className="text-muted-foreground ml-2">— {log.reason}</span>
                          )}
                        </p>

                        {log.entity_id && (
                          <code className="text-xs text-muted-foreground bg-muted px-1 rounded mt-1 inline-block">
                            ID: {log.entity_id}
                          </code>
                        )}

                        {(log.changes && Object.keys(log.changes).length > 0) && (
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="flex items-center gap-1 text-xs text-purple-400 mt-2 hover:text-purple-300"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`} />
                            Ver cambios
                          </button>
                        )}

                        {expandedLog === log.id && formatChanges(log.changes)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
