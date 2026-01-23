'use client';

import { useState } from 'react';
import { ForumCategory, getCategoryColor } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ForumCategoriesManagerProps {
  categories: ForumCategory[];
  onAddCategory?: (category: Partial<ForumCategory>) => void;
  onEditCategory?: (category: ForumCategory) => void;
  onDeleteCategory?: (category: ForumCategory) => void;
  onToggleCategory?: (category: ForumCategory) => void;
  onReorderCategories?: (categories: ForumCategory[]) => void;
}

const availableIcons = ['💻', '⚽', '📈', '🏛️', '🎬', '🔬', '💬', '🎮', '🎵', '✈️', '🍔', '❤️', '📦', '🌍'];
const availableColors = ['blue', 'green', 'yellow', 'red', 'purple', 'cyan', 'gray', 'pink', 'orange'];

export function ForumCategoriesManager({ 
  categories, 
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onToggleCategory,
}: ForumCategoriesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '💬',
    color: 'gray',
  });

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleOpenDialog = (category?: ForumCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '💬',
        color: 'gray',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      onEditCategory?.({ ...editingCategory, ...formData, slug });
      toast.success('Categoría actualizada');
    } else {
      onAddCategory?.({
        ...formData,
        slug,
        postsCount: 0,
        isActive: true,
        order: categories.length + 1,
      });
      toast.success('Categoría creada');
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Categorías del Foro</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>

              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 bg-muted border-border"
                  placeholder="Ej: Tecnología"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    }))
                  }
                  className="mt-1 bg-muted border-border"
                  placeholder="Ej: tecnologia"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-1 bg-muted border-border"
                  placeholder="Breve descripción de la categoría"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icono</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, icon: v }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-lg">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, color: v }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {availableColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-4 h-4 rounded bg-muted')} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Vista previa</Label>
                <div
                  className={cn(
                    'mt-2 p-3 rounded-lg border flex items-center gap-3',
                    getCategoryColor(formData.color)
                  )}
                >
                  <span className="text-2xl">{formData.icon}</span>
                  <div>
                    <div className="font-medium">
                      {formData.name || 'Nombre'}
                    </div>
                    <div className="text-sm opacity-80">
                      {formData.description || 'Descripción'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingCategory ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-2">
        {sortedCategories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              category.isActive
                ? 'bg-card border-border hover:border-purple-500/50'
                : 'bg-muted/50 border-border opacity-60'
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />

            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-xl border',
                getCategoryColor(category.color)
              )}
            >
              {category.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {!category.isActive && (
                  <span className="px-2 py-0.5 bg-gray-500/20 text-muted-foreground rounded-full text-xs">
                    Inactiva
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {category.description}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {category.postsCount} posts
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleCategory?.(category)}
                title={category.isActive ? 'Desactivar' : 'Activar'}
              >
                {category.isActive ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-green-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenDialog(category)}
              >
                <Edit className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (category.postsCount > 0) {
                    toast.error('No puedes eliminar una categoría con posts');
                    return;
                  }
                  onDeleteCategory?.(category);
                }}
                disabled={category.postsCount > 0}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Las categorías inactivas no aparecerán en el foro.
      </p>
    </div>
  );
}
