'use client';

import { useState } from 'react';
import { Announcement } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Send,
  Save,
  Clock,
  Users,
  Bell,
  Mail,
  Layout,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSave?: (data: Partial<Announcement>) => void;
  onCancel?: () => void;
}

export function AnnouncementForm({
  announcement,
  onSave,
  onCancel,
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    message: announcement?.message || '',
    type: announcement?.type || 'info',
    priority: announcement?.priority || 'medium',
    target: announcement?.target || 'all',
    channels: announcement?.channels || ['notification'],
    scheduledAt: announcement?.scheduledAt || '',
    expiresAt: announcement?.expiresAt || '',
  });

  const handleChannelToggle = (channel: 'banner' | 'notification' | 'email') => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSaveDraft = () => {
    onSave?.({ ...formData, status: 'draft' });
    toast.success('Borrador guardado');
  };

  const handleSchedule = () => {
    if (!formData.scheduledAt) {
      toast.error('Selecciona una fecha de programación');
      return;
    }
    onSave?.({ ...formData, status: 'scheduled' });
    toast.success('Anuncio programado');
  };

  const handlePublish = () => {
    if (!formData.title || !formData.message) {
      toast.error('Título y mensaje son requeridos');
      return;
    }
    if (formData.channels.length === 0) {
      toast.error('Selecciona al menos un canal');
      return;
    }
    onSave?.({ ...formData, status: 'active' });
    toast.success('¡Anuncio publicado!');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {announcement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
        </h2>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Título */}
        <div>
          <Label htmlFor="title">Título del anuncio</Label>
          <Input
            id="title"
            placeholder="Ej: 🎉 ¡Nueva actualización disponible!"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 bg-muted border-border"
          />
        </div>

        {/* Mensaje */}
        <div>
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            placeholder="Escribe el contenido del anuncio..."
            rows={4}
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            className="mt-1 bg-muted border-border resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.message.length}/500 caracteres
          </p>
        </div>

        {/* Tipo y prioridad */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de anuncio</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as any }))
              }
            >
              <SelectTrigger className="mt-1 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="info">ℹ️ Información</SelectItem>
                <SelectItem value="success">✅ Éxito/Novedad</SelectItem>
                <SelectItem value="warning">⚠️ Advertencia</SelectItem>
                <SelectItem value="promo">🎉 Promoción</SelectItem>
                <SelectItem value="maintenance">🔧 Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prioridad</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priority: value as any }))
              }
            >
              <SelectTrigger className="mt-1 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">🚨 Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audiencia */}
        <div>
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Audiencia
          </Label>
          <Select
            value={formData.target}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, target: value as any }))
            }
          >
            <SelectTrigger className="mt-1 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">👥 Todos los usuarios</SelectItem>
              <SelectItem value="new_users">
                🆕 Usuarios nuevos (últimos 7 días)
              </SelectItem>
              <SelectItem value="active_users">🔥 Usuarios activos</SelectItem>
              <SelectItem value="inactive_users">
                😴 Usuarios inactivos (+30 días)
              </SelectItem>
              <SelectItem value="premium">⭐ Usuarios premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Canales */}
        <div>
          <Label className="mb-3 block">Canales de distribución</Label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.channels.includes('banner')}
                onCheckedChange={() => handleChannelToggle('banner')}
              />
              <Layout className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Banner en app</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.channels.includes('notification')}
                onCheckedChange={() => handleChannelToggle('notification')}
              />
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Notificación</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.channels.includes('email')}
                onCheckedChange={() => handleChannelToggle('email')}
              />
              <Mail className="w-4 h-4 text-green-400" />
              <span className="text-sm">Email</span>
            </label>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduledAt" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Programar para (opcional)
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={
                formData.scheduledAt ? formData.scheduledAt.slice(0, 16) : ''
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : '',
                }))
              }
              className="mt-1 bg-muted border-border"
            />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expira el (opcional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt ? formData.expiresAt.slice(0, 16) : ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiresAt: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : '',
                }))
              }
              className="mt-1 bg-muted border-border"
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <Label className="mb-2 block">Vista previa</Label>
          <div
            className={`p-4 rounded-lg border ${
              formData.type === 'promo'
                ? 'bg-purple-500/10 border-purple-500/50'
                : formData.type === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/50'
                : formData.type === 'maintenance'
                ? 'bg-orange-500/10 border-orange-500/50'
                : formData.type === 'success'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-blue-500/10 border-blue-500/50'
            }`}
          >
            <h4 className="font-semibold">
              {formData.title || 'Título del anuncio'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {formData.message || 'El mensaje aparecerá aquí...'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-border"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar borrador
          </Button>
          <Button
            variant="outline"
            onClick={handleSchedule}
            className="border-border"
          >
            <Clock className="w-4 h-4 mr-2" />
            Programar
          </Button>
          <Button
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 sm:ml-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            Publicar ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
