// src/components/auth/AuthSync.tsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";

export function AuthSync() {
  const { data: session, status } = useSession();
  const { login, logout, user } = useAuthStore();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      // Sincronizar NextAuth -> Zustand
      const sessionUser = session.user;
      
      // Solo actualizar si el usuario cambió
      if (!user || user.id !== sessionUser.id) {
        login({
          id: sessionUser.id || "",
          email: sessionUser.email || "",
          username: sessionUser.username || sessionUser.email?.split("@")[0] || "user",
          displayName: sessionUser.name || "Usuario",
          avatarUrl: sessionUser.image || "",
          prophetLevel: "monividente",
          reputationScore: 0,
          apCoins: sessionUser.apCoins || 1000,
          scenariosCreated: 0,
          scenariosWon: 0,
          winRate: 0,
          followers: 0,
          following: 0,
          createdAt: new Date(),
        });
      }
    } else if (status === "unauthenticated" && user) {
      // Si NextAuth dice que no está autenticado, limpiar Zustand
      logout();
    }
  }, [session, status, login, logout, user]);

  return null; // Este componente no renderiza nada
}