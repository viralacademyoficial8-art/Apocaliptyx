// src/components/auth/AuthSync.tsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";
import { usePathname } from "next/navigation";

export function AuthSync() {
  const { data: session, status } = useSession();
  const { logout, user, refreshBalance } = useAuthStore();
  const pathname = usePathname();

  // Sincronizar cuando la sesión cambia - usar refreshBalance para obtener datos reales
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Usar refreshBalance para obtener datos reales de la BD
      // Esto crea el usuario en Zustand si no existe
      refreshBalance();
    } else if (status === "unauthenticated" && user) {
      // Solo hacer logout si NO estamos en la página de registro o login
      if (!pathname.includes('/registro') && !pathname.includes('/login')) {
        logout();
      }
    }
  }, [session, status, user, logout, pathname, refreshBalance]);

  return null;
}