'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
 * Las páginas de comunidades individuales redirigen al foro principal.
 * El código original está respaldado y se puede restaurar cuando se active la función.
 */
export default function CommunityDetailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al foro principal (comunidades deshabilitado para MVP)
    router.replace('/foro');
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-gray-400">Redirigiendo al foro...</p>
      </div>
    </div>
  );
}

/* ================================================================================
   CODIGO ORIGINAL - RESPALDADO PARA RESTAURAR CUANDO SE ACTIVE LA FUNCION
   ================================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
... (resto del código original)

================================================================================ */
