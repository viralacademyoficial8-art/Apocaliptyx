'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ConfigProfile() {
  const { data: session } = useSession();
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Obtener el ID del usuario (de session o store)
  const userId: string | undefined = session?.user?.id || user?.id;
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
  });

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setFormData({
          displayName: data.display_name || '',
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
          bannerUrl: data.banner_url || '',
        });
      }
    };

    loadUserData();
  }, [userId]);

  // Subir imagen a Supabase Storage
  const uploadImage = async (
    file: File,
    bucket: 'avatars' | 'banners'
  ): Promise<string | null> => {
    if (!userId) return null;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return null;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    try {
      // Eliminar imagen anterior si existe
      const oldUrl = bucket === 'avatars' ? formData.avatarUrl : formData.bannerUrl;
      if (oldUrl && oldUrl.includes(bucket)) {
        const oldFileName = oldUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from(bucket).remove([oldFileName]);
        }
      }

      // Subir nueva imagen
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error('Error al subir la imagen');
        return null;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la imagen');
      return null;
    }
  };

  // Manejar selección de avatar
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const url = await uploadImage(file, 'avatars');
    
    if (url) {
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      toast.success('Avatar subido. Guarda para aplicar cambios.');
    }
    
    setUploadingAvatar(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Manejar selección de banner
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const url = await uploadImage(file, 'banners');
    
    if (url) {
      setFormData(prev => ({ ...prev, bannerUrl: url }));
      toast.success('Banner subido. Guarda para aplicar cambios.');
    }
    
    setUploadingBanner(false);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  // Generar avatar aleatorio
  const handleGenerateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=0f172a`;
    setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    toast.success('Avatar generado. Guarda para aplicar cambios.');
  };

  // Eliminar banner
  const handleRemoveBanner = async () => {
    if (formData.bannerUrl && formData.bannerUrl.includes('banners')) {
      const fileName = formData.bannerUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('banners').remove([fileName]);
      }
    }
    setFormData(prev => ({ ...prev, bannerUrl: '' }));
    toast.success('Banner eliminado. Guarda para aplicar cambios.');
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('No estás autenticado');
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      toast.error('El username debe tener al menos 3 caracteres');
      return;
    }

    if (formData.username.length > 20) {
      toast.error('El username no puede tener más de 20 caracteres');
      return;
    }

    if (formData.bio.length > 200) {
      toast.error('La biografía no puede tener más de 200 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Verificar si el username ya existe (si cambió)
      if (formData.username.toLowerCase() !== user?.username?.toLowerCase()) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', formData.username.toLowerCase())
          .neq('id', userId)
          .single();

        if (existingUser) {
          toast.error('Este nombre de usuario ya está en uso');
          setIsLoading(false);
          return;
        }
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('users')
        .update({
          display_name: formData.displayName,
          username: formData.username.toLowerCase(),
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
          banner_url: formData.bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Update error:', error);
        // Manejar error de username duplicado (race condition)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast.error('Este nombre de usuario ya está en uso');
        } else {
          toast.error('Error al actualizar el perfil');
        }
        return;
      }

      // Actualizar en Zustand (incluir todos los campos)
      updateProfile({
        displayName: formData.displayName,
        username: formData.username.toLowerCase(),
        avatarUrl: formData.avatarUrl,
        bio: formData.bio,
        bannerUrl: formData.bannerUrl,
      } as any);

      toast.success('¡Perfil actualizado correctamente!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Información del Perfil</h2>
        <p className="text-gray-400">
          Actualiza tu información personal y cómo te ven otros profetas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Section */}
        <div className="space-y-3">
          <Label>Banner del Perfil</Label>
          <div className="relative">
            <div 
              className={`
                relative h-32 rounded-lg overflow-hidden border-2 border-dashed
                ${formData.bannerUrl ? 'border-transparent' : 'border-gray-700 hover:border-purple-500'}
                transition-colors cursor-pointer
              `}
              onClick={() => bannerInputRef.current?.click()}
            >
              {formData.bannerUrl ? (
                <>
                  <img
                    src={formData.bannerUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  {uploadingBanner ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click para subir banner</span>
                      <span className="text-xs text-gray-600">Recomendado: 1500x500px</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {formData.bannerUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBanner();
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            className="hidden"
          />
          <p className="text-xs text-gray-500">
            Formato: JPG, PNG o GIF. Máximo 5MB.
          </p>
        </div>

        {/* Avatar Section */}
        <div className="space-y-3">
          <Label>Foto de Perfil</Label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-gray-700">
                <AvatarImage src={formData.avatarUrl} alt={formData.username} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                  {formData.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Foto de Perfil</h3>
              <p className="text-sm text-gray-400">
                Sube una imagen o genera un avatar aleatorio
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="border-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAvatar}
                  className="border-gray-700"
                >
                  Generar Avatar
                </Button>
              </div>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre para mostrar</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            placeholder="Tu nombre público"
            className="bg-gray-800 border-gray-700 focus:border-purple-500"
          />
          <p className="text-xs text-gray-500">
            Este es el nombre que verán otros profetas
          </p>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              @
            </span>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                })
              }
              placeholder="tu_username"
              className="pl-8 bg-gray-800 border-gray-700 focus:border-purple-500"
              minLength={3}
            />
          </div>
          <p className="text-xs text-gray-500">
            Solo letras, números y guiones bajos. Mínimo 3 caracteres.
          </p>
        </div>

        {/* Email (solo lectura) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            El email no se puede cambiar desde aquí
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            placeholder="Cuéntanos sobre ti y tus predicciones favoritas..."
            className="bg-gray-800 border-gray-700 focus:border-purple-500 min-h-[100px]"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            {formData.bio.length}/200 caracteres
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
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
              Guardar Cambios
            </>
          )}
        </Button>
      </form>
    </div>
  );
}