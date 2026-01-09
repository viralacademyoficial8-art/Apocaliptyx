'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  Trophy,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Users,
  Calendar,
  Coins,
  Play,
  Pause,
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
import { toast } from 'sonner';

interface Tournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  tournament_type: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  participants_count: number;
  min_predictions: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  creator?: {
    username: string;
    display_name: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  ended: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Próximo',
  active: 'Activo',
  ended: 'Finalizado',
  cancelled: 'Cancelado',
};

export default function AdminTorneosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_url: '',
    tournament_type: 'open',
    entry_fee: 0,
    prize_pool: 1000,
    max_participants: 100,
    min_predictions: 5,
    start_date: '',
    end_date: '',
  });

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/tournaments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTournaments(data.tournaments || []);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Error al cargar torneos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleStatusChange = async (tournament: Tournament, newStatus: string) => {
    setActionLoading(tournament.id);
    try {
      const response = await fetch('/api/admin/tournaments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tournament.id, status: newStatus })
      });

      if (response.ok) {
        toast.success('Estado actualizado');
        loadTournaments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return;

    setActionLoading(tournament.id);
    try {
      const response = await fetch(`/api/admin/tournaments?id=${tournament.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Torneo eliminado');
        loadTournaments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingTournament(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setFormData({
      name: '',
      description: '',
      banner_url: '',
      tournament_type: 'open',
      entry_fee: 0,
      prize_pool: 1000,
      max_participants: 100,
      min_predictions: 5,
      start_date: tomorrow.toISOString().slice(0, 16),
      end_date: nextWeek.toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const openEditModal = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      banner_url: tournament.banner_url || '',
      tournament_type: tournament.tournament_type,
      entry_fee: tournament.entry_fee,
      prize_pool: tournament.prize_pool,
      max_participants: tournament.max_participants || 100,
      min_predictions: tournament.min_predictions,
      start_date: tournament.start_date?.slice(0, 16) || '',
      end_date: tournament.end_date?.slice(0, 16) || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Las fechas son requeridas');
      return;
    }

    setActionLoading('saving');
    try {
      const method = editingTournament ? 'PATCH' : 'POST';
      const body = editingTournament
        ? { id: editingTournament.id, ...formData }
        : formData;

      const response = await fetch('/api/admin/tournaments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingTournament ? 'Torneo actualizado' : 'Torneo creado');
        setShowModal(false);
        loadTournaments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    totalPrize: tournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0),
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestor de Torneos"
        subtitle="Crea y administra torneos de predicciones"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Torneos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPrize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Premio Total AP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="upcoming">Próximos</option>
              <option value="active">Activos</option>
              <option value="ended">Finalizados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <PermissionGate permission="admin.shop.create">
            <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Torneo
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay torneos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Torneo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Participantes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Premio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fechas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{tournament.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {tournament.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">
                        {tournament.tournament_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{tournament.participants_count || 0}</span>
                          {tournament.max_participants && (
                            <span className="text-muted-foreground">/ {tournament.max_participants}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="text-yellow-400 font-medium">{tournament.prize_pool?.toLocaleString()} AP</span>
                          {tournament.entry_fee > 0 && (
                            <p className="text-xs text-muted-foreground">Entrada: {tournament.entry_fee} AP</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p>{new Date(tournament.start_date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            hasta {new Date(tournament.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tournament.status] || 'bg-gray-500/20 text-gray-400'}`}>
                          {STATUS_LABELS[tournament.status] || tournament.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === tournament.id}>
                              {actionLoading === tournament.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.shop.edit">
                              <DropdownMenuItem onClick={() => openEditModal(tournament)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {tournament.status === 'upcoming' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(tournament, 'active')}>
                                  <Play className="w-4 h-4 mr-2" />
                                  Iniciar
                                </DropdownMenuItem>
                              )}
                              {tournament.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusChange(tournament, 'ended')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Finalizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(tournament, 'cancelled')}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </PermissionGate>
                            <PermissionGate permission="admin.shop.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(tournament)} className="text-red-400">
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
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del torneo"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Descripción del torneo..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">URL del Banner</label>
                <input
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData(f => ({ ...f, banner_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.tournament_type}
                    onChange={(e) => setFormData(f => ({ ...f, tournament_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="open">Abierto</option>
                    <option value="invite_only">Solo Invitados</option>
                    <option value="community">Comunidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Máx. Participantes</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(f => ({ ...f, max_participants: parseInt(e.target.value) || 100 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Cuota de Entrada (AP)</label>
                  <input
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData(f => ({ ...f, entry_fee: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Premio Total (AP)</label>
                  <input
                    type="number"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData(f => ({ ...f, prize_pool: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Mín. Predicciones para Calificar</label>
                <input
                  type="number"
                  value={formData.min_predictions}
                  onChange={(e) => setFormData(f => ({ ...f, min_predictions: parseInt(e.target.value) || 5 }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha Fin *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={actionLoading === 'saving'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {actionLoading === 'saving' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
