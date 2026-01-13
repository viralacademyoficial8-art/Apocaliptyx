'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  Send,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationLog {
  id: string;
  title: string;
  content: string;
  target_type: string;
  target_value: string | null;
  sent_count: number;
  created_at: string;
  created_by: string;
}

export default function AdminNotificacionesPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'all',
    target_role: '',
    notification_type: 'INFO',
    link: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar logs de notificaciones enviadas
      const { data: logsData } = await supabase
        .from('notification_broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setLogs(logsData || []);

      // Contar usuarios
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setUserCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('El título y contenido son requeridos');
      return;
    }

    if (!confirm('¿Enviar esta notificación a los usuarios seleccionados?')) {
      return;
    }

    setSending(true);
    setSent(false);

    try {
      // Obtener usuarios según el filtro
      let usersQuery = supabase.from('users').select('id');

      if (formData.target_type === 'role' && formData.target_role) {
        usersQuery = usersQuery.eq('role', formData.target_role);
      } else if (formData.target_type === 'active') {
        // Usuarios activos en los últimos 7 días
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        usersQuery = usersQuery.gte('last_activity', weekAgo.toISOString());
      } else if (formData.target_type === 'premium') {
        usersQuery = usersQuery.eq('is_premium', true);
      }

      const { data: users } = await usersQuery;

      if (!users || users.length === 0) {
        alert('No hay usuarios que coincidan con el filtro');
        setSending(false);
        return;
      }

      // Crear notificaciones para cada usuario
      const notifications = users.map(user => ({
        user_id: user.id,
        type: formData.notification_type,
        title: formData.title,
        content: formData.content,
        link: formData.link || null,
        is_read: false,
      }));

      // Insertar notificaciones en lotes
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await supabase.from('notifications').insert(batch);
      }

      // Registrar el broadcast
      await supabase.from('notification_broadcasts').insert({
        title: formData.title,
        content: formData.content,
        target_type: formData.target_type,
        target_value: formData.target_role || null,
        sent_count: users.length,
      });

      setSent(true);
      setFormData({
        title: '',
        content: '',
        target_type: 'all',
        target_role: '',
        notification_type: 'INFO',
        link: '',
      });
      loadData();

      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Error al enviar notificaciones');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Notificaciones Masivas"
        subtitle="Envía notificaciones a todos los usuarios o grupos específicos"
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
                <p className="text-2xl font-bold">{userCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Usuarios</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Broadcasts Enviados</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {logs.reduce((sum, l) => sum + (l.sent_count || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Notificaciones Enviadas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Nueva Notificación
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título de la notificación"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                  rows={3}
                  placeholder="Mensaje de la notificación..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData(f => ({ ...f, notification_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="INFO">Información</option>
                    <option value="SUCCESS">Éxito</option>
                    <option value="WARNING">Advertencia</option>
                    <option value="PROMO">Promoción</option>
                    <option value="UPDATE">Actualización</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Destino</label>
                  <select
                    value={formData.target_type}
                    onChange={(e) => setFormData(f => ({ ...f, target_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="all">Todos los usuarios</option>
                    <option value="active">Usuarios activos (7 días)</option>
                    <option value="premium">Usuarios Premium</option>
                    <option value="role">Por rol</option>
                  </select>
                </div>
              </div>

              {formData.target_type === 'role' && (
                <div>
                  <label className="text-sm text-muted-foreground">Rol</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData(f => ({ ...f, target_role: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="USER">Usuario</option>
                    <option value="STAFF">Staff</option>
                    <option value="MODERATOR">Moderador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground">Link (opcional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData(f => ({ ...f, link: e.target.value }))}
                  placeholder="/ruta o https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <PermissionGate permission="admin.users.edit">
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    onClick={handleSendNotification}
                    disabled={sending || !formData.title || !formData.content}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Enviar Notificación
                  </Button>

                  {sent && (
                    <span className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Enviado correctamente
                    </span>
                  )}
                </div>
              </PermissionGate>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              Historial de Broadcasts
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay broadcasts enviados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{log.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{log.content}</p>
                      </div>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                        {log.sent_count} enviados
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Destino: {log.target_type === 'all' ? 'Todos' :
                          log.target_type === 'role' ? `Rol: ${log.target_value}` :
                          log.target_type}
                      </span>
                      <span>
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
