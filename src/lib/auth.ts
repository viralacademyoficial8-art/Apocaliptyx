// src/lib/auth.ts

import NextAuth from "next-auth";
import { createClient } from "@supabase/supabase-js";
import authConfig from "./auth.config";

// Cliente admin de Supabase para actualizar roles
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Cuando el usuario se loguea por primera vez
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.role = user.role;
        token.apCoins = user.apCoins;
        token.level = user.level;
        token.isVerified = user.isVerified;
        token.isPremium = user.isPremium;
        token.createdAt = user.createdAt;
        token.email = user.email;
        console.log('[JWT Callback] Initial login, role set to:', user.role);
      }

      // Actualizar token cuando se actualiza la sesión
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      // SIEMPRE actualizar el rol desde la BD para mantenerlo sincronizado
      // Esto se ejecuta en cada request donde se necesita la session
      if (token.email) {
        try {
          const supabase = getSupabaseAdmin();
          if (supabase) {
            const { data: dbUser } = await supabase
              .from('users')
              .select('role, ap_coins, username')
              .ilike('email', String(token.email).toLowerCase())
              .single();

            if (dbUser) {
              const normalizedRole = (dbUser.role || 'USER').toUpperCase();
              if (normalizedRole !== token.role) {
                console.log('[JWT Callback] Role updated from DB:', token.role, '->', normalizedRole);
              }
              token.role = normalizedRole;
              token.apCoins = dbUser.ap_coins;
              token.username = dbUser.username || token.username;
            }
          }
        } catch (error) {
          console.error('[JWT Callback] Error fetching role from DB:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.apCoins = token.apCoins;
        session.user.level = token.level;
        session.user.isVerified = token.isVerified;
        session.user.isPremium = token.isPremium;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
});