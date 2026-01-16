// src/components/admin/AdminGuard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/roles';
import { Loader2, ShieldOff } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function AdminGuard({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback,
}: AdminGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { can, canAny, canAll, canAccessAdmin, role, isAdmin } = usePermissions();
  const [hydrated, setHydrated] = useState(false);

  // Esperar hidratación del store
  useEffect(() => {
    // Verificar si ya hay datos en localStorage
    const checkHydration = () => {
      try {
        const stored = localStorage.getItem('apocaliptyx-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.user) {
            setHydrated(true);
            return;
          }
        }
      } catch (e) {
        console.error('Error checking hydration:', e);
      }
      
      // Si no hay datos o hay error, esperar un poco más
      setTimeout(() => setHydrated(true), 500);
    };

    checkHydration();
  }, []);

  // Debug logs
  useEffect(() => {
    if (hydrated) {
      console.log('[AdminGuard] Hydrated - User:', user?.email, 'Role:', role, 'isAdmin:', isAdmin, 'canAccessAdmin:', canAccessAdmin);
    }
  }, [hydrated, user, role, isAdmin, canAccessAdmin]);

  // Mostrar loading mientras se hidrata
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    console.log('[AdminGuard] Not authenticated, redirecting to login');
    router.push('/login');
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Verificar acceso al panel de admin usando isAdmin directamente
  if (!isAdmin && !canAccessAdmin) {
    console.log('[AdminGuard] No admin access, showing denied');
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <ShieldOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">No tienes permisos para acceder a esta sección.</p>
          <p className="text-gray-500 text-sm mb-4">Tu rol: {role}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos específicos
  const allPermissions = requiredPermission 
    ? [requiredPermission, ...requiredPermissions]
    : requiredPermissions;

  if (allPermissions.length > 0) {
    const hasAccess = requireAll 
      ? canAll(allPermissions)
      : canAny(allPermissions);

    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <ShieldOff className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Permisos Insuficientes</h1>
            <p className="text-gray-400 mb-6">
              Tu rol de {role} no tiene los permisos necesarios para esta acción.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            >
              Volver al Panel Admin
            </button>
          </div>
        </div>
      );
    }
  }

  console.log('[AdminGuard] Access granted');
  return <>{children}</>;
}

// Componente para mostrar/ocultar contenido según permisos
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  const allPermissions = permission 
    ? [permission, ...permissions]
    : permissions;

  if (allPermissions.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll 
    ? canAll(allPermissions)
    : canAny(allPermissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}