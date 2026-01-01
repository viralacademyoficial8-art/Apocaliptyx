// src/lib/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para autenticación
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Buscar o crear usuario en Supabase
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", profile.email)
          .single();

        if (existingUser) {
          return {
            id: existingUser.id,
            name: existingUser.display_name,
            email: existingUser.email,
            image: existingUser.avatar_url,
            username: existingUser.username,
            role: existingUser.role,
            apCoins: existingUser.ap_coins,
            level: existingUser.level,
            isVerified: existingUser.is_verified,
            isPremium: existingUser.is_premium,
          };
        }

        // Crear nuevo usuario
        const username = profile.email?.split("@")[0] || `user_${profile.sub.slice(-6)}`;
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: profile.email,
            username: username,
            display_name: profile.name,
            avatar_url: profile.picture,
            role: "USER",
            ap_coins: 1000,
            level: 1,
            xp: 0,
            is_verified: profile.email_verified || false,
            is_premium: false,
            is_banned: false,
            total_predictions: 0,
            correct_predictions: 0,
            total_earnings: 0,
          } as never)
          .select()
          .single();

        if (error || !newUser) {
          console.error("Error creating user:", error);
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            username: username,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
          };
        }

        return {
          id: newUser.id,
          name: newUser.display_name,
          email: newUser.email,
          image: newUser.avatar_url,
          username: newUser.username,
          role: newUser.role,
          apCoins: newUser.ap_coins,
          level: newUser.level,
          isVerified: newUser.is_verified,
          isPremium: newUser.is_premium,
        };
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      async profile(profile) {
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null;

        // Buscar o crear usuario en Supabase
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", profile.email)
          .single();

        if (existingUser) {
          return {
            id: existingUser.id,
            name: existingUser.display_name,
            email: existingUser.email,
            image: existingUser.avatar_url,
            username: existingUser.username,
            role: existingUser.role,
            apCoins: existingUser.ap_coins,
            level: existingUser.level,
            isVerified: existingUser.is_verified,
            isPremium: existingUser.is_premium,
          };
        }

        // Crear nuevo usuario
        const username = profile.username || `discord_${profile.id.slice(-6)}`;
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: profile.email,
            username: username,
            display_name: profile.global_name || profile.username,
            avatar_url: avatarUrl,
            role: "USER",
            ap_coins: 1000,
            level: 1,
            xp: 0,
            is_verified: profile.verified || false,
            is_premium: false,
            is_banned: false,
            total_predictions: 0,
            correct_predictions: 0,
            total_earnings: 0,
          } as never)
          .select()
          .single();

        if (error || !newUser) {
          console.error("Error creating user:", error);
          return {
            id: profile.id,
            name: profile.global_name || profile.username,
            email: profile.email,
            image: avatarUrl,
            username: username,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
          };
        }

        return {
          id: newUser.id,
          name: newUser.display_name,
          email: newUser.email,
          image: newUser.avatar_url,
          username: newUser.username,
          role: newUser.role,
          apCoins: newUser.ap_coins,
          level: newUser.level,
          isVerified: newUser.is_verified,
          isPremium: newUser.is_premium,
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

        // Buscar usuario en Supabase
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error || !user) {
          console.log("User not found:", email);
          return null;
        }

        // Verificar si el usuario está baneado
        if (user.is_banned) {
          console.log("User is banned:", email);
          return null;
        }

        // Verificar password
        // Nota: Necesitas agregar una columna 'password_hash' a la tabla users
        // Por ahora, permitimos login para usuarios existentes con password temporal
        const { data: authData } = await supabase
          .from("user_auth")
          .select("password_hash")
          .eq("user_id", user.id)
          .single();

        if (authData?.password_hash) {
          const isValidPassword = await bcrypt.compare(password, authData.password_hash);
          if (!isValidPassword) {
            console.log("Invalid password for:", email);
            return null;
          }
        } else {
          // Fallback para desarrollo: permitir passwords de prueba
          // ELIMINAR EN PRODUCCIÓN
          const testPasswords: Record<string, string> = {
            "admin@apocaliptics.com": "admin123",
            "user@test.com": "user123",
          };
          
          if (testPasswords[email] !== password) {
            console.log("Invalid test password for:", email);
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          image: user.avatar_url,
          username: user.username,
          role: user.role,
          apCoins: user.ap_coins,
          level: user.level,
          isVerified: user.is_verified,
          isPremium: user.is_premium,
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