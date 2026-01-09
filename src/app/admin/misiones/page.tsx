'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Mission {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  mission_type: string;
  category: string;
  requirements: Record<string, unknown>;
  rewards: { ap_coins?: number; xp?: number };
  icon: string;
  difficulty: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  daily: 'bg-green-500/20 text-green-400',
  weekly: 'bg-blue-500/20 text-blue-400',
  monthly: 'bg-purple-500/20 text-purple-400',
  special: 'bg-yellow-500/20 text-yellow-400',
  seasonal: 'bg-pink-500/20 text-pink-400',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-orange-400',
  extreme: 'text-red-400',
};

export default function AdminMisionesPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    mission_type: 'daily',
    category: 'general',
    requirements: '{"action": "login"}',
    rewards: '{"ap_coins": 10, "xp": 5}',
    icon: '🎯',
    difficulty: 'easy',
    is_active: true,
  });

  const loadMissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/admin/missions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMissions(data.missions || []);
      } else {
        toast.error(data.error || 'Error al cargar misiones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleToggleActive = async (mission: Mission) => {
    setActionLoading(mission.id);
    try {
      const response = await fetch('/api/admin/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mission.id, is_active: !mission.is_active })
      });

      if (response.ok) {
        toast.success(mission.is_active ? 'Misión desactivada' : 'Misión activada');
        loadMissions();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleDelete = async (mission: Mission) => {
    if (!confirm('¿Eliminar esta misión?')) return;

    setActionLoading(mission.id);
    try {
      const response = await fetch(`/api/admin/missions?id=${mission.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Misión eliminada');
        loadMissions();
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
    setEditingMission(null);
    setFormData({
      name: '',
      name_es: '',
      description: '',
      description_es: '',
      mission_type: 'daily',
      category: 'general',
      requirements: '{"action": "login"}',
      rewards: '{"ap_coins": 10, "xp": 5}',
      icon: '🎯',
      difficulty: 'easy',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setFormData({
      name: mission.name,
      name_es: mission.name_es,
      description: mission.description || '',
      description_es: mission.description_es || '',
      mission_type: mission.mission_type,
      category: mission.category || 'general',
      requirements: JSON.stringify(mission.requirements || {}),
      rewards: JSON.stringify(mission.rewards || {}),
      icon: mission.icon || '🎯',
      difficulty: mission.difficulty || 'easy',
      is_active: mission.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.name_es.trim()) {
      toast.error('Nombre en ambos idiomas es requerido');
      return;
    }

    let requirements, rewards;
    try {
      requirements = JSON.parse(formData.requirements);
      rewards = JSON.parse(formData.rewards);
    } catch {
      toast.error('JSON inválido en requisitos o recompensas');
      return;
    }

    setActionLoading('saving');
    try {
      const method = editingMission ? 'PATCH' : 'POST';
      const body = {
        ...(editingMission && { id: editingMission.id }),
        name: formData.name,
        name_es: formData.name_es,
        description: formData.description,
        description_es: formData.description_es,
        mission_type: formData.mission_type,
        category: formData.category,
        requirements,
        rewards,
        icon: formData.icon,
        difficulty: formData.difficulty,
        is_active: formData.is_active,
      };

      const response = await fetch('/api/admin/missions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingMission ? 'Misión actualizada' : 'Misión creada');
        setShowModal(false);
        loadMissions();
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
    total: missions.length,
    daily: missions.filter(m => m.mission_type === 'daily').length,
    weekly: missions.filter(m => m.mission_type === 'weekly').length,
    active: missions.filter(m => m.is_active).length,
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestor de Misiones"
        subtitle="Crea y administra misiones para los usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Misiones</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.daily}</p>
                <p className="text-xs text-muted-foreground">Diarias</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.weekly}</p>
                <p className="text-xs text-muted-foreground">Semanales</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tipos</option>
              <option value="daily">Diarias</option>
              <option value="weekly">Semanales</option>
              <option value="monthly">Mensuales</option>
              <option value="special">Especiales</option>
              <option value="seasonal">De Temporada</option>
            </select>
          </div>

          <PermissionGate permission="admin.shop.create">
            <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Misión
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay misiones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Misión</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dificultad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recompensa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((mission) => (
                    <tr key={mission.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{mission.icon}</span>
                          <div>
                            <p className="font-medium">{mission.name_es}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {mission.description_es}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[mission.mission_type] || 'bg-gray-500/20 text-gray-400'}`}>
                          {mission.mission_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">
                        {mission.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium capitalize ${DIFFICULTY_COLORS[mission.difficulty] || 'text-gray-400'}`}>
                          {mission.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          {mission.rewards?.ap_coins && (
                            <span className="text-yellow-400">{mission.rewards.ap_coins} AP</span>
                          )}
                          {mission.rewards?.xp && (
                            <>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-purple-400">{mission.rewards.xp} XP</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${mission.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {mission.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === mission.id}>
                              {actionLoading === mission.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.shop.edit">
                              <DropdownMenuItem onClick={() => openEditModal(mission)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(mission)}>
                                <Power className="w-4 h-4 mr-2" />
                                {mission.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.shop.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(mission)} className="text-red-400">
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingMission ? 'Editar Misión' : 'Nueva Misión'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Ícono</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(f => ({ ...f, icon: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-2xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tipo *</label>
                  <select
                    value={formData.mission_type}
                    onChange={(e) => setFormData(f => ({ ...f, mission_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="special">Especial</option>
                    <option value="seasonal">De Temporada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nombre (EN) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nombre (ES) *</label>
                  <input
                    type="text"
                    value={formData.name_es}
                    onChange={(e) => setFormData(f => ({ ...f, name_es: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Descripción (EN)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Descripción (ES)</label>
                  <textarea
                    value={formData.description_es}
                    onChange={(e) => setFormData(f => ({ ...f, description_es: e.target.value }))}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="general">General</option>
                    <option value="predictions">Predicciones</option>
                    <option value="social">Social</option>
                    <option value="content">Contenido</option>
                    <option value="community">Comunidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                    <option value="extreme">Extrema</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Requisitos (JSON) *</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(f => ({ ...f, requirements: e.target.value }))}
                  rows={2}
                  placeholder='{"predictions": 5}'
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Recompensas (JSON) *</label>
                <textarea
                  value={formData.rewards}
                  onChange={(e) => setFormData(f => ({ ...f, rewards: e.target.value }))}
                  rows={2}
                  placeholder='{"ap_coins": 50, "xp": 25}'
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Misión activa</span>
              </label>
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
