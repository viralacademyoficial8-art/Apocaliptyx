'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Award,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power
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

interface Title {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  icon: string;
  color: string;
  rarity: string;
  unlock_condition: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
  mythic: 'bg-red-500/20 text-red-400',
};

export default function AdminTitulosPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    icon: '👑',
    color: '#6366f1',
    rarity: 'common',
    condition_type: 'level',
    condition_value: 10,
    is_active: true,
  });

  const loadTitles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('title_definitions')
        .select('*')
        .order('rarity')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading titles:', error);
        return;
      }

      setTitles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTitles();
  }, [loadTitles]);

  const handleToggleActive = async (title: Title) => {
    setActionLoading(title.id);
    const { error } = await supabase
      .from('title_definitions')
      .update({ is_active: !title.is_active, updated_at: new Date().toISOString() })
      .eq('id', title.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadTitles();
    }
    setActionLoading(null);
  };

  const handleDelete = async (title: Title) => {
    if (!confirm('¿Eliminar este título?')) return;

    setActionLoading(title.id);
    const { error } = await supabase
      .from('title_definitions')
      .delete()
      .eq('id', title.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadTitles();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingTitle(null);
    setFormData({
      name: '',
      name_es: '',
      description: '',
      description_es: '',
      icon: '👑',
      color: '#6366f1',
      rarity: 'common',
      condition_type: 'level',
      condition_value: 10,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (title: Title) => {
    setEditingTitle(title);
    const condition = title.unlock_condition || {};
    const condType = Object.keys(condition)[0] || 'level';
    const condValue = Object.values(condition)[0] || 10;

    setFormData({
      name: title.name,
      name_es: title.name_es || '',
      description: title.description || '',
      description_es: title.description_es || '',
      icon: title.icon || '👑',
      color: title.color || '#6366f1',
      rarity: title.rarity || 'common',
      condition_type: condType,
      condition_value: condValue as number,
      is_active: title.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const titleData = {
      name: formData.name,
      name_es: formData.name_es || formData.name,
      description: formData.description,
      description_es: formData.description_es || formData.description,
      icon: formData.icon,
      color: formData.color,
      rarity: formData.rarity,
      unlock_condition: { [formData.condition_type]: formData.condition_value },
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingTitle) {
      const { error } = await supabase
        .from('title_definitions')
        .update(titleData)
        .eq('id', editingTitle.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadTitles();
      }
    } else {
      const { error } = await supabase
        .from('title_definitions')
        .insert(titleData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadTitles();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalTitles = titles.length;
  const activeTitles = titles.filter(t => t.is_active).length;
  const legendaryCount = titles.filter(t => t.rarity === 'legendary' || t.rarity === 'mythic').length;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Títulos"
        subtitle="Crea y administra títulos especiales para usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTitles}</p>
                <p className="text-xs text-muted-foreground">Total Títulos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Power className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTitles}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{legendaryCount}</p>
                <p className="text-xs text-muted-foreground">Legendarios+</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.titles.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Título
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : titles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay títulos creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Título</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rareza</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Condición</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {titles.map((title) => {
                    const condition = title.unlock_condition || {};
                    const condType = Object.keys(condition)[0] || '?';
                    const condValue = Object.values(condition)[0] || 0;

                    return (
                      <tr key={title.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{title.icon}</span>
                            <div>
                              <p className="font-medium" style={{ color: title.color }}>
                                {title.name_es || title.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {title.description_es || title.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RARITY_COLORS[title.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                            {title.rarity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="text-muted-foreground">{condType}</span>
                          <span className="text-foreground font-medium ml-1">≥ {condValue}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${title.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {title.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === title.id}>
                                {actionLoading === title.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <PermissionGate permission="admin.titles.edit">
                                <DropdownMenuItem onClick={() => openEditModal(title)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(title)}>
                                  <Power className="w-4 h-4 mr-2" />
                                  {title.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.titles.delete">
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={() => handleDelete(title)} className="text-red-400">
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
                {editingTitle ? 'Editar Título' : 'Nuevo Título'}
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
                  <label className="text-sm text-muted-foreground">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(f => ({ ...f, color: e.target.value }))}
                    className="w-full mt-1 h-10 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Rareza</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData(f => ({ ...f, rarity: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="common">Común</option>
                    <option value="rare">Raro</option>
                    <option value="epic">Épico</option>
                    <option value="legendary">Legendario</option>
                    <option value="mythic">Mítico</option>
                  </select>
                </div>
              </div>

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
                <label className="text-sm text-muted-foreground">Nombre (ES)</label>
                <input
                  type="text"
                  value={formData.name_es}
                  onChange={(e) => setFormData(f => ({ ...f, name_es: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                <label className="text-sm font-medium">Condición de Desbloqueo</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Tipo</label>
                    <select
                      value={formData.condition_type}
                      onChange={(e) => setFormData(f => ({ ...f, condition_type: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="level">Nivel</option>
                      <option value="predictions">Predicciones</option>
                      <option value="correct_predictions">Predicciones Correctas</option>
                      <option value="earnings">Ganancias</option>
                      <option value="referrals">Referidos</option>
                      <option value="achievements">Logros</option>
                      <option value="login_streak">Racha Login</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Valor</label>
                    <input
                      type="number"
                      value={formData.condition_value}
                      onChange={(e) => setFormData(f => ({ ...f, condition_value: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
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
                <span className="text-sm">Título activo</span>
              </label>

              {/* Preview */}
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">Preview</label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg flex items-center gap-2">
                  <span className="text-xl">{formData.icon}</span>
                  <span className="font-medium" style={{ color: formData.color }}>
                    {formData.name_es || formData.name || 'Título'}
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
