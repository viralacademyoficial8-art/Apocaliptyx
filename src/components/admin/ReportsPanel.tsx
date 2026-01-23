'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, ArrowUpCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAdminStore, AdminReport } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { AdminModal } from './AdminModal';
import { StatCard, StatsGrid } from './AdminStats';

export function ReportsPanel() {
  const {
    reports,
    reportFilters,
    setReportFilters,
    resolveReport,
    dismissReport,
    escalateReport,
    fetchReports,
    isLoading,
    error,
  } = useAdminStore();

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [resolution, setResolution] = useState('');

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchType = reportFilters.type === 'all' || r.type === reportFilters.type;
      const matchStatus = reportFilters.status === 'all' || r.status === reportFilters.status;
      const matchPriority = reportFilters.priority === 'all' || r.priority === reportFilters.priority;
      return matchType && matchStatus && matchPriority;
    });
  }, [reports, reportFilters]);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'PENDING').length;
    const critical = reports.filter(r => r.priority === 'CRITICAL').length;
    const resolved = reports.filter(r => r.status === 'RESOLVED').length;
    return { total, pending, critical, resolved };
  }, [reports]);

  const columns = [
    { key: 'type', header: 'Tipo' },
    {
      key: 'reason',
      header: 'Motivo',
      render: (r: AdminReport) => (
        <div className="space-y-1">
          <div className="text-white font-medium">{r.reason}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (r: AdminReport) => (
        <span
          className={[
            'text-xs px-2 py-1 rounded-full border',
            r.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-300 border-red-700/40'
              : r.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-300 border-orange-700/40'
              : r.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-700/40'
              : 'bg-gray-500/10 text-foreground border-border/40',
          ].join(' ')}
        >
          {r.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r: AdminReport) => (
        <span
          className={[
            'text-xs px-2 py-1 rounded-full border',
            r.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-700/40'
              : r.status === 'REVIEWED' ? 'bg-blue-500/10 text-blue-300 border-blue-700/40'
              : r.status === 'RESOLVED' ? 'bg-green-500/10 text-green-300 border-green-700/40'
              : 'bg-gray-500/10 text-foreground border-border/40',
          ].join(' ')}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (r: AdminReport) => <span className="text-muted-foreground text-sm">{new Date(r.createdAt).toLocaleString()}</span>,
    },
  ] as const;

  const Filters = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        value={reportFilters.type}
        onChange={(e) => setReportFilters({ type: e.target.value })}
        className="px-3 py-2 bg-muted border border-border rounded-lg text-white"
      >
        <option value="all">Todos los tipos</option>
        <option value="USER">USER</option>
        <option value="SCENARIO">SCENARIO</option>
        <option value="COMMENT">COMMENT</option>
        <option value="POST">POST</option>
      </select>

      <select
        value={reportFilters.status}
        onChange={(e) => setReportFilters({ status: e.target.value })}
        className="px-3 py-2 bg-muted border border-border rounded-lg text-white"
      >
        <option value="all">Todos los estados</option>
        <option value="PENDING">PENDING</option>
        <option value="REVIEWED">REVIEWED</option>
        <option value="RESOLVED">RESOLVED</option>
        <option value="DISMISSED">DISMISSED</option>
      </select>

      <select
        value={reportFilters.priority}
        onChange={(e) => setReportFilters({ priority: e.target.value })}
        className="px-3 py-2 bg-muted border border-border rounded-lg text-white"
      >
        <option value="all">Todas las prioridades</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
    </div>
  );

  // Loading state
  if (isLoading && reports.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando reportes...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card border border-red-800 rounded-xl p-6 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatCard title="Total" value={stats.total} icon={Eye} />
        <StatCard title="Pendientes" value={stats.pending} icon={XCircle} />
        <StatCard title="Críticos" value={stats.critical} icon={ArrowUpCircle} />
        <StatCard title="Resueltos" value={stats.resolved} icon={CheckCircle} />
      </StatsGrid>

      <AdminDataTable
        data={filtered}
        columns={columns as any}
        getItemId={(r) => r.id}
        searchPlaceholder="(Opcional) búsqueda local"
        filters={Filters}
        actions={(r: AdminReport) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSelected(r);
                setResolution(r.resolution || '');
                setOpenDetails(true);
              }}
              className="p-2 rounded-lg bg-muted text-foreground hover:text-foreground hover:bg-muted"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => escalateReport(r.id)}
              className="p-2 rounded-lg bg-orange-600/20 text-orange-300 hover:bg-orange-600/30"
              title="Escalar"
            >
              <ArrowUpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => resolveReport(r.id, 'Resuelto')}
              className="p-2 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30"
              title="Resolver rápido"
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => dismissReport(r.id, 'Descartado')}
              className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30"
              title="Descartar"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <AdminModal
        isOpen={openDetails}
        onClose={() => setOpenDetails(false)}
        title="Detalle del reporte"
        size="lg"
        footer={
          selected ? (
            <>
              <button
                onClick={() => setOpenDetails(false)}
                className="px-4 py-2 bg-muted text-gray-200 rounded-lg hover:bg-muted"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  if (!selected) return;
                  resolveReport(selected.id, resolution || 'Resuelto');
                  setOpenDetails(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
              >
                Guardar resolución
              </button>

              <button
                onClick={() => {
                  if (!selected) return;
                  dismissReport(selected.id, resolution || 'Descartado');
                  setOpenDetails(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Descartar
              </button>
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4 text-foreground">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/60 border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Tipo</div>
                <div className="text-white">{selected.type}</div>
              </div>
              <div className="bg-muted/60 border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Prioridad</div>
                <div className="text-white">{selected.priority}</div>
              </div>
              <div className="bg-muted/60 border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Estado</div>
                <div className="text-white">{selected.status}</div>
              </div>
              <div className="bg-muted/60 border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Fecha</div>
                <div className="text-white">{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Motivo</div>
              <div className="text-white font-medium">{selected.reason}</div>
              <div className="text-muted-foreground text-sm mt-1">{selected.description}</div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Reportado</div>
              <div className="text-white">
                {selected.reported.type} — {selected.reported.title || selected.reported.username || selected.reported.id}
              </div>
              <div className="text-muted-foreground text-sm mt-1">Reporter: {selected.reporter.username}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Resolución</div>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full min-h-[140px] px-3 py-2 bg-muted border border-border rounded-lg text-white"
                placeholder="Escribe la resolución..."
              />
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
