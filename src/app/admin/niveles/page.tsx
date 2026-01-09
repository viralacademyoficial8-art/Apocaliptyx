'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  TrendingUp,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Users,
  Award,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Rank {
  id: string;
  name: string;
  name_es: string;
  min_level: number;
  max_level: number | null;
  icon: string;
  color: string;
  perks: Record<string, unknown>;
  created_at: string;
}

interface LevelData {
  ranks: Rank[];
  settings: Array<{ key: string; value: string; category: string }>;
  levelDistribution: Record<string, number>;
  rankDistribution: Record<string, number>;
  totalUsers: number;
}

export default function AdminNivelesPage() {
  const [data, setData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    min_level: 0,
    max_level: '',
    icon: '🥉',
    color: '#CD7F32',
    perks: '{}',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/levels');
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        toast.error(result.error || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (rank: Rank) => {
    if (!confirm('¿Eliminar este rango?')) return;

    setActionLoading(rank.id);
    try {
      const response = await fetch(`/api/admin/levels?id=${rank.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Rango eliminado');
        loadData();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingRank(null);
    setFormData({
      name: '',
      name_es: '',
      min_level: 0,
      max_level: '',
      icon: '🥉',
      color: '#CD7F32',
      perks: '{}',
    });
    setShowModal(true);
  };

  const openEditModal = (rank: Rank) => {
    setEditingRank(rank);
    setFormData({
      name: rank.name,
      name_es: rank.name_es,
      min_level: rank.min_level,
      max_level: rank.max_level?.toString() || '',
      icon: rank.icon || '🥉',
      color: rank.color || '#CD7F32',
      perks: JSON.stringify(rank.perks || {}),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.name_es.trim() || !formData.icon.trim() || !formData.color.trim()) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    let perks;
    try {
      perks = JSON.parse(formData.perks);
    } catch {
      toast.error('JSON de perks inválido');
      return;
    }

    setActionLoading('saving');
    try {
      const method = editingRank ? 'PATCH' : 'POST';
      const body = {
        ...(editingRank && { id: editingRank.id }),
        name: formData.name,
        name_es: formData.name_es,
        min_level: formData.min_level,
        max_level: formData.max_level ? parseInt(formData.max_level) : null,
        icon: formData.icon,
        color: formData.color,
        perks,
      };

      const response = await fetch('/api/admin/levels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingRank ? 'Rango actualizado' : 'Rango creado');
        setShowModal(false);
        loadData();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const ranks = data?.ranks || [];
  const totalUsers = data?.totalUsers || 0;
  const rankDistribution = data?.rankDistribution || {};
  const levelDistribution = data?.levelDistribution || {};

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestor de Niveles y Rangos"
        subtitle="Configura el sistema de progresión"
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ranks.length}</p>
                    <p className="text-xs text-muted-foreground">Total Rangos</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Usuarios Totales</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {ranks.length > 0 ? ranks[ranks.length - 1].min_level : 0}+
                    </p>
                    <p className="text-xs text-muted-foreground">Nivel Máximo</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Object.keys(levelDistribution).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Rangos de Nivel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Distribution Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución por Rango</h3>
              <div className="space-y-3">
                {ranks.map(rank => {
                  const count = rankDistribution[rank.name] || 0;
                  const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                  return (
                    <div key={rank.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{rank.icon}</span>
                          <span style={{ color: rank.color }}>{rank.name_es}</span>
                          <span className="text-muted-foreground text-xs">
                            (Nivel {rank.min_level}{rank.max_level ? `-${rank.max_level}` : '+'})
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          {count} usuarios ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(percentage, 1)}%`,
                            backgroundColor: rank.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level Distribution */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución por Nivel</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(levelDistribution)
                  .sort((a, b) => parseInt(a[0].split('-')[0]) - parseInt(b[0].split('-')[0]))
                  .map(([range, count]) => (
                    <div
                      key={range}
                      className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-center"
                    >
                      <p className="text-xs text-muted-foreground">Nivel {range}</p>
                      <p className="text-lg font-bold">{count}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <PermissionGate permission="admin.shop.create">
                <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Rango
                </Button>
              </PermissionGate>
            </div>

            {/* Ranks Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rango</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nivel Mín</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nivel Máx</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuarios</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perks</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranks.map((rank) => (
                      <tr key={rank.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{rank.icon}</span>
                            <div>
                              <p className="font-medium" style={{ color: rank.color }}>
                                {rank.name_es}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rank.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {rank.min_level}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {rank.max_level || '∞'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium">
                            {rankDistribution[rank.name] || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-muted-foreground font-mono">
                            {Object.keys(rank.perks || {}).length} perks
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === rank.id}>
                                {actionLoading === rank.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <PermissionGate permission="admin.shop.edit">
                                <DropdownMenuItem onClick={() => openEditModal(rank)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.shop.delete">
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={() => handleDelete(rank)} className="text-red-400">
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
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingRank ? 'Editar Rango' : 'Nuevo Rango'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Ícono *</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(f => ({ ...f, icon: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-2xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Color *</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(f => ({ ...f, color: e.target.value }))}
                      className="w-12 h-10 bg-background border border-border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(f => ({ ...f, color: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nombre (EN) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="Bronze"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nombre (ES) *</label>
                  <input
                    type="text"
                    value={formData.name_es}
                    onChange={(e) => setFormData(f => ({ ...f, name_es: e.target.value }))}
                    placeholder="Bronce"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nivel Mínimo *</label>
                  <input
                    type="number"
                    value={formData.min_level}
                    onChange={(e) => setFormData(f => ({ ...f, min_level: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nivel Máximo</label>
                  <input
                    type="number"
                    value={formData.max_level}
                    onChange={(e) => setFormData(f => ({ ...f, max_level: e.target.value }))}
                    placeholder="Vacío = infinito"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Perks (JSON)</label>
                <textarea
                  value={formData.perks}
                  onChange={(e) => setFormData(f => ({ ...f, perks: e.target.value }))}
                  rows={4}
                  placeholder='{"daily_bonus": 10, "steal_protection": true}'
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Beneficios del rango en formato JSON
                </p>
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
