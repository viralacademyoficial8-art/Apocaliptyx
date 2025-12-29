'use client';

import { useState } from 'react';
import { PromoCode } from '@/lib/admin-data';
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
import { 
  Save, 
  X,
  Percent,
  Coins,
  Tag,
  Sparkles,
  Copy,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PromoCodeFormProps {
  promoCode?: PromoCode;
  onSave?: (data: Partial<PromoCode>) => void;
  onCancel?: () => void;
}

// Generador de códigos aleatorios
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function PromoCodeForm({ promoCode, onSave, onCancel }: PromoCodeFormProps) {
  const [formData, setFormData] = useState({
    code: promoCode?.code || '',
    description: promoCode?.description || '',
    type: promoCode?.type || 'percentage',
    value: promoCode?.value || 10,
    minPurchase: promoCode?.minPurchase || 0,
    maxDiscount: promoCode?.maxDiscount || 0,
    usageLimit: promoCode?.usageLimit || 0,
    perUserLimit: promoCode?.perUserLimit || 1,
    validFrom: promoCode?.validFrom?.slice(0, 16) || '',
    validUntil: promoCode?.validUntil?.slice(0, 16) || '',
    applicableTo: promoCode?.applicableTo || 'all',
  });

  const handleGenerateCode = () => {
    setFormData(prev => ({ ...prev, code: generateRandomCode() }));
  };

  const handleCopyCode = () => {
    if (!formData.code) return;
    navigator.clipboard.writeText(formData.code);
    toast.success('Código copiado');
  };

  const handleSave = (status: 'active' | 'inactive') => {
    if (!formData.code) {
      toast.error('El código es requerido');
      return;
    }
    if (!formData.validFrom || !formData.validUntil) {
      toast.error('Las fechas son requeridas');
      return;
    }
    
    onSave?.({
      ...formData,
      code: formData.code.toUpperCase(),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      status,
    });
    
    toast.success(status === 'active' ? '¡Código activado!' : 'Código guardado como inactivo');
  };

  const getValueLabel = () => {
    switch (formData.type) {
      case 'percentage': return 'Porcentaje de descuento (%)';
      case 'fixed_discount': return 'Cantidad de descuento (AP)';
      case 'free_coins': return 'AP Coins gratis';
      case 'bonus_multiplier': return 'Multiplicador (ej: 2 = doble)';
      default: return 'Valor';
    }
  };

  const getValueIcon = () => {
    switch (formData.type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed_discount': return <Tag className="w-4 h-4" />;
      case 'free_coins': return <Coins className="w-4 h-4" />;
      case 'bonus_multiplier': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {promoCode ? 'Editar Código' : 'Nuevo Código Promocional'}
        </h2>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Code */}
        <div>
          <Label htmlFor="code">Código promocional</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="code"
              placeholder="Ej: NAVIDAD2024"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="bg-muted border-border font-mono uppercase"
            />
            <Button type="button" variant="outline" onClick={handleGenerateCode} className="border-border">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" onClick={handleCopyCode} className="border-border">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Solo letras y números, sin espacios
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Descripción interna</Label>
          <Textarea
            id="description"
            placeholder="Ej: Promoción de navidad para usuarios nuevos"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 bg-muted border-border resize-none"
          />
        </div>

        {/* Type and Value */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de promoción</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="mt-1 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="percentage">📊 Porcentaje de descuento</SelectItem>
                <SelectItem value="fixed_discount">💵 Descuento fijo (AP)</SelectItem>
                <SelectItem value="free_coins">🪙 AP Coins gratis</SelectItem>
                <SelectItem value="bonus_multiplier">✨ Multiplicador bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value" className="flex items-center gap-2">
              {getValueIcon()}
              {getValueLabel()}
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              className="mt-1 bg-muted border-border"
            />
          </div>
        </div>

        {/* Conditions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="minPurchase">Compra mínima (AP)</Label>
            <Input
              id="minPurchase"
              type="number"
              min="0"
              value={formData.minPurchase}
              onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: parseInt(e.target.value) || 0 }))}
              className="mt-1 bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">0 = sin mínimo</p>
          </div>

          {formData.type === 'percentage' && (
            <div>
              <Label htmlFor="maxDiscount">Descuento máximo (AP)</Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: parseInt(e.target.value) || 0 }))}
                className="mt-1 bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">0 = sin límite</p>
            </div>
          )}

          <div>
            <Label htmlFor="usageLimit">Usos totales</Label>
            <Input
              id="usageLimit"
              type="number"
              min="0"
              value={formData.usageLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
              className="mt-1 bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">0 = ilimitado</p>
          </div>

          <div>
            <Label htmlFor="perUserLimit">Usos por usuario</Label>
            <Input
              id="perUserLimit"
              type="number"
              min="1"
              value={formData.perUserLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, perUserLimit: parseInt(e.target.value) || 1 }))}
              className="mt-1 bg-muted border-border"
            />
          </div>
        </div>

        {/* Applicable To */}
        <div>
          <Label>Aplicable a</Label>
          <Select value={formData.applicableTo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, applicableTo: value }))}>
            <SelectTrigger className="mt-1 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">🌐 Todo (compras y ítems)</SelectItem>
              <SelectItem value="first_purchase">🆕 Solo primera compra</SelectItem>
              <SelectItem value="ap_coins">🪙 Solo compra de AP Coins</SelectItem>
              <SelectItem value="items">🛒 Solo ítems de tienda</SelectItem>
              <SelectItem value="premium">⭐ Solo usuarios premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validFrom">Válido desde</Label>
            <Input
              id="validFrom"
              type="datetime-local"
              value={formData.validFrom}
              onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
              className="mt-1 bg-muted border-border"
            />
          </div>
          <div>
            <Label htmlFor="validUntil">Válido hasta</Label>
            <Input
              id="validUntil"
              type="datetime-local"
              value={formData.validUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              className="mt-1 bg-muted border-border"
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <Label className="mb-2 block">Vista previa</Label>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xl font-bold text-purple-400">
                  {formData.code || 'CODIGO'}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description || 'Descripción del código'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {formData.type === 'percentage' && `${formData.value}% OFF`}
                  {formData.type === 'fixed_discount' && `${formData.value} AP OFF`}
                  {formData.type === 'free_coins' && `${formData.value} AP Gratis`}
                  {formData.type === 'bonus_multiplier' && `${formData.value}x Bonus`}
                </div>
                {formData.minPurchase > 0 && (
                  <p className="text-xs text-muted-foreground">Mín. {formData.minPurchase} AP</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleSave('inactive')} className="border-border">
            <Save className="w-4 h-4 mr-2" />
            Guardar inactivo
          </Button>
          <Button onClick={() => handleSave('active')} className="bg-green-600 hover:bg-green-700 sm:ml-auto">
            <Sparkles className="w-4 h-4 mr-2" />
            Activar código
          </Button>
        </div>
      </div>
    </div>
  );
}
