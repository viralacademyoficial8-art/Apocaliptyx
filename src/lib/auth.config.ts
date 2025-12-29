// src/lib/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";

// Mock de usuarios para desarrollo (después se conectará a DB)
const mockUsers = [
  {
    id: "1",
    email: "admin@apocaliptics.com",
    plainPassword: "admin123", // Password en texto plano para desarrollo
    username: "admin",
    name: "Administrador",
    role: "ADMIN" as const,
    apCoins: 999999,
    level: 99,
    isVerified: true,
    isPremium: true,
    image: null,
  },
  {
    id: "2",
    email: "user@test.com",
    plainPassword: "user123", // Password en texto plano para desarrollo
    username: "testuser",
    name: "Usuario Test",
    role: "USER" as const,
    apCoins: 1000,
    level: 1,
    isVerified: false,
    isPremium: false,
    image: null,
  },
];

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email?.split("@")[0] || `user_${profile.sub.slice(-6)}`,
          role: "USER",
          apCoins: 1000,
          level: 1,
          isVerified: profile.email_verified || false,
          isPremium: false,
        };
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          username: profile.username || `discord_${profile.id.slice(-6)}`,
          role: "USER",
          apCoins: 1000,
          level: 1,
          isVerified: profile.verified || false,
          isPremium: false,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Buscar usuario (mock - después será de DB)
        const user = mockUsers.find((u) => u.email === email);

        if (!user) {
          return null;
        }

        // Verificar password (comparación directa para desarrollo)
        // TODO: Cambiar a bcrypt.compare cuando se conecte a DB real
        const isValidPassword = password === user.plainPassword;

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          role: user.role,
          apCoins: user.apCoins,
          level: user.level,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfile = nextUrl.pathname.startsWith("/perfil");
      const isOnProtected = isOnDashboard || isOnAdmin || isOnProfile;

      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
  },
} satisfies NextAuthConfig;