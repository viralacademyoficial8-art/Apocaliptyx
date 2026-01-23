'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Shield, BadgeCheck, Coins, UserCog, Eye, Loader2 } from 'lucide-react';
import { useAdminStore, type AdminUser } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { AdminModal } from './AdminModal';
import { StatCard, StatsGrid } from './AdminStats';

export function UserManagement() {
  const {
    users,
    userFilters,
    setUserFilters,
    selectedUsers,
    toggleUserSelection,
    bulkBanUsers,
    verifyUser,
    banUser,
    unbanUser,
    changeUserRole,
    adjustUserCoins,
    fetchUsers,
    isLoading,
    error,
    usersPagination,
  } = useAdminStore();

  // Fetch users on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, userFilters.role, userFilters.status]);

  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [coinsTarget, setCoinsTarget] = useState<AdminUser | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<number>(0);
  const [coinsReason, setCoinsReason] = useState('');

  const filtered = useMemo(() => {
    const q = userFilters.search.trim().toLowerCase();

    return users
      .filter((u) => {
        const matchesSearch =
          !q ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.displayName ?? '').toLowerCase().includes(q);

        const matchesRole = userFilters.role === 'all' || u.role === userFilters.role;

        const status = u.isBanned ? 'banned' : u.isVerified ? 'verified' : 'unverified';
        const matchesStatus = userFilters.status === 'all' || userFilters.status === status;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (userFilters.sortBy === 'coins') return b.apCoins - a.apCoins;
        if (userFilters.sortBy === 'level') return b.level - a.level;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [users, userFilters]);

  const stats = useMemo(() => {
    const total = users.length;
    const banned = users.filter((u) => u.isBanned).length;
    const verified = users.filter((u) => u.isVerified && !u.isBanned).length;
    const active = total - banned;
    return { total, active, banned, verified };
  }, [users]);

  const columns = [
    {
      key: 'user',
      header: 'Usuario',
      render: (u: AdminUser) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">@{u.username}</span>
          <span className="text-xs text-muted-foreground">{u.email}</span>
        </div>
      ),
    },
    { key: 'role', header: 'Rol', render: (u: AdminUser) => <span className="text-gray-200">{u.role}</span> },
    { key: 'apCoins', header: 'AP Coins', render: (u: AdminUser) => <span className="text-gray-200">{u.apCoins.toLocaleString()}</span> },
    { key: 'level', header: 'Nivel', render: (u: AdminUser) => <span className="text-gray-200">{u.level}</span> },
    {
      key: 'status',
      header: 'Estado',
      render: (u: AdminUser) => (
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            u.isBanned
              ? 'border-red-700/60 bg-red-900/20 text-red-300'
              : u.isVerified
              ? 'border-green-700/60 bg-green-900/20 text-green-300'
              : 'border-yellow-700/60 bg-yellow-900/20 text-yellow-300'
          }`}
        >
          {u.isBanned ? 'Baneado' : u.isVerified ? 'Verificado' : 'Sin verificar'}
        </span>
      ),
    },
  ] as const;

  const Filters = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <select
        value={userFilters.role}
        onChange={(e) => setUserFilters({ role: e.target.value })}
        className="bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
      >
        <option value="all">Todos los roles</option>
        <option value="USER">USER</option>
        <option value="MODERATOR">MODERATOR</option>
        <option value="ADMIN">ADMIN</option>
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
      </select>

      <select
        value={userFilters.status}
        onChange={(e) => setUserFilters({ status: e.target.value })}
        className="bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
      >
        <option value="all">Todos los estados</option>
        <option value="verified">Verificados</option>
        <option value="unverified">Sin verificar</option>
        <option value="banned">Baneados</option>
      </select>

      <select
        value={userFilters.sortBy}
        onChange={(e) => setUserFilters({ sortBy: e.target.value })}
        className="bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
      >
        <option value="createdAt">Más nuevos</option>
        <option value="coins">Más coins</option>
        <option value="level">Mayor nivel</option>
      </select>

      <button
        onClick={() => setUserFilters({ search: '', role: 'all', status: 'all', sortBy: 'createdAt' })}
        className="bg-muted hover:bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
      >
        Reset filtros
      </button>
    </div>
  );

  const bulkActions = (
    <div className="flex items-center gap-2">
      <input
        value={banReason}
        onChange={(e) => setBanReason(e.target.value)}
        placeholder="Razón del ban masivo..."
        className="bg-muted border border-border rounded-lg px-3 py-2 text-gray-200 w-64"
      />
      <button
        onClick={() => bulkBanUsers(selectedUsers, banReason || 'Incumplimiento de reglas')}
        className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-2"
      >
        Ban masivo
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <StatsGrid columns={4}>
        <StatCard title="Total usuarios" value={stats.total} icon={Users} />
        <StatCard title="Activos" value={stats.active} icon={BadgeCheck} iconColor="text-green-400" iconBg="bg-green-500/20" />
        <StatCard title="Baneados" value={stats.banned} icon={Shield} iconColor="text-red-400" iconBg="bg-red-500/20" />
        <StatCard title="Verificados" value={stats.verified} icon={BadgeCheck} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" />
      </StatsGrid>

      <AdminDataTable<AdminUser>
        data={filtered}
        columns={columns as any}
        getItemId={(u) => u.id}
        searchPlaceholder="Buscar por username, email o display name..."
        onSearch={(q) => setUserFilters({ search: q })}
        filters={Filters}
        selectable
        selectedIds={selectedUsers}
        onSelect={(id) => toggleUserSelection(id)}
        onSelectAll={() => {
          const ids = filtered.map((u) => u.id);
          ids.forEach((id) => toggleUserSelection(id));
        }}
        bulkActions={bulkActions}
        actions={(u) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDetailsUser(u)}
              className="p-2 rounded-lg bg-muted hover:bg-muted text-gray-200"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>

            {!u.isVerified && !u.isBanned && (
              <button
                onClick={() => verifyUser(u.id)}
                className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200"
                title="Verificar"
              >
                <BadgeCheck className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setCoinsTarget(u)}
              className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200"
              title="Ajustar coins"
            >
              <Coins className="w-4 h-4" />
            </button>

            <button
              onClick={() => changeUserRole(u.id, u.role === 'USER' ? 'MODERATOR' : 'USER')}
              className="p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200"
              title="Cambiar rol (toggle demo)"
            >
              <UserCog className="w-4 h-4" />
            </button>

            {u.isBanned ? (
              <button
                onClick={() => unbanUser(u.id)}
                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted text-gray-200 text-xs"
                title="Desbanear"
              >
                Unban
              </button>
            ) : (
              <button
                onClick={() => setBanTarget(u)}
                className="px-3 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs"
                title="Banear"
              >
                Ban
              </button>
            )}
          </div>
        )}
      />

      <AdminModal isOpen={!!detailsUser} onClose={() => setDetailsUser(null)} title="Detalles del usuario" size="lg">
        {detailsUser && (
          <div className="space-y-4 text-gray-200">
            {/* ...tu contenido de modal sigue igual... */}
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        title="Banear usuario"
        footer={
          <>
            <button onClick={() => setBanTarget(null)} className="px-3 py-2 rounded-lg bg-muted hover:bg-muted text-gray-200">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (banTarget) banUser(banTarget.id, banReason || 'Incumplimiento de reglas');
                setBanTarget(null);
                setBanReason('');
              }}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
            >
              Banear
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-foreground">
            Usuario: <span className="text-white font-semibold">@{banTarget?.username}</span>
          </p>
          <input
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Razón del ban..."
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
          />
        </div>
      </AdminModal>

      <AdminModal
        isOpen={!!coinsTarget}
        onClose={() => setCoinsTarget(null)}
        title="Ajustar AP Coins"
        footer={
          <>
            <button onClick={() => setCoinsTarget(null)} className="px-3 py-2 rounded-lg bg-muted hover:bg-muted text-gray-200">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (coinsTarget) adjustUserCoins(coinsTarget.id, coinsAmount, coinsReason || 'Ajuste admin');
                setCoinsTarget(null);
                setCoinsAmount(0);
                setCoinsReason('');
              }}
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
            >
              Aplicar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-foreground">
            Usuario: <span className="text-white font-semibold">@{coinsTarget?.username}</span>
          </p>
          <input
            type="number"
            value={coinsAmount}
            onChange={(e) => setCoinsAmount(Number(e.target.value))}
            placeholder="Ej: 500 o -200"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
          />
          <input
            value={coinsReason}
            onChange={(e) => setCoinsReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-gray-200"
          />
          <p className="text-xs text-muted-foreground">Tip: número positivo suma, negativo resta. 😈</p>
        </div>
      </AdminModal>
    </div>
  );
}
