'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { useAuthStore } from '@/lib/stores';
import { 
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  ExternalLink,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


// Razones de reporte
const REPORT_REASONS: Record<string, { label: string; color: string }> = {
  duplicate: { label: 'Duplicado', color: 'bg-blue-500/20 text-blue-400' },
  inappropriate: { label: 'Inapropiado', color: 'bg-red-500/20 text-red-400' },
  misleading: { label: 'Engañoso', color: 'bg-orange-500/20 text-orange-400' },
  spam: { label: 'Spam', color: 'bg-yellow-500/20 text-yellow-400' },
  impossible: { label: 'Imposible verificar', color: 'bg-purple-500/20 text-purple-400' },
  other: { label: 'Otro', color: 'bg-gray-500/20 text-gray-400' },
};

// Estados de reporte
const REPORT_STATUS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendiente', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-500/20 text-yellow-400' },
  reviewed: { label: 'Revisado', icon: <Eye className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400' },
  resolved: { label: 'Resuelto', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400' },
  dismissed: { label: 'Descartado', icon: <XCircle className="w-3 h-3" />, color: 'bg-gray-500/20 text-gray-400' },
};

interface ScenarioReport {
  id: string;
  reporter_id: string;
  scenario_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  scenario?: {
    title: string;
    status: string;
    creator_id: string;
  };
}

export default function AdminReportesPage() {
  const supabase = getSupabaseBrowser();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<ScenarioReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ScenarioReport | null>(null);
  
  const limit = 10;

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('scenario_reports')
        .select(`
          *,
          reporter:users!scenario_reports_reporter_id_fkey(username, display_name, avatar_url),
          scenario:scenarios!scenario_reports_scenario_id_fkey(title, status, creator_id)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setReports(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filtrar por búsqueda en el frontend
  const filteredReports = reports.filter(report => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      report.scenario?.title?.toLowerCase().includes(searchLower) ||
      report.reporter?.username?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(reportId);
    try {
      const { error } = await supabase
        .from('scenario_reports')
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      // Recargar reportes
      loadReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Error al actualizar el reporte');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteScenario = async (scenarioId: string, reportId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este escenario? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(reportId);
    try {
      // Marcar escenario como cancelado
      const { error: scenarioError } = await supabase
        .from('scenarios')
        .update({ status: 'CANCELLED' })
        .eq('id', scenarioId);

      if (scenarioError) throw scenarioError;

      // Marcar reporte como resuelto
      await handleUpdateStatus(reportId, 'resolved');
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Error al eliminar el escenario');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getReasonBadge = (reason: string) => {
    const r = REPORT_REASONS[reason] || REPORT_REASONS.other;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>
        {r.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = REPORT_STATUS[status] || REPORT_STATUS.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  // Contadores por estado
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Reportes de Escenarios" 
        subtitle={`${total} reportes totales • ${pendingCount} pendientes`}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'reviewed').length}</p>
                <p className="text-xs text-muted-foreground">En revisión</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
                <p className="text-xs text-muted-foreground">Resueltos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'dismissed').length}</p>
                <p className="text-xs text-muted-foreground">Descartados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por escenario, usuario o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="reviewed">En revisión</option>
            <option value="resolved">Resueltos</option>
            <option value="dismissed">Descartados</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron reportes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Escenario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reportado por</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Motivo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="font-medium line-clamp-1 max-w-xs">
                              {report.scenario?.title || 'Escenario eliminado'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.scenario?.status === 'ACTIVE' ? '🟢 Activo' : '⚪ ' + report.scenario?.status}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {report.reporter?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm">@{report.reporter?.username || 'usuario'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getReasonBadge(report.reason)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/escenario/${report.scenario_id}`, '_blank')}
                            title="Ver escenario"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Modal de detalles */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                Detalles del Reporte
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Escenario */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Escenario reportado</p>
                <p className="font-medium">{selectedReport.scenario?.title}</p>
              </div>

              {/* Reportado por */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reportado por</p>
                  <p className="font-medium">@{selectedReport.reporter?.username}</p>
                </div>
              </div>

              {/* Motivo */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Motivo</p>
                {getReasonBadge(selectedReport.reason)}
              </div>

              {/* Descripción */}
              {selectedReport.description && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Descripción adicional</p>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              )}

              {/* Estado actual */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Estado actual</p>
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Acciones */}
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-sm font-medium mb-2">Acciones</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                      disabled={actionLoading === selectedReport.id}
                      className="w-full"
                    >
                      {actionLoading === selectedReport.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Marcar en revisión
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                    disabled={actionLoading === selectedReport.id}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Descartar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    disabled={actionLoading === selectedReport.id}
                    className="w-full text-green-400 border-green-500/50 hover:bg-green-500/20"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolver
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteScenario(selectedReport.scenario_id, selectedReport.id)}
                    disabled={actionLoading === selectedReport.id}
                    className="w-full text-red-400 border-red-500/50 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar escenario
                  </Button>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(`/escenario/${selectedReport.scenario_id}`, '_blank')}
                  className="w-full mt-2"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver escenario completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}