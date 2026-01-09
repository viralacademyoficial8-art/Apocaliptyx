'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  Plus,
  Crown,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Gift,
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Title {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  icon: string;
  color: string;
  unlock_condition: string;
  rarity: string;
  unlock_count?: number;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400',
  uncommon: 'bg-green-500/20 text-green-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
};

export default function AdminTitulosPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [grantingTitle, setGrantingTitle] = useState<Title | null>(null);
  const [rarityFilter, setRarityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    icon: '👑',
    color: '#FFFFFF',
    unlock_condition: '',
    rarity: 'common',
  });

  const loadTitles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rarityFilter) params.append('rarity', rarityFilter);

      const response = await fetch(`/api/admin/titles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTitles(data.titles || []);
      } else {
        toast.error(data.error || 'Error al cargar títulos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [rarityFilter]);

  useEffect(() => {
    loadTitles();
  }, [loadTitles]);

  const handleDelete = async (title: Title) => {
    if (!confirm('¿Eliminar este título?')) return;

    setActionLoading(title.id);
    try {
      const response = await fetch(`/api/admin/titles?id=${title.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Título eliminado');
        loadTitles();
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
    if (!grantUserId.trim() || !grantingTitle) {
      toast.error('ID de usuario requerido');
      return;
    }

    setActionLoading('granting');
    try {
      const response = await fetch('/api/admin/titles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant',
          id: grantingTitle.id,
          userId: grantUserId
        })
      });

      if (response.ok) {
        toast.success('Título otorgado');
        setShowGrantModal(false);
        setGrantUserId('');
        setGrantingTitle(null);
        loadTitles();
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
    setEditingTitle(null);
    setFormData({
      name: '',
      name_es: '',
      description: '',
      description_es: '',
      icon: '👑',
      color: '#FFFFFF',
      unlock_condition: '',
      rarity: 'common',
    });
    setShowModal(true);
  };

  const openEditModal = (title: Title) => {
    setEditingTitle(title);
    setFormData({
      name: title.name,
      name_es: title.name_es,
      description: title.description || '',
      description_es: title.description_es || '',
      icon: title.icon || '👑',
      color: title.color || '#FFFFFF',
      unlock_condition: title.unlock_condition || '',
      rarity: title.rarity || 'common',
    });
    setShowModal(true);
  };

  const openGrantModal = (title: Title) => {
    setGrantingTitle(title);
    setGrantUserId('');
    setShowGrantModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.name_es.trim() || !formData.unlock_condition.trim()) {
      toast.error('Nombre y condición de desbloqueo son requeridos');
      return;
    }

    setActionLoading('saving');
    try {
      const method = editingTitle ? 'PATCH' : 'POST';
      const body = {
        ...(editingTitle && { id: editingTitle.id }),
        name: formData.name,
        name_es: formData.name_es,
        description: formData.description,
        description_es: formData.description_es,
        icon: formData.icon,
        color: formData.color,
        unlock_condition: formData.unlock_condition,
        rarity: formData.rarity,
      };

      const response = await fetch('/api/admin/titles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingTitle ? 'Título actualizado' : 'Título creado');
        setShowModal(false);
        loadTitles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const filteredTitles = titles.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name_es.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: titles.length,
    legendary: titles.filter(t => t.rarity === 'legendary').length,
    totalUnlocks: titles.reduce((acc, t) => acc + (t.unlock_count || 0), 0),
    mostPopular: titles.sort((a, b) => (b.unlock_count || 0) - (a.unlock_count || 0))[0]?.name_es || '-',
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestor de Títulos"
        subtitle="Administra títulos y rangos especiales"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Títulos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.legendary}</p>
                <p className="text-xs text-muted-foreground">Legendarios</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUnlocks}</p>
                <p className="text-xs text-muted-foreground">Desbloqueos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold truncate">{stats.mostPopular}</p>
                <p className="text-xs text-muted-foreground">Más Popular</p>
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
            </select>
          </div>

          <PermissionGate permission="admin.shop.create">
            <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Título
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredTitles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay títulos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Título</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rareza</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Condición</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuarios</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTitles.map((title) => (
                    <tr key={title.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{title.icon}</span>
                          <div>
                            <p className="font-medium" style={{ color: title.color }}>
                              {title.name_es}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {title.description_es}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RARITY_COLORS[title.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                          {title.rarity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {title.unlock_condition}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {title.unlock_count || 0}
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
                            <PermissionGate permission="admin.shop.edit">
                              <DropdownMenuItem onClick={() => openEditModal(title)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openGrantModal(title)}>
                                <Gift className="w-4 h-4 mr-2" />
                                Otorgar a Usuario
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.shop.delete">
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
                  ))}
                </tbody>
              </table>
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
                {editingTitle ? 'Editar Título' : 'Nuevo Título'}
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
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Condición de Desbloqueo *</label>
                <input
                  type="text"
                  value={formData.unlock_condition}
                  onChange={(e) => setFormData(f => ({ ...f, unlock_condition: e.target.value }))}
                  placeholder="level_50, predictions_100, etc."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplos: level_50, predictions_100, wins_10, community_leader
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

      {/* Grant Modal */}
      {showGrantModal && grantingTitle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Otorgar Título</h2>
              <p className="text-sm text-muted-foreground mt-1" style={{ color: grantingTitle.color }}>
                {grantingTitle.icon} {grantingTitle.name_es}
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
