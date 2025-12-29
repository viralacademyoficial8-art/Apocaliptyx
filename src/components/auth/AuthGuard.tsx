'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="p-6 text-sm text-muted-foreground">Cargando sesión...</div>;
  }

  return <>{children}</>;
}
