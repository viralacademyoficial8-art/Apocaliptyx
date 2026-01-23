// src/components/perfil/EditProfileForm.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  User, Mail, FileText, Link as LinkIcon, Twitter,
  Save, X, AlertCircle, Check, Eye, EyeOff,
  Globe, Lock, Users, Loader2,
} from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { AvatarUploader } from './AvatarUploader';
import { TitleSelector } from './TitleSelector';
import { useRouter } from 'next/navigation';

interface Title {
  id: string;
  name: string;
  description?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon?: string;
  isOwned: boolean;
}

type PrivacySetting = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export function EditProfileForm() {
  const router = useRouter();
  const { currentProfile, updateProfile } = useProfileStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);

  // Cargar títulos del usuario desde la API
  useEffect(() => {
    const loadTitles = async () => {
      try {
        const response = await fetch('/api/profile/titles');
        const data = await response.json();

        if (data.titles) {
          setTitles(data.titles);
        }
        if (data.activeTitle) {
          setFormData(prev => ({ ...prev, activeTitle: data.activeTitle }));
        }
      } catch (error) {
        console.error('Error loading titles:', error);
      } finally {
        setIsLoadingTitles(false);
      }
    };

    loadTitles();
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: currentProfile?.displayName || '',
    username: currentProfile?.username || '',
    bio: currentProfile?.bio || '',
    email: currentProfile?.email || '',
    twitter: currentProfile?.socialLinks?.twitter || '',
    discord: currentProfile?.socialLinks?.discord || '',
    instagram: currentProfile?.socialLinks?.instagram || '',
    activeTitle: currentProfile?.activeTitle || null,
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<{
    showEmail: PrivacySetting;
    showActivity: PrivacySetting;
    showStats: PrivacySetting;
  }>({
    showEmail: 'PRIVATE',
    showActivity: 'PUBLIC',
    showStats: 'PUBLIC',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.displayName && formData.displayName.length > 50) {
      newErrors.displayName = 'Máximo 50 caracteres';
    }
    
    if (formData.bio && formData.bio.length > 300) {
      newErrors.bio = 'Máximo 300 caracteres';
    }
    
    if (formData.twitter && !/^[a-zA-Z0-9_]{1,15}$/.test(formData.twitter)) {
      newErrors.twitter = 'Usuario de Twitter inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));
      
      updateProfile({
        displayName: formData.displayName || null,
        bio: formData.bio || null,
        activeTitle: formData.activeTitle,
        socialLinks: {
          twitter: formData.twitter || undefined,
          discord: formData.discord || undefined,
          instagram: formData.instagram || undefined,
        },
      });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      setErrors({ submit: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/perfil');
  };

  const PrivacySelect = ({
    value,
    onChange,
    label,
  }: {
    value: PrivacySetting;
    onChange: (v: PrivacySetting) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <span className="text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PrivacySetting)}
        className="px-3 py-1.5 bg-muted border border-border rounded-lg text-white text-sm"
      >
        <option value="PUBLIC">🌍 Público</option>
        <option value="FOLLOWERS">👥 Seguidores</option>
        <option value="PRIVATE">🔒 Privado</option>
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success Message */}
      {isSaved && (
        <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
          <Check className="w-5 h-5" />
          ¡Perfil actualizado correctamente!
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle className="w-5 h-5" />
          {errors.submit}
        </div>
      )}

      {/* Section: Avatar */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-white mb-6">Foto de Perfil</h2>
        <AvatarUploader
          currentAvatar={currentProfile?.avatarUrl || null}
          onAvatarChange={setAvatarFile}
          size="xl"
        />
      </section>

      {/* Section: Basic Info */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-white mb-6">Información Básica</h2>
        
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Nombre para mostrar
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Tu nombre público"
                maxLength={50}
                className={`w-full pl-10 pr-4 py-2.5 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.displayName ? 'border-red-500' : 'border-border'
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.displayName && (
                <span className="text-red-400 text-xs">{errors.displayName}</span>
              )}
              <span className="text-muted-foreground text-xs ml-auto">
                {formData.displayName.length}/50
              </span>
            </div>
          </div>

          {/* Username (read-only) */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Nombre de usuario
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <input
                type="text"
                value={formData.username}
                disabled
                className="w-full pl-8 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              El nombre de usuario no se puede cambiar
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Biografía
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                maxLength={300}
                rows={4}
                className={`w-full pl-10 pr-4 py-2.5 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                  errors.bio ? 'border-red-500' : 'border-border'
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.bio && (
                <span className="text-red-400 text-xs">{errors.bio}</span>
              )}
              <span className="text-muted-foreground text-xs ml-auto">
                {formData.bio.length}/300
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Title */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Título</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Elige un título para mostrar en tu perfil. Los títulos se desbloquean en la tienda.
        </p>
        {isLoadingTitles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : titles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tienes títulos disponibles.</p>
            <p className="text-sm mt-1">Visita la tienda para desbloquear títulos.</p>
          </div>
        ) : (
          <TitleSelector
            titles={titles}
            selectedTitle={formData.activeTitle}
            onSelect={(id) => setFormData((prev) => ({ ...prev, activeTitle: id }))}
          />
        )}
      </section>

      {/* Section: Social Links */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-white mb-6">Redes Sociales</h2>
        
        <div className="space-y-4">
          {/* Twitter */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Twitter</label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="tu_usuario"
                className={`w-full pl-16 pr-4 py-2.5 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.twitter ? 'border-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.twitter && (
              <span className="text-red-400 text-xs mt-1">{errors.twitter}</span>
            )}
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Discord</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">💬</span>
              <input
                type="text"
                value={formData.discord}
                onChange={(e) => handleChange('discord', e.target.value)}
                placeholder="usuario#1234"
                className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">📸</span>
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="tu_usuario"
                className="w-full pl-16 pr-4 py-2.5 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Privacy */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Privacidad</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Controla quién puede ver tu información
        </p>
        
        <div>
          <PrivacySelect
            label="Mostrar email"
            value={privacy.showEmail}
            onChange={(v) => setPrivacy((p) => ({ ...p, showEmail: v }))}
          />
          <PrivacySelect
            label="Mostrar actividad"
            value={privacy.showActivity}
            onChange={(v) => setPrivacy((p) => ({ ...p, showActivity: v }))}
          />
          <PrivacySelect
            label="Mostrar estadísticas"
            value={privacy.showStats}
            onChange={(v) => setPrivacy((p) => ({ ...p, showStats: v }))}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-6 py-2.5 bg-muted hover:bg-muted text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}