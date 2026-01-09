'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  Gem,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Gift,
  Search,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Collectible {
  id: string;
  name: string;
  name_es: string;
  description: string;
  type: string;
  rarity: string;
  asset_url: string;
  preview_url: string;
  ap_cost: number;
  is_tradeable: boolean;
  is_limited: boolean;
  max_supply: number | null;
  current_supply: number;
  unlock_condition: string;
  season: string;
  available_from: string;
  available_until: string;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  uncommon: 'bg-green-500/20 text-green-400 border-green-500/30',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  mythic: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  avatar_frame: '🖼️',
  banner: '🎌',
  badge: '🏅',
  effect: '✨',
  skin: '🎨',
  emote: '😄',
  pet: '🐾',
};

export default function AdminColeccionablesPage() {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [editingCollectible, setEditingCollectible] = useState<Collectible | null>(null);
  const [grantingCollectible, setGrantingCollectible] = useState<Collectible | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    type: 'badge',
    rarity: 'common',
    asset_url: '',
    preview_url: '',
    ap_cost: 0,
    is_tradeable: true,
    is_limited: false,
    max_supply: '',
    unlock_condition: '',
    season: '',
  });

  const loadCollectibles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (rarityFilter) params.append('rarity', rarityFilter);

      const response = await fetch(`/api/admin/collectibles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCollectibles(data.collectibles || []);
      } else {
        toast.error(data.error || 'Error al cargar coleccionables');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, rarityFilter]);

  useEffect(() => {
    loadCollectibles();
  }, [loadCollectibles]);

  const handleDelete = async (collectible: Collectible) => {
    if (!confirm('¿Eliminar este coleccionable?')) return;

    setActionLoading(collectible.id);
    try {
      const response = await fetch(`/api/admin/collectibles?id=${collectible.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Coleccionable eliminado');
        loadCollectibles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleGrant = async () => {
    if (!grantUserId.trim() || !grantingCollectible) {
      toast.error('ID de usuario requerido');
      return;
    }

    setActionLoading('granting');
    try {
      const response = await fetch('/api/admin/collectibles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant',
          id: grantingCollectible.id,
          userId: grantUserId
        })
      });

      if (response.ok) {
        toast.success('Coleccionable otorgado');
        setShowGrantModal(false);
        setGrantUserId('');
        setGrantingCollectible(null);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al otorgar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingCollectible(null);
    setFormData({
      name: '',
      name_es: '',
      description: '',
      type: 'badge',
      rarity: 'common',
      asset_url: '',
      preview_url: '',
      ap_cost: 0,
      is_tradeable: true,
      is_limited: false,
      max_supply: '',
      unlock_condition: '',
      season: '',
    });
    setShowModal(true);
  };

  const openEditModal = (collectible: Collectible) => {
    setEditingCollectible(collectible);
    setFormData({
      name: collectible.name,
      name_es: collectible.name_es,
      description: collectible.description || '',
      type: collectible.type,
      rarity: collectible.rarity,
      asset_url: collectible.asset_url,
      preview_url: collectible.preview_url || '',
      ap_cost: collectible.ap_cost || 0,
      is_tradeable: collectible.is_tradeable,
      is_limited: collectible.is_limited,
      max_supply: collectible.max_supply?.toString() || '',
      unlock_condition: collectible.unlock_condition || '',
      season: collectible.season || '',
    });
    setShowModal(true);
  };

  const openGrantModal = (collectible: Collectible) => {
    setGrantingCollectible(collectible);
    setGrantUserId('');
    setShowGrantModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.name_es.trim() || !formData.asset_url.trim()) {
      toast.error('Nombre y URL del asset son requeridos');
      return;
    }

    setActionLoading('saving');
    try {
      const method = editingCollectible ? 'PATCH' : 'POST';
      const body = {
        ...(editingCollectible && { id: editingCollectible.id }),
        name: formData.name,
        name_es: formData.name_es,
        description: formData.description,
        type: formData.type,
        rarity: formData.rarity,
        asset_url: formData.asset_url,
        preview_url: formData.preview_url,
        ap_cost: formData.ap_cost,
        is_tradeable: formData.is_tradeable,
        is_limited: formData.is_limited,
        max_supply: formData.max_supply ? parseInt(formData.max_supply) : null,
        unlock_condition: formData.unlock_condition,
        season: formData.season,
      };

      const response = await fetch('/api/admin/collectibles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingCollectible ? 'Coleccionable actualizado' : 'Coleccionable creado');
        setShowModal(false);
        loadCollectibles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const filteredCollectibles = collectibles.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name_es.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: collectibles.length,
    limited: collectibles.filter(c => c.is_limited).length,
    legendary: collectibles.filter(c => c.rarity === 'legendary' || c.rarity === 'mythic').length,
    forSale: collectibles.filter(c => c.ap_cost > 0).length,
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestor de Coleccionables"
        subtitle="Administra items, badges, efectos y más"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gem className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.legendary}</p>
                <p className="text-xs text-muted-foreground">Legendarios+</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.limited}</p>
                <p className="text-xs text-muted-foreground">Edición Limitada</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <ImageIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.forSale}</p>
                <p className="text-xs text-muted-foreground">En Venta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tipos</option>
              <option value="avatar_frame">Marcos de Avatar</option>
              <option value="banner">Banners</option>
              <option value="badge">Badges</option>
              <option value="effect">Efectos</option>
              <option value="skin">Skins</option>
              <option value="emote">Emotes</option>
              <option value="pet">Mascotas</option>
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las rarezas</option>
              <option value="common">Común</option>
              <option value="uncommon">Poco Común</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Legendario</option>
              <option value="mythic">Mítico</option>
            </select>
          </div>

          <PermissionGate permission="admin.shop.create">
            <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Coleccionable
            </Button>
          </PermissionGate>
        </div>

        {/* Grid */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredCollectibles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay coleccionables</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredCollectibles.map((collectible) => (
                <div
                  key={collectible.id}
                  className={`relative bg-background border rounded-xl p-4 hover:border-purple-500/50 transition-colors ${RARITY_COLORS[collectible.rarity]?.replace('bg-', 'border-').split(' ')[2] || 'border-border'}`}
                >
                  {collectible.is_limited && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Limitado
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl overflow-hidden">
                      {collectible.preview_url ? (
                        <img src={collectible.preview_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        TYPE_ICONS[collectible.type] || '🎁'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{collectible.name_es}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RARITY_COLORS[collectible.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                        {collectible.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="capitalize">{collectible.type.replace('_', ' ')}</span>
                    </p>
                    {collectible.ap_cost > 0 && (
                      <p className="flex justify-between">
                        <span>Precio:</span>
                        <span className="text-yellow-400">{collectible.ap_cost} AP</span>
                      </p>
                    )}
                    {collectible.is_limited && collectible.max_supply && (
                      <p className="flex justify-between">
                        <span>Supply:</span>
                        <span>{collectible.current_supply}/{collectible.max_supply}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <PermissionGate permission="admin.shop.edit">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditModal(collectible)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </PermissionGate>
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
                        <PermissionGate permission="admin.shop.edit">
                          <DropdownMenuItem onClick={() => openGrantModal(collectible)}>
                            <Gift className="w-4 h-4 mr-2" />
                            Otorgar a Usuario
                          </DropdownMenuItem>
                        </PermissionGate>
                        <PermissionGate permission="admin.shop.delete">
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem onClick={() => handleDelete(collectible)} className="text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </PermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
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
                  <label className="text-sm text-muted-foreground">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="badge">Badge</option>
                    <option value="avatar_frame">Marco de Avatar</option>
                    <option value="banner">Banner</option>
                    <option value="effect">Efecto</option>
                    <option value="skin">Skin</option>
                    <option value="emote">Emote</option>
                    <option value="pet">Mascota</option>
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
                    <option value="uncommon">Poco Común</option>
                    <option value="rare">Raro</option>
                    <option value="epic">Épico</option>
                    <option value="legendary">Legendario</option>
                    <option value="mythic">Mítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">URL del Asset *</label>
                <input
                  type="text"
                  value={formData.asset_url}
                  onChange={(e) => setFormData(f => ({ ...f, asset_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">URL de Preview</label>
                <input
                  type="text"
                  value={formData.preview_url}
                  onChange={(e) => setFormData(f => ({ ...f, preview_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Precio AP</label>
                  <input
                    type="number"
                    value={formData.ap_cost}
                    onChange={(e) => setFormData(f => ({ ...f, ap_cost: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Temporada</label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => setFormData(f => ({ ...f, season: e.target.value }))}
                    placeholder="Season 1"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Condición de Desbloqueo</label>
                <input
                  type="text"
                  value={formData.unlock_condition}
                  onChange={(e) => setFormData(f => ({ ...f, unlock_condition: e.target.value }))}
                  placeholder="level_10, achievement_first_win, etc."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="flex flex-wrap gap-4">
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
                    checked={formData.is_limited}
                    onChange={(e) => setFormData(f => ({ ...f, is_limited: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Edición Limitada</span>
                </label>
              </div>

              {formData.is_limited && (
                <div>
                  <label className="text-sm text-muted-foreground">Supply Máximo</label>
                  <input
                    type="number"
                    value={formData.max_supply}
                    onChange={(e) => setFormData(f => ({ ...f, max_supply: e.target.value }))}
                    placeholder="100"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              )}
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

      {/* Grant Modal */}
      {showGrantModal && grantingCollectible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Otorgar Coleccionable</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {grantingCollectible.name_es}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">ID del Usuario *</label>
                <input
                  type="text"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  placeholder="UUID del usuario"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowGrantModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleGrant}
                disabled={actionLoading === 'granting'}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'granting' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Otorgar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
