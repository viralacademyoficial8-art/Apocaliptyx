'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus,
  Bell,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Pin,
  Megaphone,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target: string;
  is_active: boolean;
  is_pinned: boolean;
  show_in_banner: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  INFO: { color: 'bg-blue-500/20 text-blue-400', icon: Info, label: 'Información' },
  WARNING: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle, label: 'Advertencia' },
  SUCCESS: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'Éxito' },
  ERROR: { color: 'bg-red-500/20 text-red-400', icon: XCircle, label: 'Error' },
};

const TARGET_LABELS: Record<string, string> = {
  all: 'Todos',
  users: 'Usuarios',
  premium: 'Premium',
  staff: 'Staff',
};

export default function AdminAnunciosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO',
    target: 'all',
    is_active: true,
    is_pinned: false,
    show_in_banner: false,
    starts_at: '',
    ends_at: '',
  });

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading announcements:', error);
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleToggleActive = async (announcement: Announcement) => {
    setActionLoading(announcement.id);
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !announcement.is_active, updated_at: new Date().toISOString() })
      .eq('id', announcement.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadAnnouncements();
    }
    setActionLoading(null);
  };

  const handleTogglePinned = async (announcement: Announcement) => {
    setActionLoading(announcement.id);
    const { error } = await supabase
      .from('announcements')
      .update({ is_pinned: !announcement.is_pinned, updated_at: new Date().toISOString() })
      .eq('id', announcement.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadAnnouncements();
    }
    setActionLoading(null);
  };

  const handleToggleBanner = async (announcement: Announcement) => {
    setActionLoading(announcement.id);
    const { error } = await supabase
      .from('announcements')
      .update({ show_in_banner: !announcement.show_in_banner, updated_at: new Date().toISOString() })
      .eq('id', announcement.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadAnnouncements();
    }
    setActionLoading(null);
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!confirm('¿Eliminar este anuncio?')) return;
    
    setActionLoading(announcement.id);
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcement.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadAnnouncements();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'INFO',
      target: 'all',
      is_active: true,
      is_pinned: false,
      show_in_banner: false,
      starts_at: '',
      ends_at: '',
    });
    setShowModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      type: announcement.type,
      target: announcement.target,
      is_active: announcement.is_active,
      is_pinned: announcement.is_pinned,
      show_in_banner: announcement.show_in_banner,
      starts_at: announcement.starts_at ? new Date(announcement.starts_at).toISOString().slice(0, 16) : '',
      ends_at: announcement.ends_at ? new Date(announcement.ends_at).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    const announcementData = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      target: formData.target,
      is_active: formData.is_active,
      is_pinned: formData.is_pinned,
      show_in_banner: formData.show_in_banner,
      starts_at: formData.starts_at || new Date().toISOString(),
      ends_at: formData.ends_at || null,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingAnnouncement) {
      const { error } = await supabase
        .from('announcements')
        .update(announcementData)
        .eq('id', editingAnnouncement.id);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadAnnouncements();
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert(announcementData);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadAnnouncements();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter(a => a.is_active).length;
  const bannerAnnouncements = announcements.filter(a => a.show_in_banner && a.is_active).length;
  const pinnedAnnouncements = announcements.filter(a => a.is_pinned).length;

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión de Anuncios" 
        subtitle="Crea y administra anuncios para los usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAnnouncements}</p>
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
                <p className="text-2xl font-bold">{activeAnnouncements}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Megaphone className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bannerAnnouncements}</p>
                <p className="text-xs text-muted-foreground">En Banner</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Pin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pinnedAnnouncements}</p>
                <p className="text-xs text-muted-foreground">Fijados</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.notifications.send">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay anuncios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Anuncio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Audiencia</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => {
                    const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.INFO;
                    const TypeIcon = typeConfig.icon;
                    return (
                      <tr key={announcement.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {announcement.is_pinned && <Pin className="w-4 h-4 text-blue-400" />}
                            {announcement.show_in_banner && <Megaphone className="w-4 h-4 text-yellow-400" />}
                            <div>
                              <p className="font-medium">{announcement.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                {announcement.content}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {TARGET_LABELS[announcement.target] || announcement.target}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${announcement.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {announcement.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: es })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === announcement.id}>
                                {actionLoading === announcement.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <PermissionGate permission="admin.notifications.send">
                                <DropdownMenuItem onClick={() => openEditModal(announcement)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(announcement)}>
                                  <Power className="w-4 h-4 mr-2" />
                                  {announcement.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePinned(announcement)}>
                                  <Pin className="w-4 h-4 mr-2" />
                                  {announcement.is_pinned ? 'Desfijar' : 'Fijar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleBanner(announcement)}>
                                  <Megaphone className="w-4 h-4 mr-2" />
                                  {announcement.show_in_banner ? 'Quitar de banner' : 'Mostrar en banner'}
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={() => handleDelete(announcement)} className="text-red-400">
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
                {editingAnnouncement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título del anuncio"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Contenido</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                  rows={3}
                  placeholder="Contenido del anuncio..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="INFO">Información</option>
                    <option value="SUCCESS">Éxito</option>
                    <option value="WARNING">Advertencia</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Audiencia</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData(f => ({ ...f, target: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos</option>
                    <option value="users">Solo Usuarios</option>
                    <option value="premium">Solo Premium</option>
                    <option value="staff">Solo Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Inicio</label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData(f => ({ ...f, starts_at: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fin (opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData(f => ({ ...f, ends_at: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Activo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData(f => ({ ...f, is_pinned: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Fijar al inicio</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.show_in_banner}
                    onChange={(e) => setFormData(f => ({ ...f, show_in_banner: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Mostrar en banner superior</span>
                </label>
              </div>

              {/* Preview */}
              {formData.title && (
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground">Preview</label>
                  <div className={`mt-1 p-3 rounded-lg ${
                    formData.type === 'SUCCESS' ? 'bg-green-500/20 border border-green-500/30' :
                    formData.type === 'WARNING' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                    formData.type === 'ERROR' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-blue-500/20 border border-blue-500/30'
                  }`}>
                    <p className="font-medium">{formData.title}</p>
                    {formData.content && (
                      <p className="text-sm mt-1 opacity-80">{formData.content}</p>
                    )}
                  </div>
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
    </div>
  );
}