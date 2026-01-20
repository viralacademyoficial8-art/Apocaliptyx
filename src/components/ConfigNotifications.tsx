'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  scenarioStolen: boolean;
  scenarioWon: boolean;
  scenarioLost: boolean;
  newFollower: boolean;
  comments: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  scenarioStolen: true,
  scenarioWon: true,
  scenarioLost: true,
  newFollower: true,
  comments: true,
  weeklyDigest: false,
};

export function ConfigNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/notifications');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        // Fall back to localStorage if API fails
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
          try {
            setSettings(JSON.parse(saved));
          } catch {
            // Use defaults
          }
        }
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        // If database column doesn't exist, show hint
        if (data.sqlHint) {
          console.error('SQL hint:', data.sqlHint);
          toast.error('Necesitas agregar la columna notification_settings a la base de datos');
          // Still save to localStorage as fallback
          localStorage.setItem('notificationSettings', JSON.stringify(settings));
        } else {
          throw new Error(data.error || 'Error al guardar');
        }
      } else {
        // Also save to localStorage as backup
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        toast.success('Preferencias de notificación guardadas');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      // Fallback to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      toast.success('Preferencias guardadas localmente');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationItem = ({
    id,
    label,
    description,
    checked,
    onToggle,
  }: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className="text-base font-medium cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-600"
        disabled={isLoadingSettings}
      />
    </div>
  );

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notificaciones</h2>
          <p className="text-muted-foreground">
            Controla cómo y cuándo recibes notificaciones
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notificaciones</h2>
        <p className="text-muted-foreground">
          Controla cómo y cuándo recibes notificaciones
        </p>
      </div>

      {/* General Notifications */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Canales de Notificación
        </h3>

        <div className="space-y-2">
          <NotificationItem
            id="emailNotifications"
            label="Notificaciones por Email"
            description="Recibe actualizaciones importantes en tu correo"
            checked={settings.emailNotifications}
            onToggle={() => handleToggle('emailNotifications')}
          />
          <NotificationItem
            id="pushNotifications"
            label="Notificaciones Push"
            description="Recibe alertas en tiempo real en tu navegador"
            checked={settings.pushNotifications}
            onToggle={() => handleToggle('pushNotifications')}
          />
        </div>
      </div>

      {/* Activity Notifications */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          Actividad
        </h3>

        <div className="space-y-2">
          <NotificationItem
            id="scenarioStolen"
            label="Escenario Robado"
            description="Cuando alguien roba uno de tus escenarios"
            checked={settings.scenarioStolen}
            onToggle={() => handleToggle('scenarioStolen')}
          />
          <NotificationItem
            id="scenarioWon"
            label="Escenario Ganado"
            description="Cuando ganas un escenario (se cumple la predicción)"
            checked={settings.scenarioWon}
            onToggle={() => handleToggle('scenarioWon')}
          />
          <NotificationItem
            id="scenarioLost"
            label="Escenario Perdido"
            description="Cuando un escenario no se cumple"
            checked={settings.scenarioLost}
            onToggle={() => handleToggle('scenarioLost')}
          />
          <NotificationItem
            id="newFollower"
            label="Nuevo Seguidor"
            description="Cuando alguien comienza a seguirte"
            checked={settings.newFollower}
            onToggle={() => handleToggle('newFollower')}
          />
          <NotificationItem
            id="comments"
            label="Comentarios"
            description="Cuando alguien comenta en tus escenarios"
            checked={settings.comments}
            onToggle={() => handleToggle('comments')}
          />
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-400" />
          Resumen Semanal
        </h3>

        <NotificationItem
          id="weeklyDigest"
          label="Resumen Semanal por Email"
          description="Recibe un resumen de tu actividad cada semana"
          checked={settings.weeklyDigest}
          onToggle={() => handleToggle('weeklyDigest')}
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar Preferencias
          </>
        )}
      </Button>
    </div>
  );
}
