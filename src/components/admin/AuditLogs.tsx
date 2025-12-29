'use client';

import { useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { useAdminStore, AuditLog } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { StatCard, StatsGrid } from './AdminStats';

export function AuditLogs() {
  const { auditLogs } = useAdminStore();
  const [category, setCategory] = useState<'all' | AuditLog['category']>('all');

  const filtered = useMemo(() => {
    if (category === 'all') return auditLogs;
    return auditLogs.filter(l => l.category === category);
  }, [auditLogs, category]);

  const stats = useMemo(() => {
    const total = auditLogs.length;
    const byCat = (c: AuditLog['category']) => auditLogs.filter(l => l.category === c).length;
    return {
      total,
      user: byCat('USER'),
      scenario: byCat('SCENARIO'),
      system: byCat('SYSTEM'),
      shop: byCat('SHOP'),
      moderation: byCat('MODERATION'),
    };
  }, [auditLogs]);

  const columns = [
    { key: 'createdAt', header: 'Fecha', render: (l: AuditLog) => <span className="text-gray-400 text-sm">{new Date(l.createdAt).toLocaleString()}</span> },
    { key: 'category', header: 'Categoría' },
    { key: 'action', header: 'Acción', render: (l: AuditLog) => <span className="text-white font-medium">{l.action}</span> },
    { key: 'description', header: 'Descripción', render: (l: AuditLog) => <span className="text-gray-300">{l.description}</span> },
    { key: 'admin', header: 'Admin', render: (l: AuditLog) => <span className="text-gray-300">{l.admin.username}</span> },
    { key: 'ipAddress', header: 'IP', render: (l: AuditLog) => <span className="text-gray-500">{l.ipAddress ?? '—'}</span> },
  ] as const;

  const Filters = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as any)}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        <option value="all">Todas</option>
        <option value="USER">USER</option>
        <option value="SCENARIO">SCENARIO</option>
        <option value="SYSTEM">SYSTEM</option>
        <option value="SHOP">SHOP</option>
        <option value="MODERATION">MODERATION</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <StatsGrid columns={4}>
        <StatCard title="Total logs" value={stats.total} icon={History} />
        <StatCard title="Moderación" value={stats.moderation} icon={History} />
        <StatCard title="Sistema" value={stats.system} icon={History} />
        <StatCard title="Tienda" value={stats.shop} icon={History} />
      </StatsGrid>

      <AdminDataTable
        data={filtered}
        columns={columns as any}
        getItemId={(l) => l.id}
        filters={Filters}
        searchPlaceholder="(Opcional) búsqueda local"
        emptyMessage="No hay logs"
      />
    </div>
  );
}
