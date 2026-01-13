'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import { 
  Save,
  Settings,
  Loader2,
  Shield,
  Coins,
  Gift,
  Bell,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ConfigItem {
  key: string;
  value: string;
  type: string;
  description: string;
}

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('key, value');

      if (error) {
        console.error('Error loading config:', error);
        return;
      }

      const configMap: Record<string, string> = {};
      data?.forEach(item => {
        configMap[item.key] = item.value || '';
      });
      setConfig(configMap);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Actualizar cada configuración
      for (const [key, value] of Object.entries(config)) {
        const { error } = await supabase
          .from('system_config')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);

        if (error) {
          console.error(`Error updating ${key}:`, error);
          alert(`Error al guardar ${key}: ${error.message}`);
          return;
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Configuración del Sistema" 
        subtitle="Ajustes generales de la plataforma"
      />

      <div className="p-6 space-y-6">
        {/* General */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">General</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenance_mode === 'true'}
                onChange={(e) => updateConfig('maintenance_mode', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded"
              />
              <div>
                <span className="font-medium">Modo Mantenimiento</span>
                <p className="text-xs text-muted-foreground">Desactiva el acceso a la plataforma</p>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={config.registration_enabled === 'true'}
                onChange={(e) => updateConfig('registration_enabled', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded"
              />
              <div>
                <span className="font-medium">Registro Habilitado</span>
                <p className="text-xs text-muted-foreground">Permite nuevos registros</p>
              </div>
            </label>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Mensaje de Mantenimiento</label>
              <input
                type="text"
                value={config.maintenance_message || ''}
                onChange={(e) => updateConfig('maintenance_message', e.target.value)}
                placeholder="Mensaje que verán los usuarios..."
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Economía */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Economía</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Mínimo Retiro (AP Coins)</label>
              <input
                type="number"
                value={config.min_withdraw_amount || ''}
                onChange={(e) => updateConfig('min_withdraw_amount', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Máximo Retiro Diario (AP Coins)</label>
              <input
                type="number"
                value={config.max_daily_withdraw || ''}
                onChange={(e) => updateConfig('max_daily_withdraw', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Comisiones */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Comisiones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Fee por Robo (%)</label>
              <input
                type="number"
                value={config.steal_fee_percent || ''}
                onChange={(e) => updateConfig('steal_fee_percent', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-muted-foreground mt-1">Comisión cuando un usuario roba un escenario</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Fee al Ganador (%)</label>
              <input
                type="number"
                value={config.winner_fee_percent || ''}
                onChange={(e) => updateConfig('winner_fee_percent', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-muted-foreground mt-1">Comisión sobre las ganancias</p>
            </div>
          </div>
        </div>

        {/* Bonificaciones */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold">Bonificaciones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Bonus Diario (AP Coins)</label>
              <input
                type="number"
                value={config.daily_bonus_amount || ''}
                onChange={(e) => updateConfig('daily_bonus_amount', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bonus por Referido (AP Coins)</label>
              <input
                type="number"
                value={config.referral_bonus || ''}
                onChange={(e) => updateConfig('referral_bonus', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bonus Nuevo Usuario (AP Coins)</label>
              <input
                type="number"
                value={config.new_user_bonus || ''}
                onChange={(e) => updateConfig('new_user_bonus', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Banner / Anuncios */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Banner de Anuncios</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Mensaje del Banner</label>
              <input
                type="text"
                value={config.announcement_banner || ''}
                onChange={(e) => updateConfig('announcement_banner', e.target.value)}
                placeholder="Ej: 🎄 ¡Promo navideña! Doble de AP Coins..."
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tipo de Anuncio</label>
              <select
                value={config.announcement_type || 'INFO'}
                onChange={(e) => updateConfig('announcement_type', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="INFO">Información (Azul)</option>
                <option value="SUCCESS">Éxito (Verde)</option>
                <option value="WARNING">Advertencia (Amarillo)</option>
                <option value="ERROR">Error (Rojo)</option>
              </select>
            </div>

            {config.announcement_banner && (
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">Preview</label>
                <div className={`mt-1 p-3 rounded-lg ${
                  config.announcement_type === 'SUCCESS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  config.announcement_type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  config.announcement_type === 'ERROR' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {config.announcement_banner}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <PermissionGate permission="admin.settings.edit">
          <div className="flex justify-end gap-4">
            {saved && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Guardado correctamente</span>
              </div>
            )}
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
}