// src/components/auth/AuthSync.tsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";

export function AuthSync() {
  const { data: session, status } = useSession();
  const { login, logout, user } = useAuthStore();

  // Debug log
  useEffect(() => {
    console.log("[AuthSync] Status:", status);
    console.log("[AuthSync] Session:", session);
    console.log("[AuthSync] Zustand User:", user);
  }, [session, status, user]);

  useEffect(() => {
    if (status === "loading") {
      console.log("[AuthSync] Loading...");
      return;
    }

    if (status === "authenticated" && session?.user) {
      console.log("[AuthSync] Authenticated! Syncing to Zustand...");
      const sessionUser = session.user;
      
      // Solo actualizar si el usuario cambió
      if (!user || user.id !== sessionUser.id) {
        console.log("[AuthSync] Calling login() with:", sessionUser);
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
        console.log("[AuthSync] Login called!");
      } else {
        console.log("[AuthSync] User already synced, skipping...");
      }
    } else if (status === "unauthenticated") {
      console.log("[AuthSync] Unauthenticated");
      if (user) {
        console.log("[AuthSync] Clearing Zustand user...");
        logout();
      }
    }
  }, [session, status, login, logout, user]);

  return null;
}