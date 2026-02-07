'use client';

import { useState, useRef } from 'react';
import { Plus, Globe, Lock, Loader2, ImageIcon, X, Upload } from 'lucide-react';
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
import toast from 'react-hot-toast';

interface CreateCommunityModalProps {
  onCreateCommunity: (data: {
    name: string;
    description: string;
    isPublic: boolean;
    requiresApproval: boolean;
    categories: string[];
    themeColor: string;
    iconUrl?: string;
    bannerUrl?: string;
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

  // Image states
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, type: 'icon' | 'banner'): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/communities/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return null;
      }

      return data.url;
    } catch {
      toast.error(`Error al subir ${type === 'icon' ? 'el logo' : 'el banner'}`);
      return null;
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El logo no puede superar 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El banner no puede superar 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let iconUrl: string | undefined;
      let bannerUrl: string | undefined;

      // Upload images if selected
      if (iconFile) {
        setUploadingIcon(true);
        const url = await uploadImage(iconFile, 'icon');
        if (url) iconUrl = url;
        setUploadingIcon(false);
      }

      if (bannerFile) {
        setUploadingBanner(true);
        const url = await uploadImage(bannerFile, 'banner');
        if (url) bannerUrl = url;
        setUploadingBanner(false);
      }

      const success = await onCreateCommunity({
        name,
        description,
        isPublic,
        requiresApproval,
        categories: selectedCategories,
        themeColor,
        iconUrl,
        bannerUrl,
      });

      if (success) {
        // Reset form only on success
        setName('');
        setDescription('');
        setIsPublic(true);
        setRequiresApproval(false);
        setSelectedCategories([]);
        setThemeColor(themeColors[0]);
        setIconFile(null);
        setIconPreview(null);
        setBannerFile(null);
        setBannerPreview(null);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
      setUploadingIcon(false);
      setUploadingBanner(false);
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
        <Button type="button" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear comunidad
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva comunidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Banner Upload */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Banner de la comunidad
            </label>
            <div
              className="relative h-32 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => !isLoading && bannerInputRef.current?.click()}
              style={{
                background: bannerPreview
                  ? `url(${bannerPreview}) center/cover`
                  : `linear-gradient(135deg, ${themeColor}60, ${themeColor}20)`,
              }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingBanner ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white mx-auto mb-1" />
                    <span className="text-white text-sm">Subir banner</span>
                  </div>
                )}
              </div>
              {bannerPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBanner();
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              {/* Icon overlay */}
              <div className="absolute bottom-3 left-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold border-2 border-gray-900 cursor-pointer group/icon overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    !isLoading && iconInputRef.current?.click();
                  }}
                  style={{
                    background: iconPreview
                      ? `url(${iconPreview}) center/cover`
                      : themeColor,
                  }}
                >
                  {!iconPreview && (name.charAt(0) || '?')}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                    {uploadingIcon ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              disabled={isLoading}
            />
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Banner: max 10MB | Logo: max 5MB (click en el icono para cambiar)
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Nombre de la comunidad *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Predicciones de Fútbol"
              className="bg-muted border-border"
              maxLength={50}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata tu comunidad..."
              className="bg-muted border-border min-h-[80px]"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Categorías (máx. 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Color del tema
            </label>
            <div className="flex gap-2">
              {themeColors.map((color) => (
                <button
                  type="button"
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
                  <p className="font-medium">
                    {isPublic ? 'Comunidad pública' : 'Comunidad privada'}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground">
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
            type="button"
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
