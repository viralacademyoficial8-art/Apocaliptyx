'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Shield,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  TrendingUp
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

interface Rank {
  id: string;
  name: string;
  name_es: string;
  min_level: number;
  max_level: number | null;
  icon: string;
  color: string;
  perks: Record<string, any>;
  created_at: string;
}

export default function AdminRangosPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    min_level: 1,
    max_level: '',
    icon: '🥉',
    color: '#6b7280',
    perk_daily_bonus: 0,
    perk_xp_multiplier: 1,
  });

  const loadRanks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_ranks')
        .select('*')
        .order('min_level');

      if (error) {
        console.error('Error loading ranks:', error);
        return;
      }

      setRanks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanks();
  }, [loadRanks]);

  const handleDelete = async (rank: Rank) => {
    if (!confirm('¿Eliminar este rango?')) return;

    setActionLoading(rank.id);
    const { error } = await supabase
      .from('user_ranks')
      .delete()
      .eq('id', rank.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadRanks();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingRank(null);
    const lastRank = ranks[ranks.length - 1];
    const nextMinLevel = lastRank ? (lastRank.max_level || lastRank.min_level) + 1 : 1;

    setFormData({
      name: '',
      name_es: '',
      min_level: nextMinLevel,
      max_level: '',
      icon: '🥉',
      color: '#6b7280',
      perk_daily_bonus: 0,
      perk_xp_multiplier: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (rank: Rank) => {
    setEditingRank(rank);
    const perks = rank.perks || {};

    setFormData({
      name: rank.name,
      name_es: rank.name_es || '',
      min_level: rank.min_level,
      max_level: rank.max_level?.toString() || '',
      icon: rank.icon || '🥉',
      color: rank.color || '#6b7280',
      perk_daily_bonus: perks.daily_bonus || 0,
      perk_xp_multiplier: perks.xp_multiplier || 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const rankData = {
      name: formData.name,
      name_es: formData.name_es || formData.name,
      min_level: formData.min_level,
      max_level: formData.max_level ? parseInt(formData.max_level) : null,
      icon: formData.icon,
      color: formData.color,
      perks: {
        daily_bonus: formData.perk_daily_bonus,
        xp_multiplier: formData.perk_xp_multiplier,
      },
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingRank) {
      const { error } = await supabase
        .from('user_ranks')
        .update(rankData)
        .eq('id', editingRank.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadRanks();
      }
    } else {
      const { error } = await supabase
        .from('user_ranks')
        .insert(rankData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadRanks();
      }
    }

    setActionLoading(null);
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Rangos"
        subtitle="Configura los rangos por nivel de usuario"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ranks.length}</p>
                <p className="text-xs text-muted-foreground">Total Rangos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ranks.length > 0 ? (ranks[ranks.length - 1].max_level || ranks[ranks.length - 1].min_level) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Nivel Máximo</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.ranks.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Rango
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : ranks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay rangos configurados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rango</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Niveles</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perks</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((rank) => {
                    const perks = rank.perks || {};
                    return (
                      <tr key={rank.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{rank.icon}</span>
                            <div>
                              <p className="font-medium" style={{ color: rank.color }}>
                                {rank.name_es || rank.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="font-medium">{rank.min_level}</span>
                          <span className="text-muted-foreground"> - </span>
                          <span className="font-medium">{rank.max_level || '∞'}</span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="space-y-1">
                            {perks.daily_bonus > 0 && (
                              <p className="text-green-400">+{perks.daily_bonus} AP/día</p>
                            )}
                            {perks.xp_multiplier > 1 && (
                              <p className="text-purple-400">{perks.xp_multiplier}x XP</p>
                            )}
                            {Object.keys(perks).length === 0 && (
                              <span className="text-muted-foreground">Sin perks</span>
                            )}
                          </div>
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
                              <PermissionGate permission="admin.ranks.edit">
                                <DropdownMenuItem onClick={() => openEditModal(rank)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.ranks.delete">
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
          <div className="bg-card border border-border rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingRank ? 'Editar Rango' : 'Nuevo Rango'}
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
                  <label className="text-sm text-muted-foreground">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(f => ({ ...f, color: e.target.value }))}
                    className="w-full mt-1 h-10 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

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
                <label className="text-sm text-muted-foreground">Nombre (ES)</label>
                <input
                  type="text"
                  value={formData.name_es}
                  onChange={(e) => setFormData(f => ({ ...f, name_es: e.target.value }))}
                  placeholder="Bronce"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nivel Mínimo</label>
                  <input
                    type="number"
                    value={formData.min_level}
                    onChange={(e) => setFormData(f => ({ ...f, min_level: parseInt(e.target.value) || 1 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nivel Máximo (vacío = sin límite)</label>
                  <input
                    type="number"
                    value={formData.max_level}
                    onChange={(e) => setFormData(f => ({ ...f, max_level: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                <label className="text-sm font-medium">Perks del Rango</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Bonus Diario (AP)</label>
                    <input
                      type="number"
                      value={formData.perk_daily_bonus}
                      onChange={(e) => setFormData(f => ({ ...f, perk_daily_bonus: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Multiplicador XP</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perk_xp_multiplier}
                      onChange={(e) => setFormData(f => ({ ...f, perk_xp_multiplier: parseFloat(e.target.value) || 1 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">Preview</label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg flex items-center gap-2">
                  <span className="text-xl">{formData.icon}</span>
                  <span className="font-medium" style={{ color: formData.color }}>
                    {formData.name_es || formData.name || 'Rango'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    (Nivel {formData.min_level} - {formData.max_level || '∞'})
                  </span>
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
