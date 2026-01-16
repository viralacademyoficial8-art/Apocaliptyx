'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { adminService, UserData } from '@/services/admin.service';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Search,
  MoreVertical,
  Ban,
  Shield,
  Coins,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Crown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ROLE_COLORS, ROLE_ICONS, ROLE_NAMES, UserRole } from '@/types/roles';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { can } = usePermissions();

  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes (immediate)
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getUsers({
        limit,
        offset: (page - 1) * limit,
        search: debouncedSearch || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    setActionLoading(userId);
    const result = await adminService.banUser(userId, !currentlyBanned);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    const result = await adminService.changeUserRole(userId, newRole);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleAdjustCoins = async (userId: string) => {
    const amount = prompt('Cantidad de AP Coins a agregar (número negativo para quitar):');
    if (!amount) return;
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount)) {
      alert('Ingresa un número válido');
      return;
    }

    setActionLoading(userId);
    const result = await adminService.adjustUserCoins(userId, numAmount);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / limit);

  const getRoleBadge = (role: string) => {
    const r = role as UserRole;
    const colors = ROLE_COLORS[r] || ROLE_COLORS.USER;
    const icon = ROLE_ICONS[r] || ROLE_ICONS.USER;
    const name = ROLE_NAMES[r] || 'Usuario';
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        {icon} {name}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión de Usuarios" 
        subtitle={`${total} usuarios registrados`}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los roles</option>
            <option value="USER">Usuarios</option>
            <option value="STAFF">Staff</option>
            <option value="MODERATOR">Moderadores</option>
            <option value="SUPER_ADMIN">Administradores</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">AP Coins</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registro</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{user.display_name || user.username}</p>
                            <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-yellow-400">
                          {user.ap_coins?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.is_banned ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                              <XCircle className="w-3 h-3" /> Baneado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3" /> Activo
                            </span>
                          )}
                          {user.is_premium && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                              <Crown className="w-3 h-3" /> Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === user.id}>
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.users.edit">
                              <DropdownMenuItem onClick={() => handleAdjustCoins(user.id)}>
                                <Coins className="w-4 h-4 mr-2" />
                                Ajustar Coins
                              </DropdownMenuItem>
                            </PermissionGate>
                            
                            <PermissionGate permission="admin.users.ban">
                              <DropdownMenuItem 
                                onClick={() => handleBanUser(user.id, user.is_banned)}
                                className={user.is_banned ? 'text-green-400' : 'text-red-400'}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {user.is_banned ? 'Desbanear' : 'Banear'}
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate permission="admin.users.change_role">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'USER')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Hacer Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'STAFF')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Hacer Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'MODERATOR')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Hacer Moderador
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'SUPER_ADMIN')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Hacer Admin
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
    </div>
  );
}