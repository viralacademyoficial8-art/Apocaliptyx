// src/lib/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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

// Passwords de prueba (REMOVER EN PRODUCCIÓN FINAL)
const TEST_PASSWORDS: { [key: string]: string } = {
  "admin@apocaliptics.com": "admin123",
  "user@test.com": "user123",
};

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        const supabase = getSupabase();
        if (!supabase) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            username: profile.email?.split("@")[0] || `user_${profile.sub.slice(-6)}`,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
          };
        }

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
        const supabase = getSupabase();
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null;

        if (!supabase) {
          return {
            id: profile.id,
            name: profile.global_name || profile.username,
            email: profile.email,
            image: avatarUrl,
            username: profile.username || `discord_${profile.id.slice(-6)}`,
            role: "USER",
            apCoins: 1000,
            level: 1,
            isVerified: false,
            isPremium: false,
          };
        }

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
        console.log("=== AUTH ATTEMPT ===");
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        console.log("Email:", email);
        console.log("Password length:", password.length);

        // PASO 1: Verificar password de prueba PRIMERO
        const testPassword = TEST_PASSWORDS[email];
        if (testPassword && testPassword === password) {
          console.log("Test password match for:", email);
          
          const supabase = getSupabase();
          if (supabase) {
            const { data: user } = await supabase
              .from("users")
              .select("*")
              .eq("email", email)
              .single();

            if (user && !user.is_banned) {
              console.log("Login successful (test password) for:", email);
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
            }
          }
        }

        // PASO 2: Si no es password de prueba, verificar con bcrypt
        const supabase = getSupabase();
        if (!supabase) {
          console.log("Supabase not available");
          return null;
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error || !user) {
          console.log("User not found:", email);
          return null;
        }

        if (user.is_banned) {
          console.log("User is banned:", email);
          return null;
        }

        const { data: authData } = await supabase
          .from("user_auth")
          .select("password_hash")
          .eq("user_id", user.id)
          .single();

        if (authData?.password_hash) {
          try {
            const isValid = await bcrypt.compare(password, authData.password_hash);
            if (isValid) {
              console.log("Login successful (bcrypt) for:", email);
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
            }
          } catch (e) {
            console.log("bcrypt error:", e);
          }
        }

        console.log("Invalid password for:", email);
        return null;
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