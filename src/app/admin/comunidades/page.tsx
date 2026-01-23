'use client';

export const dynamic = 'force-dynamic';

/**
 * COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
 * Esta página muestra un mensaje indicando que la función está deshabilitada.
 * El código original se puede encontrar en el historial de git del commit anterior.
 */

import { AdminHeader } from '@/components/admin';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminComunidadesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Comunidades"
        subtitle="Modera y administra las comunidades de usuarios"
      />

      <div className="p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Función Deshabilitada Temporalmente</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            La gestión de comunidades está deshabilitada temporalmente para el MVP.
            Esta función estará disponible en una próxima actualización.
          </p>
          <Button
            onClick={() => router.push('/admin')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
