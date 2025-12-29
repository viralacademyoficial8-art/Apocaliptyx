// src/lib/auth.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";

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
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.role = user.role;
        token.apCoins = user.apCoins;
        token.level = user.level;
        token.isVerified = user.isVerified;
        token.isPremium = user.isPremium;
      }

      // Actualizar token cuando se actualiza la sesión
      if (trigger === "update" && session) {
        token = { ...token, ...session };
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
      }
      return session;
    },
  },
});