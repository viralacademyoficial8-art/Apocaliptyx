'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { 
  Plus,
  Trophy,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Target,
  Coins,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  rarity: string;
  requirement_type: string;
  requirement_value: number;
  coin_reward: number;
  xp_reward: number;
  is_active: boolean;
  unlocked_count: number;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-500/20 text-gray-400',
  RARE: 'bg-blue-500/20 text-blue-400',
  EPIC: 'bg-purple-500/20 text-purple-400',
  LEGENDARY: 'bg-yellow-500/20 text-yellow-400',
};

export default function AdminLogrosPage() {
  const supabase = getSupabaseBrowser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    icon: '🏆',
    name: '',
    description: '',
    rarity: 'COMMON',
    requirement_type: 'predictions',
    requirement_value: 1,
    coin_reward: 50,
    xp_reward: 100,
    is_active: true,
  });

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading achievements:', error);
        return;
      }

      setAchievements(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleToggleActive = async (achievement: Achievement) => {
    setActionLoading(achievement.id);
    const { error } = await supabase
      .from('achievements')
      .update({ is_active: !achievement.is_active, updated_at: new Date().toISOString() })
      .eq('id', achievement.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadAchievements();
    }
    setActionLoading(null);
  };

  const handleDelete = async (achievement: Achievement) => {
    if (!confirm('¿Eliminar este logro?')) return;
    
    setActionLoading(achievement.id);
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievement.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadAchievements();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingAchievement(null);
    setFormData({
      icon: '🏆',
      name: '',
      description: '',
      rarity: 'COMMON',
      requirement_type: 'predictions',
      requirement_value: 1,
      coin_reward: 50,
      xp_reward: 100,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      icon: achievement.icon || '🏆',
      name: achievement.name,
      description: achievement.description || '',
      rarity: achievement.rarity || 'COMMON',
      requirement_type: achievement.requirement_type,
      requirement_value: achievement.requirement_value,
      coin_reward: achievement.coin_reward || 0,
      xp_reward: achievement.xp_reward || 0,
      is_active: achievement.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const achievementData = {
      icon: formData.icon,
      name: formData.name,
      description: formData.description,
      rarity: formData.rarity,
      requirement_type: formData.requirement_type,
      requirement_value: formData.requirement_value,
      coin_reward: formData.coin_reward,
      xp_reward: formData.xp_reward,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingAchievement) {
      const { error } = await supabase
        .from('achievements')
        .update(achievementData)
        .eq('id', editingAchievement.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadAchievements();
      }
    } else {
      const { error } = await supabase
        .from('achievements')
        .insert(achievementData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadAchievements();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalAchievements = achievements.length;
  const activeAchievements = achievements.filter(a => a.is_active).length;
  const totalUnlocks = achievements.reduce((sum, a) => sum + (a.unlocked_count || 0), 0);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestor de Logros" 
        subtitle="Crea y administra los logros de la plataforma"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAchievements}</p>
                <p className="text-xs text-muted-foreground">Total Logros</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAchievements}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUnlocks}</p>
                <p className="text-xs text-muted-foreground">Desbloqueos</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.achievements.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Logro
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay logros creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Logro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rareza</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requisito</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recompensa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Desbloqueos</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr key={achievement.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="font-medium">{achievement.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RARITY_COLORS[achievement.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                          {achievement.rarity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-muted-foreground">{achievement.requirement_type}</span>
                        <span className="text-foreground font-medium ml-1">≥ {achievement.requirement_value}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-400">{achievement.coin_reward} AP</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-purple-400">{achievement.xp_reward} XP</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${achievement.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {achievement.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {achievement.unlocked_count || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === achievement.id}>
                              {actionLoading === achievement.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.achievements.edit">
                              <DropdownMenuItem onClick={() => openEditModal(achievement)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(achievement)}>
                                <Power className="w-4 h-4 mr-2" />
                                {achievement.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.achievements.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(achievement)} className="text-red-400">
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
                {editingAchievement ? 'Editar Logro' : 'Nuevo Logro'}
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
                    placeholder="🏆"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Rareza</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData(f => ({ ...f, rarity: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="COMMON">Común</option>
                    <option value="RARE">Raro</option>
                    <option value="EPIC">Épico</option>
                    <option value="LEGENDARY">Legendario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del logro"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Descripción del logro..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo de Requisito</label>
                  <select
                    value={formData.requirement_type}
                    onChange={(e) => setFormData(f => ({ ...f, requirement_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="predictions">Predicciones</option>
                    <option value="correct_predictions">Predicciones Correctas</option>
                    <option value="earnings">Ganancias</option>
                    <option value="level">Nivel</option>
                    <option value="referrals">Referidos</option>
                    <option value="purchases">Compras</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Valor Requerido</label>
                  <input
                    type="number"
                    value={formData.requirement_value}
                    onChange={(e) => setFormData(f => ({ ...f, requirement_value: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Recompensa (AP Coins)</label>
                  <input
                    type="number"
                    value={formData.coin_reward}
                    onChange={(e) => setFormData(f => ({ ...f, coin_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Recompensa (XP)</label>
                  <input
                    type="number"
                    value={formData.xp_reward}
                    onChange={(e) => setFormData(f => ({ ...f, xp_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Logro activo</span>
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