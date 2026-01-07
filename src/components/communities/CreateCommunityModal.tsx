'use client';

import { useState } from 'react';
import { Plus, Globe, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface CreateCommunityModalProps {
  onCreateCommunity: (data: {
    name: string;
    description: string;
    isPublic: boolean;
    requiresApproval: boolean;
    categories: string[];
    themeColor: string;
  }) => Promise<boolean>;
}

const predefinedCategories = [
  'Deportes',
  'Crypto',
  'Política',
  'Entretenimiento',
  'Tecnología',
  'Gaming',
  'Economía',
  'Ciencia',
];

const themeColors = [
  '#6366f1', // Purple
  '#ef4444', // Red
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Yellow
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export function CreateCommunityModal({ onCreateCommunity }: CreateCommunityModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState(themeColors[0]);

  const handleSubmit = async () => {
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const success = await onCreateCommunity({
        name,
        description,
        isPublic,
        requiresApproval,
        categories: selectedCategories,
        themeColor,
      });

      if (success) {
        // Reset form only on success
        setName('');
        setDescription('');
        setIsPublic(true);
        setRequiresApproval(false);
        setSelectedCategories([]);
        setThemeColor(themeColors[0]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear comunidad
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva comunidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div
            className="h-20 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${themeColor}60, ${themeColor}20)`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: themeColor }}
            >
              {name.charAt(0) || '?'}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Nombre de la comunidad *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Predicciones de Fútbol"
              className="bg-gray-800 border-gray-700"
              maxLength={50}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/50</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata tu comunidad..."
              className="bg-gray-800 border-gray-700 min-h-[80px]"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Categorías (máx. 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Color del tema
            </label>
            <div className="flex gap-2">
              {themeColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    themeColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                      : ''
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="font-medium">Comunidad pública</p>
                  <p className="text-xs text-gray-400">
                    {isPublic
                      ? 'Cualquiera puede ver y unirse'
                      : 'Solo con invitación o aprobación'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isLoading}
              />
            </div>

            {isPublic && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Requiere aprobación</p>
                  <p className="text-xs text-gray-400">
                    Los nuevos miembros deben ser aprobados
                  </p>
                </div>
                <Switch
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear comunidad'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
