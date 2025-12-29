'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ConfigProfile() {
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: '', // solo local por ahora
    avatarUrl: user?.avatarUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      toast.error('El username debe tener al menos 3 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 800));

      updateProfile({
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
        // Si algún día agregas `bio` al tipo User, puedes descomentar esta línea:
        // bio: formData.bio as any,
      });

      toast.success('¡Perfil actualizado correctamente!');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = () => {
    // Generar nuevo avatar aleatorio con DiceBear
    const seed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setFormData({ ...formData, avatarUrl: newAvatarUrl });
    toast.success('Avatar generado. Guarda para aplicar cambios.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Información del Perfil</h2>
        <p className="text-gray-400">
          Actualiza tu información personal y cómo te ven otros profetas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
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
              onClick={handleAvatarChange}
              className="absolute -bottom-2 -right-2 p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Foto de Perfil</h3>
            <p className="text-sm text-gray-400 mb-2">
              Click en el icono de cámara para generar un nuevo avatar
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAvatarChange}
              className="border-gray-700"
            >
              Generar Nuevo Avatar
            </Button>
          </div>
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
                  username: e.target.value.toLowerCase().replace(/\s/g, ''),
                })
              }
              placeholder="tu_username"
              className="pl-8 bg-gray-800 border-gray-700 focus:border-purple-500"
              minLength={3}
            />
          </div>
          <p className="text-xs text-gray-500">
            Mínimo 3 caracteres, sin espacios
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="tu@email.com"
            className="bg-gray-800 border-gray-700 focus:border-purple-500"
          />
        </div>

        {/* Bio (solo UI por ahora) */}
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
