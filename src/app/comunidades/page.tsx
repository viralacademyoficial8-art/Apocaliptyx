'use client';

export const dynamic = 'force-dynamic';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect page: /comunidades now redirects to /foro?tab=comunidades
 * This ensures all community functionality is unified in one place.
 */
export default function ComunidadesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/foro?tab=comunidades');
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-gray-400">Redirigiendo a comunidades...</p>
      </div>
    </div>
  );
}
