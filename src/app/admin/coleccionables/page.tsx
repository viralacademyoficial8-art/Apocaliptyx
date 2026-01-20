'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Coins,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface Collectible {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  type: string;
  rarity: string;
  image_url: string;
  preview_url: string;
  ap_cost: number;
  is_tradeable: boolean;
  max_supply: number | null;
  current_supply: number;
  season: string | null;
  is_active: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  frame: { label: 'Marco', icon: '🖼️' },
  effect: { label: 'Efecto', icon: '✨' },
  background: { label: 'Fondo', icon: '🌄' },
  badge_style: { label: 'Estilo Badge', icon: '🏅' },
  emoji_pack: { label: 'Pack Emojis', icon: '😎' },
  theme: { label: 'Tema', icon: '🎨' },
};

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
  mythic: 'bg-red-500/20 text-red-400',
};

export default function AdminColeccionablesPage() {
  const supabase = getSupabaseBrowser();
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollectible, setEditingCollectible] = useState<Collectible | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    type: 'frame',
    rarity: 'common',
    image_url: '',
    preview_url: '',
    ap_cost: 100,
    is_tradeable: true,
    max_supply: '',
    season: '',
    is_active: true,
  });

  const loadCollectibles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('collectibles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading collectibles:', error);
        return;
      }

      setCollectibles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollectibles();
  }, [loadCollectibles]);

  const handleToggleActive = async (collectible: Collectible) => {
    setActionLoading(collectible.id);
    const { error } = await supabase
      .from('collectibles')
      .update({ is_active: !collectible.is_active, updated_at: new Date().toISOString() })
      .eq('id', collectible.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadCollectibles();
    }
    setActionLoading(null);
  };

  const handleDelete = async (collectible: Collectible) => {
    if (!confirm('¿Eliminar este coleccionable?')) return;

    setActionLoading(collectible.id);
    const { error } = await supabase
      .from('collectibles')
      .delete()
      .eq('id', collectible.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadCollectibles();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingCollectible(null);
    setFormData({
      name: '',
      name_es: '',
      description: '',
      description_es: '',
      type: 'frame',
      rarity: 'common',
      image_url: '',
      preview_url: '',
      ap_cost: 100,
      is_tradeable: true,
      max_supply: '',
      season: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (collectible: Collectible) => {
    setEditingCollectible(collectible);
    setFormData({
      name: collectible.name,
      name_es: collectible.name_es || '',
      description: collectible.description || '',
      description_es: collectible.description_es || '',
      type: collectible.type,
      rarity: collectible.rarity,
      image_url: collectible.image_url || '',
      preview_url: collectible.preview_url || '',
      ap_cost: collectible.ap_cost || 0,
      is_tradeable: collectible.is_tradeable ?? true,
      max_supply: collectible.max_supply?.toString() || '',
      season: collectible.season || '',
      is_active: collectible.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const collectibleData = {
      name: formData.name,
      name_es: formData.name_es || formData.name,
      description: formData.description,
      description_es: formData.description_es || formData.description,
      type: formData.type,
      rarity: formData.rarity,
      image_url: formData.image_url,
      preview_url: formData.preview_url,
      ap_cost: formData.ap_cost,
      is_tradeable: formData.is_tradeable,
      max_supply: formData.max_supply ? parseInt(formData.max_supply) : null,
      season: formData.season || null,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingCollectible) {
      const { error } = await supabase
        .from('collectibles')
        .update(collectibleData)
        .eq('id', editingCollectible.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadCollectibles();
      }
    } else {
      const { error } = await supabase
        .from('collectibles')
        .insert(collectibleData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadCollectibles();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalCollectibles = collectibles.length;
  const activeCollectibles = collectibles.filter(c => c.is_active).length;
  const legendaryCount = collectibles.filter(c => c.rarity === 'legendary' || c.rarity === 'mythic').length;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Coleccionables"
        subtitle="Crea y administra marcos, efectos y más"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCollectibles}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Power className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCollectibles}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Package className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{legendaryCount}</p>
                <p className="text-xs text-muted-foreground">Legendarios+</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.collectibles.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Coleccionable
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : collectibles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay coleccionables</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Coleccionable</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rareza</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supply</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {collectibles.map((collectible) => {
                    const typeConfig = TYPE_LABELS[collectible.type] || { label: collectible.type, icon: '📦' };
                    return (
                      <tr key={collectible.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {collectible.image_url ? (
                              <img src={collectible.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                {typeConfig.icon}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{collectible.name_es || collectible.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {collectible.description_es || collectible.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span>{typeConfig.icon} {typeConfig.label}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RARITY_COLORS[collectible.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                            {collectible.rarity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-yellow-400 font-medium">
                            <Coins className="w-4 h-4" />
                            {collectible.ap_cost}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {collectible.max_supply ? (
                            <span>{collectible.current_supply || 0} / {collectible.max_supply}</span>
                          ) : (
                            <span className="text-muted-foreground">Ilimitado</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${collectible.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {collectible.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === collectible.id}>
                                {actionLoading === collectible.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <PermissionGate permission="admin.collectibles.edit">
                                <DropdownMenuItem onClick={() => openEditModal(collectible)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(collectible)}>
                                  <Power className="w-4 h-4 mr-2" />
                                  {collectible.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.collectibles.delete">
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={() => handleDelete(collectible)} className="text-red-400">
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
                {editingCollectible ? 'Editar Coleccionable' : 'Nuevo Coleccionable'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="frame">Marco</option>
                    <option value="effect">Efecto</option>
                    <option value="background">Fondo</option>
                    <option value="badge_style">Estilo Badge</option>
                    <option value="emoji_pack">Pack Emojis</option>
                    <option value="theme">Tema</option>
                  </select>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Precio (AP)</label>
                  <input
                    type="number"
                    value={formData.ap_cost}
                    onChange={(e) => setFormData(f => ({ ...f, ap_cost: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Max Supply (vacío = ilimitado)</label>
                  <input
                    type="number"
                    value={formData.max_supply}
                    onChange={(e) => setFormData(f => ({ ...f, max_supply: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">URL Imagen</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Temporada (opcional)</label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => setFormData(f => ({ ...f, season: e.target.value }))}
                  placeholder="Ej: winter_2024"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_tradeable}
                    onChange={(e) => setFormData(f => ({ ...f, is_tradeable: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Intercambiable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Activo</span>
                </label>
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
