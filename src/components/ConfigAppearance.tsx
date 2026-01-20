// src/components/ConfigAppearance.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Save,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'red' | 'purple' | 'blue' | 'green' | 'yellow' | 'orange';

export function ConfigAppearance() {
  const { theme, setTheme, resolvedTheme, accentColor, setAccentColor } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const themes: {
    id: Theme;
    label: string;
    icon: any;
    description: string;
  }[] = [
    {
      id: 'dark',
      label: 'Oscuro',
      icon: Moon,
      description: 'Tema oscuro para reducir fatiga visual',
    },
    {
      id: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro para ambientes iluminados',
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Usar la preferencia de tu dispositivo',
    },
  ];

  const accentColors: {
    id: AccentColor;
    label: string;
    bgClass: string;
  }[] = [
    { id: 'red', label: 'Rojo Apocalíptico', bgClass: 'bg-red-500' },
    { id: 'purple', label: 'Púrpura Místico', bgClass: 'bg-purple-500' },
    { id: 'blue', label: 'Azul Profético', bgClass: 'bg-blue-500' },
    { id: 'green', label: 'Verde Esperanza', bgClass: 'bg-green-500' },
    { id: 'yellow', label: 'Dorado Nostradamus', bgClass: 'bg-yellow-500' },
    { id: 'orange', label: 'Naranja Fuego', bgClass: 'bg-orange-500' },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    const label = themes.find((t) => t.id === newTheme)?.label ?? '';
    toast.success(`Tema ${label} activado`);
  };

  const handleAccentChange = (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    const label = accentColors.find((c) => c.id === newAccent)?.label ?? '';
    toast.success(`Color ${label} aplicado en toda la plataforma`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success('Preferencias de apariencia guardadas correctamente');
    } catch {
      toast.error('Error al guardar preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Apariencia</h2>
        <p className="text-muted-foreground">
          Personaliza cómo se ve Apocaliptyx para ti.
        </p>
      </div>

      {/* Selección de tema */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          Tema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleThemeChange(id)}
              className={`p-4 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                theme === id
                  ? 'border-accent bg-accent-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/50'
              }`}
            >
              <Icon
                className={`w-8 h-8 mx-auto mb-2 ${
                  theme === id ? 'text-accent' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-sm font-medium block ${
                  theme === id ? 'text-accent' : 'text-foreground'
                }`}
              >
                {label}
              </span>
              <span className="text-xs text-muted-foreground mt-1 block">
                {description}
              </span>
              {theme === id && (
                <Check className="w-4 h-4 text-accent mx-auto mt-2" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tema actual:</span>{' '}
            {resolvedTheme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
            {theme === 'system' && ' (según tu sistema)'}
          </p>
        </div>
      </div>

      {/* Color de acento */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Color de acento
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Elige el color principal para botones y elementos destacados. El cambio se aplica inmediatamente en toda la plataforma.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {accentColors.map(({ id, label, bgClass }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleAccentChange(id)}
              className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 hover:scale-[1.02] ${
                accentColor === id
                  ? 'border-foreground bg-muted'
                  : 'border-border bg-card hover:border-muted-foreground/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${bgClass} shadow-lg`} />
              <span className="text-sm font-medium flex-1 text-left">{label}</span>
              {accentColor === id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vista previa</h3>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button className="btn-accent">
              Botón principal
            </Button>
            <Button variant="outline" className="btn-accent-outline">
              Botón outline
            </Button>
            <Button variant="ghost">Botón ghost</Button>
          </div>

          <div className="p-4 rounded-lg border-l-4 bg-accent-primary/10 border-accent">
            <p className="text-sm">
              Así se verán las notificaciones y elementos destacados con tu
              color elegido.
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Card de ejemplo</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Este es un ejemplo de cómo se verá el contenido con el tema{' '}
              {resolvedTheme === 'dark' ? 'oscuro' : 'claro'}.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-accent-primary/20 text-accent rounded text-xs font-medium">
                Tag destacado
              </span>
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                Tag normal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-accent-primary/10 border border-accent rounded-lg p-4">
        <p className="text-sm text-foreground">
          <strong>Nota:</strong> Los cambios de tema y color de acento se guardan automáticamente y se aplican inmediatamente en toda la plataforma.
        </p>
      </div>

      {/* Guardar */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={isLoading}
        className="btn-accent"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar preferencias
          </>
        )}
      </Button>
    </div>
  );
}
