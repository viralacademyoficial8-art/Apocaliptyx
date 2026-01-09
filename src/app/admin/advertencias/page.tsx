'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  AlertTriangle,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  User,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Warning {
  id: string;
  user_id: string;
  admin_id: string;
  reason: string;
  severity: string;
  warning_type: string;
  details: string;
  expires_at: string;
  is_active: boolean;
  acknowledged_at: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  admin?: {
    id: string;
    username: string;
    display_name: string;
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-yellow-500/20 text-yellow-400',
  medium: 'bg-orange-500/20 text-orange-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-700/20 text-red-500',
};

const TYPE_LABELS: Record<string, string> = {
  content: 'Contenido',
  behavior: 'Comportamiento',
  spam: 'Spam',
  harassment: 'Acoso',
  fraud: 'Fraude',
  other: 'Otro',
};

export default function AdminAdvertenciasPage() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [activeFilter, setActiveFilter] = useState('true');
  const [formData, setFormData] = useState({
    userId: '',
    reason: '',
    warning_type: 'behavior',
    severity: 'low',
    details: '',
    expires_days: '',
  });

  const loadWarnings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        active: activeFilter
      });

      const response = await fetch(`/api/admin/warnings?${params}`);
      const data = await response.json();

      if (response.ok) {
        setWarnings(data.warnings || []);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Error al cargar advertencias');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, activeFilter]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  const handleToggleActive = async (warning: Warning, activate: boolean) => {
    setActionLoading(warning.id);
    try {
      const response = await fetch('/api/admin/warnings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: warning.id, action: activate ? 'activate' : 'deactivate' })
      });

      if (response.ok) {
        toast.success(activate ? 'Advertencia activada' : 'Advertencia desactivada');
        loadWarnings();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleDelete = async (warning: Warning) => {
    if (!confirm('¿Eliminar esta advertencia permanentemente?')) return;

    setActionLoading(warning.id);
    try {
      const response = await fetch(`/api/admin/warnings?id=${warning.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Advertencia eliminada');
        loadWarnings();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleCreateWarning = async () => {
    if (!formData.userId.trim() || !formData.reason.trim()) {
      toast.error('Usuario y razón son requeridos');
      return;
    }

    setActionLoading('saving');
    try {
      const response = await fetch('/api/admin/warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          reason: formData.reason,
          warning_type: formData.warning_type,
          severity: formData.severity,
          details: formData.details,
          expires_days: formData.expires_days ? parseInt(formData.expires_days) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.auto_banned) {
          toast.warning('Usuario baneado automáticamente por exceder límite de advertencias');
        } else {
          toast.success('Advertencia creada');
        }
        setShowModal(false);
        loadWarnings();
      } else {
        toast.error(data.error || 'Error al crear advertencia');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setFormData({
      userId: '',
      reason: '',
      warning_type: 'behavior',
      severity: 'low',
      details: '',
      expires_days: '',
    });
    setShowModal(true);
  };

  const stats = {
    total: warnings.length,
    active: warnings.filter(w => w.is_active).length,
    critical: warnings.filter(w => w.severity === 'critical' || w.severity === 'high').length,
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Sistema de Advertencias"
        subtitle="Gestiona las advertencias a usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Advertencias</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Críticas/Altas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>

          <PermissionGate permission="admin.users.ban">
            <Button onClick={openNewModal} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Advertencia
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : warnings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay advertencias</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Razón</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((warning) => (
                    <tr key={warning.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {warning.user?.avatar_url ? (
                            <img src={warning.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{warning.user?.display_name || warning.user?.username || 'Usuario'}</p>
                            <p className="text-xs text-muted-foreground">@{warning.user?.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {TYPE_LABELS[warning.warning_type] || warning.warning_type}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[warning.severity] || 'bg-gray-500/20 text-gray-400'}`}>
                          {warning.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm max-w-[200px] truncate">
                        {warning.reason}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {warning.admin?.username || 'Sistema'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(warning.created_at).toLocaleDateString()}
                        </div>
                        {warning.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expira: {new Date(warning.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${warning.is_active ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {warning.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === warning.id}>
                              {actionLoading === warning.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.users.ban">
                              <DropdownMenuItem onClick={() => handleToggleActive(warning, !warning.is_active)}>
                                <Power className="w-4 h-4 mr-2" />
                                {warning.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.users.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(warning)} className="text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Nueva Advertencia</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">ID de Usuario *</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData(f => ({ ...f, userId: e.target.value }))}
                  placeholder="UUID del usuario"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo *</label>
                  <select
                    value={formData.warning_type}
                    onChange={(e) => setFormData(f => ({ ...f, warning_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="content">Contenido</option>
                    <option value="behavior">Comportamiento</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Acoso</option>
                    <option value="fraud">Fraude</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Severidad *</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData(f => ({ ...f, severity: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Razón *</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Razón de la advertencia"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Detalles adicionales</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData(f => ({ ...f, details: e.target.value }))}
                  rows={3}
                  placeholder="Información adicional..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Expira en (días)</label>
                <input
                  type="number"
                  value={formData.expires_days}
                  onChange={(e) => setFormData(f => ({ ...f, expires_days: e.target.value }))}
                  placeholder="Dejar vacío para permanente"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateWarning}
                disabled={actionLoading === 'saving'}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {actionLoading === 'saving' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Crear Advertencia
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
