// src/lib/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para autenticación
const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error("Supabase env vars missing");
    return null;
  }
  
  return createClient(url, key);
};

// Cliente admin de Supabase (para verificar contraseñas)
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error("Supabase admin env vars missing");
    return null;
  }
  
  return createClient(url, key);
};

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Normalizar email a minúsculas para consistencia
        const normalizedEmail = profile.email?.toLowerCase().trim() || '';

        // Usar cliente admin para bypasear RLS policies
        const supabase = getSupabaseAdmin();
        if (!supabase) {
          return {
            id: profile.sub,
            name: profile.name,
            email: normalizedEmail,
            image: profile.picture,
            username: normalizedEmail.split("@")[0] || `user_${profile.sub.slice(-6)}`,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
            createdAt: new Date().toISOString(),
          };
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .ilike("email", normalizedEmail)
          .single();

        if (existingUser) {
          // Normalizar rol a mayúsculas para consistencia
          const normalizedRole = (existingUser.role || 'USER').toUpperCase();
          console.log('[Google OAuth] User found:', existingUser.email, 'Role:', normalizedRole);

          return {
            id: existingUser.id,
            name: existingUser.display_name,
            email: existingUser.email,
            image: existingUser.avatar_url,
            username: existingUser.username,
            role: normalizedRole,
            apCoins: existingUser.ap_coins,
            level: existingUser.level,
            isVerified: existingUser.is_verified,
            isPremium: existingUser.is_premium,
            createdAt: existingUser.created_at,
          };
        }

        const username = normalizedEmail.split("@")[0] || `user_${profile.sub.slice(-6)}`;
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: normalizedEmail,
            username: username,
            display_name: profile.name,
            avatar_url: profile.picture,
            role: "USER",
            ap_coins: 1000,
            level: 1,
            experience: 0,
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
            email: normalizedEmail,
            image: profile.picture,
            username: username,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
            createdAt: new Date().toISOString(),
          };
        }

        return {
          id: newUser.id,
          name: newUser.display_name,
          email: normalizedEmail,
          image: newUser.avatar_url,
          username: newUser.username,
          role: newUser.role,
          apCoins: newUser.ap_coins,
          level: newUser.level,
          isVerified: newUser.is_verified,
          isPremium: newUser.is_premium,
          createdAt: newUser.created_at,
        };
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      async profile(profile) {
        // Normalizar email a minúsculas para consistencia
        const normalizedEmail = profile.email?.toLowerCase().trim() || '';

        // Usar cliente admin para bypasear RLS policies
        const supabase = getSupabaseAdmin();
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null;

        if (!supabase) {
          return {
            id: profile.id,
            name: profile.global_name || profile.username,
            email: normalizedEmail,
            image: avatarUrl,
            username: profile.username || `discord_${profile.id.slice(-6)}`,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
            createdAt: new Date().toISOString(),
          };
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .ilike("email", normalizedEmail)
          .single();

        if (existingUser) {
          // Normalizar rol a mayúsculas para consistencia
          const normalizedRole = (existingUser.role || 'USER').toUpperCase();
          console.log('[Discord OAuth] User found:', existingUser.email, 'Role:', normalizedRole);

          return {
            id: existingUser.id,
            name: existingUser.display_name,
            email: existingUser.email,
            image: existingUser.avatar_url,
            username: existingUser.username,
            role: normalizedRole,
            apCoins: existingUser.ap_coins,
            level: existingUser.level,
            isVerified: existingUser.is_verified,
            isPremium: existingUser.is_premium,
            createdAt: existingUser.created_at,
          };
        }

        const username = profile.username || `discord_${profile.id.slice(-6)}`;
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: normalizedEmail,
            username: username,
            display_name: profile.global_name || profile.username,
            avatar_url: avatarUrl,
            role: "USER",
            ap_coins: 1000,
            level: 1,
            experience: 0,
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
            email: normalizedEmail,
            image: avatarUrl,
            username: username,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
            createdAt: new Date().toISOString(),
          };
        }

        return {
          id: newUser.id,
          name: newUser.display_name,
          email: normalizedEmail,
          image: newUser.avatar_url,
          username: newUser.username,
          role: newUser.role,
          apCoins: newUser.ap_coins,
          level: newUser.level,
          isVerified: newUser.is_verified,
          isPremium: newUser.is_premium,
          createdAt: newUser.created_at,
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

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const supabase = getSupabase();
        if (!supabase) {
          return null;
        }

        // Autenticar con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !authData.user) {
          return null;
        }

        // Obtener datos del usuario de nuestra tabla users
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (userError || !user) {
          // Si no existe el perfil, crearlo
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: authData.user.id,
              email: email,
              username: email.split("@")[0],
              display_name: authData.user.user_metadata?.display_name || email.split("@")[0],
              avatar_url: null,
              role: "USER",
              ap_coins: 1000,
              level: 1,
              experience: 0,
              is_verified: false,
              is_premium: false,
              is_banned: false,
              total_predictions: 0,
              correct_predictions: 0,
              total_earnings: 0,
            })
            .select()
            .single();

          if (createError || !newUser) {
            return null;
          }

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.display_name,
            image: newUser.avatar_url,
            username: newUser.username,
            role: newUser.role,
            apCoins: newUser.ap_coins,
            level: newUser.level,
            isVerified: newUser.is_verified,
            isPremium: newUser.is_premium,
            createdAt: newUser.created_at,
          };
        }

        if (user.is_banned) {
          return null;
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
          createdAt: user.created_at,
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
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;