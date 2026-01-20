'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Key,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ConfigSecurity() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/security/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      toast.success('Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      toast.error('Escribe ELIMINAR para confirmar');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/settings/security/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmText: deleteConfirmText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }

      toast.success('Cuenta eliminada. ¡Hasta pronto, profeta!');

      // Clear local state and sign out
      logout();
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      // Sign out from NextAuth (this will invalidate the current session)
      await signOut({ redirect: false });
      logout();
      toast.success('Sesiones cerradas correctamente');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesiones');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Seguridad</h2>
        <p className="text-muted-foreground">
          Gestiona tu contraseña y la seguridad de tu cuenta
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-yellow-400" />
          Cambiar Contraseña
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                className="bg-input border-border focus:border-yellow-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Déjalo vacío si te registraste con Google u otra red social
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="••••••••"
              className="bg-input border-border focus:border-yellow-500"
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmar Nueva Contraseña
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="••••••••"
              className="bg-input border-border focus:border-yellow-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Sesiones Activas
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
            <div>
              <div className="font-medium">Este dispositivo</div>
              <div className="text-sm text-muted-foreground">
                Última actividad: Ahora mismo
              </div>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              Actual
            </span>
          </div>

          <Button
            variant="outline"
            className="border-border text-foreground"
            onClick={handleLogoutAllSessions}
          >
            Cerrar todas las sesiones
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          Zona de Peligro
        </h3>

        <p className="text-muted-foreground mb-4">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Se eliminarán todos
          tus datos, escenarios, comentarios y participaciones. Por favor, estás
          seguro.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar mi cuenta
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-red-500/10 rounded-lg">
            <p className="text-sm text-red-300">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) =>
                setDeleteConfirmText(e.target.value.toUpperCase())
              }
              placeholder="ELIMINAR"
              className="bg-input border-red-500/50 focus:border-red-500"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'ELIMINAR'}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Confirmar Eliminación
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="border-border"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
