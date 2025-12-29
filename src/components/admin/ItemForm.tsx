'use client';

import { useState } from 'react';
import { ShopItem } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ItemFormProps {
  item?: ShopItem;
  onSave?: (data: Partial<ShopItem>) => void;
  onCancel?: () => void;
}

const availableIcons = [
  '🔒',
  '⏳',
  '🛡️',
  '👁️',
  '✨',
  '👻',
  '🖼️',
  '🏷️',
  '🤫',
  '📦',
  '💎',
  '🎯',
  '🔮',
  '⚡',
  '🎁',
  '🃏',
];

export function ItemForm({ item, onSave, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    slug: item?.slug || '',
    description: item?.description || '',
    shortDescription: item?.shortDescription || '',
    icon: item?.icon || '🎁',
    price: item?.price ?? 10,
    originalPrice: item?.originalPrice ?? undefined,
    currency: item?.currency || 'AP',
    category: item?.category || 'protection',
    rarity: item?.rarity || 'common',
    effect: item?.effect || '',
    duration: item?.duration ?? undefined,
    usageLimit: item?.usageLimit ?? undefined,
    cooldown: item?.cooldown ?? undefined,
    stock: item?.stock ?? undefined,
    isActive: item?.isActive ?? true,
    isNew: item?.isNew || false,
    isFeatured: item?.isFeatured || false,
  });

  const handleSave = () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.effect) {
      toast.error('El efecto es requerido');
      return;
    }

    const slug =
      formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');

    onSave?.({
      ...formData,
      slug,
      price: Number(formData.price),
      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : undefined,
      duration: formData.duration ? Number(formData.duration) : undefined,
      usageLimit: formData.usageLimit
        ? Number(formData.usageLimit)
        : undefined,
      cooldown: formData.cooldown ? Number(formData.cooldown) : undefined,
      stock: formData.stock ? Number(formData.stock) : undefined,
    });
  };

  const rarityClasses: Record<string, string> = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {item ? 'Editar Ítem' : 'Nuevo Ítem'}
        </h2>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="Ej: Candado Protector"
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
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-'),
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="candado-protector"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDesc">Descripción corta</Label>
            <Input
              id="shortDesc"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: e.target.value,
                }))
              }
              className="mt-1 bg-muted border-border"
              placeholder="Ej: Protege tu escenario por 48h"
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-1 bg-muted border-border resize-none"
              rows={3}
              placeholder="Descripción detallada del ítem..."
            />
          </div>

          <div>
            <Label htmlFor="effect">Efecto</Label>
            <Input
              id="effect"
              value={formData.effect}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  effect: e.target.value,
                }))
              }
              className="mt-1 bg-muted border-border"
              placeholder="Ej: Bloquea robos por 48 horas"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                      <span className="text-xl">{icon}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: v as any,
                  }))
                }
              >
                <SelectTrigger className="mt-1 bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="protection">🛡️ Protección</SelectItem>
                  <SelectItem value="power">⚔️ Poder</SelectItem>
                  <SelectItem value="boost">🚀 Boost</SelectItem>
                  <SelectItem value="cosmetic">✨ Cosmético</SelectItem>
                  <SelectItem value="special">🎁 Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rareza</Label>
              <Select
                value={formData.rarity}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    rarity: v as any,
                  }))
                }
              >
                <SelectTrigger className="mt-1 bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="common">⚪ Común</SelectItem>
                  <SelectItem value="rare">🔵 Raro</SelectItem>
                  <SelectItem value="epic">🟣 Épico</SelectItem>
                  <SelectItem value="legendary">🟡 Legendario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Precio original</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    originalPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="Para descuento"
              />
            </div>
            <div>
              <Label>Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: v as any,
                  }))
                }
              >
                <SelectTrigger className="mt-1 bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="AP">🪙 AP Coins</SelectItem>
                  <SelectItem value="USD">💵 USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="duration">Duración (h)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="∞"
              />
            </div>
            <div>
              <Label htmlFor="usageLimit">Usos</Label>
              <Input
                id="usageLimit"
                type="number"
                min="0"
                value={formData.usageLimit ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    usageLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="∞"
              />
            </div>
            <div>
              <Label htmlFor="cooldown">Cooldown (h)</Label>
              <Input
                id="cooldown"
                type="number"
                min="0"
                value={formData.cooldown ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cooldown: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 bg-muted border-border"
                placeholder="∞"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <span className="text-sm">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.isNew}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isNew: checked }))
                }
              />
              <span className="text-sm">Nuevo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
              <span className="text-sm">Destacado</span>
            </label>
          </div>
        </div>

        {/* Vista previa */}
        <div>
          <Label className="mb-3 block">Vista previa</Label>
          <div
            className={`border-2 rounded-xl p-5 bg-card relative overflow-hidden ${rarityClasses[formData.rarity]}`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              {formData.isNew && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  NUEVO
                </span>
              )}
              {formData.isFeatured && (
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> DESTACADO
                </span>
              )}
            </div>

            <div className="text-6xl mb-4">{formData.icon}</div>

            <h3 className="text-xl font-bold mb-1">
              {formData.name || 'Nombre del ítem'}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted/60">
                {formData.rarity === 'legendary'
                  ? 'Legendario'
                  : formData.rarity === 'epic'
                  ? 'Épico'
                  : formData.rarity === 'rare'
                  ? 'Raro'
                  : 'Común'}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {formData.category}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {formData.shortDescription || 'Descripción corta del ítem'}
            </p>

            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-purple-400">
                ✨ {formData.effect || 'Efecto del ítem'}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {formData.duration && <span>⏱️ {formData.duration}h</span>}
                {formData.usageLimit && (
                  <span>🔢 {formData.usageLimit} uso(s)</span>
                )}
                {formData.cooldown && (
                  <span>⏳ CD: {formData.cooldown}h</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {formData.originalPrice &&
                  formData.originalPrice > formData.price && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {formData.currency === 'AP'
                        ? `${formData.originalPrice} AP`
                        : `$${formData.originalPrice}`}
                    </span>
                  )}
                <span className="text-2xl font-bold text-yellow-400">
                  {formData.currency === 'AP'
                    ? `${formData.price} AP`
                    : `$${formData.price}`}
                </span>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Comprar
              </Button>
            </div>

            {formData.stock && (
              <p className="text-xs text-orange-400 mt-2">
                ⚠️ Stock limitado: {formData.stock} disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {item ? 'Guardar cambios' : 'Crear ítem'}
        </Button>
      </div>
    </div>
  );
}
