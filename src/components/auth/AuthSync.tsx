// src/components/auth/AuthSync.tsx

"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types";

export function AuthSync() {
  const { data: session, status, update } = useSession();
  const { login, logout, user } = useAuthStore();
  const pathname = usePathname();

  // Función para sincronizar usuario
  const syncUser = useCallback((sessionUser: any) => {
    if (!sessionUser) return;
    
    login({
      id: sessionUser.id || "",
      email: sessionUser.email || "",
      username: sessionUser.username || sessionUser.email?.split("@")[0] || "user",
      displayName: sessionUser.name || "Usuario",
      avatarUrl: sessionUser.image || "",
      prophetLevel: "vidente",
      reputationScore: 0,
      apCoins: sessionUser.apCoins || 1000,
      scenariosCreated: 0,
      scenariosWon: 0,
      winRate: 0,
      followers: 0,
      following: 0,
      createdAt: new Date(),
      // Incluir el rol del usuario
      role: (sessionUser.role as UserRole) || 'USER',
    });
  }, [login]);

  // Forzar actualización de sesión cuando cambia la ruta (después de login)
  useEffect(() => {
    if (pathname === "/dashboard" && status === "authenticated" && !user) {
      // Acabamos de llegar al dashboard después del login, forzar sync
      update();
    }
  }, [pathname, status, user, update]);

  // Sincronizar cuando la sesión cambia
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "authenticated" && session?.user) {
      const sessionUser = session.user;
      
      // Sincronizar si no hay usuario o si el ID cambió
      if (!user || user.id !== sessionUser.id) {
        console.log("[AuthSync] Syncing user:", sessionUser.email, "Role:", sessionUser.role);
        syncUser(sessionUser);
      }
    } else if (status === "unauthenticated" && user) {
      // Solo hacer logout si NO estamos en la página de registro o login
      if (!pathname.includes('/registro') && !pathname.includes('/login')) {
        console.log("[AuthSync] Logging out");
        logout();
      }
    }
  }, [session, status, user, syncUser, logout, pathname]);

  // Sincronización adicional: verificar cada segundo por 5 segundos después de montar
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (user && user.id === session.user.id) return;

    // Si estamos autenticados pero Zustand no tiene el usuario, reintentar
    const retrySync = () => {
      if (!user && session?.user) {
        console.log("[AuthSync] Retry sync...");
        syncUser(session.user);
      }
    };

    const timer1 = setTimeout(retrySync, 100);
    const timer2 = setTimeout(retrySync, 500);
    const timer3 = setTimeout(retrySync, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [status, session, user, syncUser]);

  return null;
}