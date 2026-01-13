'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Coins,
  Zap,
  Calendar,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Mission {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  mission_type: string;
  category: string;
  requirements: Record<string, number>;
  rewards: { ap_coins?: number; xp?: number; items?: string[] };
  icon: string;
  difficulty: string;
  is_active: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  daily: { label: 'Diaria', color: 'bg-blue-500/20 text-blue-400' },
  weekly: { label: 'Semanal', color: 'bg-purple-500/20 text-purple-400' },
  monthly: { label: 'Mensual', color: 'bg-pink-500/20 text-pink-400' },
  special: { label: 'Especial', color: 'bg-yellow-500/20 text-yellow-400' },
  seasonal: { label: 'Temporada', color: 'bg-green-500/20 text-green-400' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-orange-500/20 text-orange-400',
  extreme: 'bg-red-500/20 text-red-400',
};

export default function AdminMisionesPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    mission_type: 'daily',
    category: 'predictions',
    icon: '🎯',
    difficulty: 'easy',
    is_active: true,
    requirement_type: 'predictions',
    requirement_value: 1,
    reward_ap: 50,
    reward_xp: 100,
  });

  const loadMissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mission_definitions')
        .select('*')
        .order('mission_type')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading missions:', error);
        return;
      }

      setMissions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleToggleActive = async (mission: Mission) => {
    setActionLoading(mission.id);
    const { error } = await supabase
      .from('mission_definitions')
      .update({ is_active: !mission.is_active, updated_at: new Date().toISOString() })
      .eq('id', mission.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadMissions();
    }
    setActionLoading(null);
  };

  const handleDelete = async (mission: Mission) => {
    if (!confirm('¿Eliminar esta misión?')) return;

    setActionLoading(mission.id);
    const { error } = await supabase
      .from('mission_definitions')
      .delete()
      .eq('id', mission.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadMissions();
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
      category: 'predictions',
      icon: '🎯',
      difficulty: 'easy',
      is_active: true,
      requirement_type: 'predictions',
      requirement_value: 1,
      reward_ap: 50,
      reward_xp: 100,
    });
    setShowModal(true);
  };

  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    const requirements = mission.requirements || {};
    const rewards = mission.rewards || {};
    const reqType = Object.keys(requirements)[0] || 'predictions';
    const reqValue = Object.values(requirements)[0] || 1;

    setFormData({
      name: mission.name,
      name_es: mission.name_es || mission.name,
      description: mission.description || '',
      description_es: mission.description_es || mission.description || '',
      mission_type: mission.mission_type,
      category: mission.category || 'predictions',
      icon: mission.icon || '🎯',
      difficulty: mission.difficulty || 'easy',
      is_active: mission.is_active ?? true,
      requirement_type: reqType,
      requirement_value: reqValue as number,
      reward_ap: rewards.ap_coins || 0,
      reward_xp: rewards.xp || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const missionData = {
      name: formData.name,
      name_es: formData.name_es || formData.name,
      description: formData.description,
      description_es: formData.description_es || formData.description,
      mission_type: formData.mission_type,
      category: formData.category,
      icon: formData.icon,
      difficulty: formData.difficulty,
      is_active: formData.is_active,
      requirements: { [formData.requirement_type]: formData.requirement_value },
      rewards: {
        ap_coins: formData.reward_ap,
        xp: formData.reward_xp,
      },
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingMission) {
      const { error } = await supabase
        .from('mission_definitions')
        .update(missionData)
        .eq('id', editingMission.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadMissions();
      }
    } else {
      const { error } = await supabase
        .from('mission_definitions')
        .insert(missionData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadMissions();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => m.is_active).length;
  const dailyMissions = missions.filter(m => m.mission_type === 'daily').length;
  const weeklyMissions = missions.filter(m => m.mission_type === 'weekly').length;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Misiones"
        subtitle="Crea y administra misiones para los usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMissions}</p>
                <p className="text-xs text-muted-foreground">Total Misiones</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Power className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMissions}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dailyMissions}</p>
                <p className="text-xs text-muted-foreground">Diarias</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Star className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weeklyMissions}</p>
                <p className="text-xs text-muted-foreground">Semanales</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.missions.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Misión
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay misiones creadas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Misión</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dificultad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requisito</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recompensa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((mission) => {
                    const typeConfig = TYPE_LABELS[mission.mission_type] || TYPE_LABELS.daily;
                    const requirements = mission.requirements || {};
                    const rewards = mission.rewards || {};
                    const reqType = Object.keys(requirements)[0] || 'predictions';
                    const reqValue = Object.values(requirements)[0] || 0;

                    return (
                      <tr key={mission.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{mission.icon}</span>
                            <div>
                              <p className="font-medium">{mission.name_es || mission.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {mission.description_es || mission.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${DIFFICULTY_COLORS[mission.difficulty] || 'bg-gray-500/20 text-gray-400'}`}>
                            {mission.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="text-muted-foreground">{reqType}</span>
                          <span className="text-foreground font-medium ml-1">= {reqValue}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            {rewards.ap_coins && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Coins className="w-3 h-3" />
                                {rewards.ap_coins}
                              </span>
                            )}
                            {rewards.xp && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <Zap className="w-3 h-3" />
                                {rewards.xp}
                              </span>
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
                              <PermissionGate permission="admin.missions.edit">
                                <DropdownMenuItem onClick={() => openEditModal(mission)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(mission)}>
                                  <Power className="w-4 h-4 mr-2" />
                                  {mission.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.missions.delete">
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
                    );
                  })}
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
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.mission_type}
                    onChange={(e) => setFormData(f => ({ ...f, mission_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="special">Especial</option>
                    <option value="seasonal">Temporada</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                    <option value="extreme">Extrema</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Nombre (EN) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Mission name"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Nombre (ES)</label>
                <input
                  type="text"
                  value={formData.name_es}
                  onChange={(e) => setFormData(f => ({ ...f, name_es: e.target.value }))}
                  placeholder="Nombre de la misión"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción (EN)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Description..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción (ES)</label>
                <textarea
                  value={formData.description_es}
                  onChange={(e) => setFormData(f => ({ ...f, description_es: e.target.value }))}
                  rows={2}
                  placeholder="Descripción..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="predictions">Predicciones</option>
                  <option value="social">Social</option>
                  <option value="shopping">Compras</option>
                  <option value="community">Comunidad</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                <label className="text-sm font-medium">Requisito</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Tipo</label>
                    <select
                      value={formData.requirement_type}
                      onChange={(e) => setFormData(f => ({ ...f, requirement_type: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="predictions">Predicciones</option>
                      <option value="correct_predictions">Predicciones Correctas</option>
                      <option value="earnings">Ganancias (AP)</option>
                      <option value="spending">Gastar (AP)</option>
                      <option value="shares">Compartir</option>
                      <option value="comments">Comentarios</option>
                      <option value="logins">Inicios de sesión</option>
                      <option value="referrals">Referidos</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Cantidad</label>
                    <input
                      type="number"
                      value={formData.requirement_value}
                      onChange={(e) => setFormData(f => ({ ...f, requirement_value: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                <label className="text-sm font-medium">Recompensas</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">AP Coins</label>
                    <input
                      type="number"
                      value={formData.reward_ap}
                      onChange={(e) => setFormData(f => ({ ...f, reward_ap: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">XP</label>
                    <input
                      type="number"
                      value={formData.reward_xp}
                      onChange={(e) => setFormData(f => ({ ...f, reward_xp: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
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
