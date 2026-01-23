"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Loader2 } from "lucide-react";

// Este componente redirige al perfil público del usuario
export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Esperar hidratación de Zustand
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    // Redirigir al perfil público del usuario
    if (user?.username) {
      router.replace(`/perfil/${user.username}`);
    }
  }, [hydrated, user?.id, user?.username, router]);

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    </div>
  );
}
