'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  Users,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  banner_url: string;
  theme_color: string;
  creator_id: string;
  is_public: boolean;
  is_verified: boolean;
  requires_approval: boolean;
  members_count: number;
  posts_count: number;
  rules: string[];
  categories: string[];
  created_at: string;
  creator?: {
    username: string;
  };
}

export default function AdminComunidadesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    theme_color: '#6366f1',
    is_public: true,
    is_verified: false,
    requires_approval: false,
  });

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*, creator:users!communities_creator_id_fkey(username)')
        .order('members_count', { ascending: false });

      if (error) {
        console.error('Error loading communities:', error);
        return;
      }

      setCommunities(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const handleToggleVerified = async (community: Community) => {
    setActionLoading(community.id);
    const { error } = await supabase
      .from('communities')
      .update({ is_verified: !community.is_verified, updated_at: new Date().toISOString() })
      .eq('id', community.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadCommunities();
    }
    setActionLoading(null);
  };

  const handleTogglePublic = async (community: Community) => {
    setActionLoading(community.id);
    const { error } = await supabase
      .from('communities')
      .update({ is_public: !community.is_public, updated_at: new Date().toISOString() })
      .eq('id', community.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadCommunities();
    }
    setActionLoading(null);
  };

  const handleDelete = async (community: Community) => {
    if (!confirm('¿Eliminar esta comunidad? Esta acción no se puede deshacer.')) return;

    setActionLoading(community.id);
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', community.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadCommunities();
    }
    setActionLoading(null);
  };

  const openEditModal = (community: Community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description || '',
      slug: community.slug,
      theme_color: community.theme_color || '#6366f1',
      is_public: community.is_public,
      is_verified: community.is_verified,
      requires_approval: community.requires_approval,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCommunity) return;

    const communityData = {
      name: formData.name,
      description: formData.description,
      theme_color: formData.theme_color,
      is_public: formData.is_public,
      is_verified: formData.is_verified,
      requires_approval: formData.requires_approval,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    const { error } = await supabase
      .from('communities')
      .update(communityData)
      .eq('id', editingCommunity.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      setShowModal(false);
      loadCommunities();
    }

    setActionLoading(null);
  };

  // Stats
  const totalCommunities = communities.length;
  const verifiedCommunities = communities.filter(c => c.is_verified).length;
  const totalMembers = communities.reduce((sum, c) => sum + (c.members_count || 0), 0);

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Comunidades"
        subtitle="Modera y administra las comunidades de usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCommunities}</p>
                <p className="text-xs text-muted-foreground">Total Comunidades</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCommunities}</p>
                <p className="text-xs text-muted-foreground">Verificadas</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMembers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Miembros Totales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay comunidades</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Comunidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creador</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Miembros</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creada</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community) => (
                    <tr key={community.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {community.icon_url ? (
                            <img src={community.icon_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: community.theme_color || '#6366f1' }}
                            >
                              {community.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{community.name}</p>
                              {community.is_verified && (
                                <CheckCircle className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">/{community.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        @{community.creator?.username || 'Unknown'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{community.members_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${community.is_public ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {community.is_public ? 'Pública' : 'Privada'}
                          </span>
                          {community.requires_approval && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Requiere aprobación
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(community.created_at), { addSuffix: true, locale: es })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === community.id}>
                              {actionLoading === community.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => window.open(`/comunidades/${community.slug}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Comunidad
                            </DropdownMenuItem>
                            <PermissionGate permission="admin.communities.edit">
                              <DropdownMenuItem onClick={() => openEditModal(community)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVerified(community)}>
                                <Shield className="w-4 h-4 mr-2" />
                                {community.is_verified ? 'Quitar Verificación' : 'Verificar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublic(community)}>
                                {community.is_public ? (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Hacer Privada
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Hacer Pública
                                  </>
                                )}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.communities.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(community)} className="text-red-400">
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

      {/* Edit Modal */}
      {showModal && editingCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Editar Comunidad</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Color del Tema</label>
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData(f => ({ ...f, theme_color: e.target.value }))}
                  className="w-full mt-1 h-10 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(f => ({ ...f, is_public: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Comunidad pública</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData(f => ({ ...f, is_verified: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Comunidad verificada</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData(f => ({ ...f, requires_approval: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Requiere aprobación para unirse</span>
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
