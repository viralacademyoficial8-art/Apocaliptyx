'use client';

import { useMemo, useState } from 'react';
import { Star, StarOff, Eye, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useAdminStore, AdminScenario } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { AdminModal } from './AdminModal';
import { StatCard, StatsGrid } from './AdminStats';

export function ScenarioModeration() {
  const {
    scenarios,
    scenarioFilters,
    setScenarioFilters,
    approveScenario,
    rejectScenario,
    featureScenario,
    resolveScenario,
    cancelScenario,
  } = useAdminStore();

  const [openDetails, setOpenDetails] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selected, setSelected] = useState<AdminScenario | null>(null);

  const filtered = useMemo(() => {
    const q = scenarioFilters.search.toLowerCase().trim();
    return scenarios
      .filter(s => {
        const matchQ = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
        const matchCat = scenarioFilters.category === 'all' || s.category === scenarioFilters.category;
        const matchStatus = scenarioFilters.status === 'all' || s.status === scenarioFilters.status;
        return matchQ && matchCat && matchStatus;
      })
      .sort((a, b) => {
        if (scenarioFilters.sortBy === 'pool') return b.totalPool - a.totalPool;
        if (scenarioFilters.sortBy === 'reports') return b.reportCount - a.reportCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [scenarios, scenarioFilters]);

  const stats = useMemo(() => {
    const total = scenarios.length;
    const active = scenarios.filter(s => s.status === 'ACTIVE').length;
    const pending = scenarios.filter(s => s.status === 'PENDING_APPROVAL').length;
    const reported = scenarios.filter(s => s.reportCount > 0).length;
    return { total, active, pending, reported };
  }, [scenarios]);

  const columns = [
    {
      key: 'title',
      header: 'Escenario',
      render: (s: AdminScenario) => (
        <div className="space-y-1">
          <div className="font-medium text-white">{s.title}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{s.description}</div>
        </div>
      ),
    },
    { key: 'category', header: 'Categoría' },
    {
      key: 'status',
      header: 'Estado',
      render: (s: AdminScenario) => (
        <span
          className={[
            'text-xs px-2 py-1 rounded-full border',
            s.status === 'ACTIVE' ? 'bg-green-500/10 text-green-300 border-green-700/40'
              : s.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-700/40'
              : s.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-300 border-blue-700/40'
              : 'bg-gray-500/10 text-gray-300 border-gray-700/40',
          ].join(' ')}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'pool',
      header: 'Pool',
      render: (s: AdminScenario) => <span className="text-gray-300">{s.totalPool.toLocaleString()}</span>,
    },
    {
      key: 'currentPrice',
      header: 'Precio',
      render: (s: AdminScenario) => <span className="text-gray-300">{s.currentPrice.toLocaleString()}</span>,
    },
    {
      key: 'reportCount',
      header: 'Reportes',
      render: (s: AdminScenario) => (
        <span className={s.reportCount > 0 ? 'text-red-300' : 'text-gray-400'}>
          {s.reportCount}
        </span>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Destacado',
      render: (s: AdminScenario) => (
        <span className={s.isFeatured ? 'text-yellow-300' : 'text-gray-500'}>
          {s.isFeatured ? 'Sí' : 'No'}
        </span>
      ),
    },
  ] as const;

  const Filters = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        value={scenarioFilters.category}
        onChange={(e) => setScenarioFilters({ category: e.target.value })}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        <option value="all">Todas las categorías</option>
        <option value="ECONOMIA">ECONOMIA</option>
        <option value="DEPORTES">DEPORTES</option>
        <option value="TECNOLOGIA">TECNOLOGIA</option>
        <option value="POLITICA">POLITICA</option>
        <option value="ENTRETENIMIENTO">ENTRETENIMIENTO</option>
        <option value="OTROS">OTROS</option>
      </select>

      <select
        value={scenarioFilters.status}
        onChange={(e) => setScenarioFilters({ status: e.target.value })}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        <option value="all">Todos los estados</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
        <option value="PENDING_RESOLUTION">PENDING_RESOLUTION</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="FAILED">FAILED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      <select
        value={scenarioFilters.sortBy}
        onChange={(e) => setScenarioFilters({ sortBy: e.target.value })}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        <option value="createdAt">Orden: Fecha</option>
        <option value="pool">Orden: Pool</option>
        <option value="reports">Orden: Reportes</option>
      </select>
    </div>
  );

  const openScenarioDetails = (s: AdminScenario) => {
    setSelected(s);
    setOpenDetails(true);
  };

  const openScenarioReject = (s: AdminScenario) => {
    setSelected(s);
    setRejectReason('');
    setOpenReject(true);
  };

  const openScenarioResolve = (s: AdminScenario) => {
    setSelected(s);
    setOpenResolve(true);
  };

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatCard title="Total" value={stats.total} icon={ShieldAlert} />
        <StatCard title="Activos" value={stats.active} icon={CheckCircle} />
        <StatCard title="Pendientes" value={stats.pending} icon={Eye} />
        <StatCard title="Reportados" value={stats.reported} icon={XCircle} />
      </StatsGrid>

      <AdminDataTable
        data={filtered}
        columns={columns as any}
        getItemId={(s) => s.id}
        searchPlaceholder="Buscar escenarios..."
        onSearch={(q) => setScenarioFilters({ search: q })}
        filters={Filters}
        actions={(s: AdminScenario) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openScenarioDetails(s)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => featureScenario(s.id, !s.isFeatured)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
              title={s.isFeatured ? 'Quitar destacado' : 'Destacar'}
            >
              {s.isFeatured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
            </button>

            {s.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  onClick={() => approveScenario(s.id)}
                  className="p-2 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30"
                  title="Aprobar"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openScenarioReject(s)}
                  className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30"
                  title="Rechazar"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {s.status === 'PENDING_RESOLUTION' && (
              <button
                onClick={() => openScenarioResolve(s)}
                className="p-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                title="Resolver"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}

            {s.status === 'ACTIVE' && s.reportCount >= 10 && (
              <button
                onClick={() => cancelScenario(s.id, 'Demasiados reportes')}
                className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30"
                title="Cancelar"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />

      {/* Details */}
      <AdminModal
        isOpen={openDetails}
        onClose={() => setOpenDetails(false)}
        title="Detalles del escenario"
        size="lg"
        footer={
          selected ? (
            <>
              <button
                onClick={() => setOpenDetails(false)}
                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
              {selected.status === 'PENDING_RESOLUTION' && (
                <button
                  onClick={() => { setOpenDetails(false); openScenarioResolve(selected); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Resolver
                </button>
              )}
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4 text-gray-300">
            <div>
              <div className="text-white font-semibold text-lg">{selected.title}</div>
              <div className="text-sm text-gray-500">{selected.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Categoría</div>
                <div className="text-white">{selected.category}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Estado</div>
                <div className="text-white">{selected.status}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Pool</div>
                <div className="text-white">{selected.totalPool.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Precio actual</div>
                <div className="text-white">{selected.currentPrice.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Votos</div>
                <div className="text-white">{selected.votesUp} ↑ / {selected.votesDown} ↓</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500">Reportes</div>
                <div className="text-white">{selected.reportCount}</div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Reject */}
      <AdminModal
        isOpen={openReject}
        onClose={() => setOpenReject(false)}
        title="Rechazar escenario"
        size="md"
        footer={
          <>
            <button
              onClick={() => setOpenReject(false)}
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                rejectScenario(selected.id, rejectReason || 'No cumple lineamientos');
                setOpenReject(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              Rechazar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-300 text-sm">
            Escribe una razón (mock). Después lo conectamos al backend.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Razón de rechazo..."
          />
        </div>
      </AdminModal>

      {/* Resolve */}
      <AdminModal
        isOpen={openResolve}
        onClose={() => setOpenResolve(false)}
        title="Resolver escenario"
        size="md"
        footer={
          <>
            <button
              onClick={() => setOpenResolve(false)}
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                resolveScenario(selected.id, true);
                setOpenResolve(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
            >
              Sucedió (✅)
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                resolveScenario(selected.id, false);
                setOpenResolve(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              No sucedió (❌)
            </button>
          </>
        }
      >
        <p className="text-gray-300 text-sm">
          Resolver manualmente (mock). Marca si el escenario se cumplió o falló.
        </p>
      </AdminModal>
    </div>
  );
}
