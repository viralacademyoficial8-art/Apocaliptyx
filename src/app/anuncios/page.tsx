'use client';

import { useState } from 'react';
import {
  AdminHeader,
  AnnouncementForm,
  AnnouncementsList,
  StatsCard,
} from '@/components/admin';
import { mockAnnouncements, Announcement } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Eye, MousePointer } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAnuncios() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | undefined>();

  // Stats
  const activeCount = announcements.filter((a) => a.status === 'active').length;
  const totalViews = announcements.reduce((sum, a) => sum + a.stats.views, 0);
  const totalClicks = announcements.reduce((sum, a) => sum + a.stats.clicks, 0);
  const avgCTR =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  const handleSave = (data: Partial<Announcement>) => {
    if (editingAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingAnnouncement.id ? { ...a, ...data } : a,
        ),
      );
    } else {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        title: data.title || '',
        message: data.message || '',
        type: data.type || 'info',
        priority: data.priority || 'medium',
        target: data.target || 'all',
        channels: data.channels || ['notification'],
        status: data.status || 'draft',
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        stats: { views: 0, clicks: 0, dismissals: 0 },
      };
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    }
    setShowForm(false);
    setEditingAnnouncement(undefined);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
    toast.success('Anuncio eliminado');
  };

  const handleDuplicate = (announcement: Announcement) => {
    const duplicate: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      title: `${announcement.title} (copia)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      stats: { views: 0, clicks: 0, dismissals: 0 },
    };
    setAnnouncements((prev) => [duplicate, ...prev]);
    toast.success('Anuncio duplicado');
  };

  const handleToggleStatus = (announcement: Announcement) => {
    const newStatus = announcement.status === 'active' ? 'draft' : 'active';
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcement.id ? { ...a, status: newStatus } : a,
      ),
    );
    toast.success(
      newStatus === 'active' ? 'Anuncio activado' : 'Anuncio pausado',
    );
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Anuncios y Notificaciones"
        subtitle="Comunícate con tus usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Anuncios Activos"
            value={activeCount}
            icon={Bell}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
          />
          <StatsCard
            title="Total Vistas"
            value={totalViews.toLocaleString()}
            icon={Eye}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
          />
          <StatsCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={MousePointer}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
          />
          <StatsCard
            title="CTR Promedio"
            value={`${avgCTR}%`}
            icon={MousePointer}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
          />
        </div>

        {/* Botón nuevo anuncio */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Anuncio
          </Button>
        )}

        {/* Formulario */}
        {showForm && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingAnnouncement(undefined);
            }}
          />
        )}

        {/* Lista */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Historial de Anuncios</h2>
          <AnnouncementsList
            announcements={announcements}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </div>
  );
}
