'use client';

export const dynamic = 'force-dynamic';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
 * Redirect page: /comunidades now redirects to /foro (comunidades deshabilitado temporalmente)
 */
export default function ComunidadesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a /foro en lugar de /foro?tab=comunidades (MVP)
    router.replace('/foro');
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Redirigiendo al foro...</p>
      </div>
    </div>
  );
}
