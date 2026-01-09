'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import {
  FileVideo,
  MessageSquare,
  Image,
  Radio,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  AlertTriangle,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  user_id: string;
  content?: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  title?: string;
  views_count?: number;
  likes_count?: number;
  is_active?: boolean;
  is_published?: boolean;
  status?: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ContentReport {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  reporter?: {
    id: string;
    username: string;
    display_name: string;
  };
}

export default function AdminContenidoPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'stories' | 'streams' | 'reports'>('reports');
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const type = activeTab === 'reports' ? 'all' : activeTab.slice(0, -1);
      const response = await fetch(`/api/admin/content?type=${type}`);
      const data = await response.json();

      if (response.ok) {
        setContent(data.content || {});
        setReports(data.reports || []);
        setPendingReports(data.pendingReports || 0);
      } else {
        toast.error(data.error || 'Error al cargar contenido');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleDelete = async (type: string, id: string, reason: string = 'Contenido inapropiado') => {
    if (!confirm('¿Eliminar este contenido? Esta acción no se puede deshacer.')) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/content?type=${type}&id=${id}&reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Contenido eliminado');
        loadContent();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleToggleVisibility = async (type: string, id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_visibility',
          contentType: type,
          contentId: id
        })
      });

      if (response.ok) {
        toast.success('Visibilidad actualizada');
        loadContent();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setActionLoading(reportId);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_report',
          reportId,
          status
        })
      });

      if (response.ok) {
        toast.success(status === 'resolved' ? 'Reporte resuelto' : 'Reporte descartado');
        loadContent();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar reporte');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
    setActionLoading(null);
  };

  const tabs = [
    { id: 'reports', label: 'Reportes', icon: Flag, badge: pendingReports },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'reels', label: 'Reels', icon: FileVideo },
    { id: 'stories', label: 'Stories', icon: Image },
    { id: 'streams', label: 'Streams', icon: Radio },
  ];

  const renderContentCard = (item: ContentItem, type: string) => {
    const isVisible = item.is_active !== false && item.is_published !== false;

    return (
      <div key={item.id} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          {item.thumbnail_url || item.media_url ? (
            <img
              src={item.thumbnail_url || item.media_url}
              alt=""
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
              {type === 'reel' && <FileVideo className="w-8 h-8 text-muted-foreground" />}
              {type === 'story' && <Image className="w-8 h-8 text-muted-foreground" />}
              {type === 'stream' && <Radio className="w-8 h-8 text-muted-foreground" />}
              {type === 'post' && <MessageSquare className="w-8 h-8 text-muted-foreground" />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.user?.avatar_url ? (
                <img src={item.user.avatar_url} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {item.user?.display_name || item.user?.username || 'Usuario'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isVisible ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {isVisible ? 'Visible' : 'Oculto'}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.title || item.content || item.caption || 'Sin contenido'}
            </p>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {item.views_count !== undefined && (
                <span>{item.views_count} vistas</span>
              )}
              {item.likes_count !== undefined && (
                <span>{item.likes_count} likes</span>
              )}
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <PermissionGate permission="admin.shop.edit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleVisibility(type, item.id)}
                disabled={actionLoading === item.id}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </PermissionGate>
            <PermissionGate permission="admin.shop.delete">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => handleDelete(type, item.id)}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>
    );
  };

  const renderReportCard = (report: ContentReport) => (
    <div key={report.id} className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="font-medium capitalize">{report.content_type}</span>
            <span className="text-xs text-muted-foreground">
              ID: {report.content_id.slice(0, 8)}...
            </span>
          </div>

          <p className="text-sm">
            <span className="text-muted-foreground">Razón:</span>{' '}
            <span className="font-medium">{report.reason}</span>
          </p>

          {report.details && (
            <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>Reportado por: {report.reporter?.username || 'Anónimo'}</span>
            <span>•</span>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(report.content_type, report.content_id, report.reason)}
            disabled={actionLoading === report.id}
            className="text-red-400 border-red-400/30"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResolveReport(report.id, 'resolved')}
            disabled={actionLoading === report.id}
            className="text-green-400 border-green-400/30"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Resolver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResolveReport(report.id, 'dismissed')}
            disabled={actionLoading === report.id}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Descartar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Moderación de Contenido"
        subtitle="Gestiona posts, reels, stories y streams"
      />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-card border border-border hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay reportes pendientes</p>
              </div>
            ) : (
              reports.map(renderReportCard)
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'posts' && content.posts?.map(item => renderContentCard(item, 'post'))}
            {activeTab === 'reels' && content.reels?.map(item => renderContentCard(item, 'reel'))}
            {activeTab === 'stories' && content.stories?.map(item => renderContentCard(item, 'story'))}
            {activeTab === 'streams' && content.streams?.map(item => renderContentCard(item, 'stream'))}

            {(activeTab === 'posts' && (!content.posts || content.posts.length === 0)) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay posts</p>
              </div>
            )}
            {(activeTab === 'reels' && (!content.reels || content.reels.length === 0)) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <FileVideo className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay reels</p>
              </div>
            )}
            {(activeTab === 'stories' && (!content.stories || content.stories.length === 0)) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay stories</p>
              </div>
            )}
            {(activeTab === 'streams' && (!content.streams || content.streams.length === 0)) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay streams</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
