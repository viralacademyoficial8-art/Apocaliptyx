'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ProfileTheme {
  primary: string;
  secondary: string;
  background: string;
}

interface ThemeCustomizerProps {
  currentTheme: ProfileTheme;
  onSave: (theme: ProfileTheme) => void;
}

const presetThemes: { name: string; theme: ProfileTheme }[] = [
  {
    name: 'Púrpura',
    theme: { primary: '#6366f1', secondary: '#8b5cf6', background: 'default' },
  },
  {
    name: 'Océano',
    theme: { primary: '#0ea5e9', secondary: '#06b6d4', background: 'ocean' },
  },
  {
    name: 'Fuego',
    theme: { primary: '#ef4444', secondary: '#f97316', background: 'fire' },
  },
  {
    name: 'Bosque',
    theme: { primary: '#22c55e', secondary: '#10b981', background: 'forest' },
  },
  {
    name: 'Dorado',
    theme: { primary: '#f59e0b', secondary: '#eab308', background: 'gold' },
  },
  {
    name: 'Rosa',
    theme: { primary: '#ec4899', secondary: '#f472b6', background: 'pink' },
  },
  {
    name: 'Neón',
    theme: { primary: '#a855f7', secondary: '#22d3ee', background: 'neon' },
  },
  {
    name: 'Medianoche',
    theme: { primary: '#3b82f6', secondary: '#1e3a8a', background: 'midnight' },
  },
];

export function ThemeCustomizer({ currentTheme, onSave }: ThemeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ProfileTheme>(currentTheme);

  const handleSave = () => {
    onSave(theme);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-400 hover:text-white"
        >
          <Palette className="w-4 h-4 mr-2" />
          Personalizar tema
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar tema del perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div
            className="h-24 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            Vista previa
          </div>

          {/* Preset Themes */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">
              Temas predefinidos
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presetThemes.map((preset) => {
                const isSelected =
                  preset.theme.primary === theme.primary &&
                  preset.theme.secondary === theme.secondary;

                return (
                  <button
                    key={preset.name}
                    onClick={() => setTheme(preset.theme)}
                    className={`relative h-12 rounded-lg transition-transform hover:scale-105 ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${preset.theme.primary}, ${preset.theme.secondary})`,
                    }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <label className="text-sm text-gray-400 block">
              Colores personalizados
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Color primario
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme({ ...theme, primary: e.target.value })
                    }
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                  <Input
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme({ ...theme, primary: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-sm"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Color secundario
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme({ ...theme, secondary: e.target.value })
                    }
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                  <Input
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme({ ...theme, secondary: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-sm"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
            Guardar tema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
