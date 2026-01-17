// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "USER" | "STAFF" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
      apCoins: number;
      level: number;
      isVerified: boolean;
      isPremium: boolean;
      createdAt: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    role: "USER" | "STAFF" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
    apCoins: number;
    level: number;
    isVerified: boolean;
    isPremium: boolean;
    createdAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    role: "USER" | "STAFF" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
    apCoins: number;
    level: number;
    isVerified: boolean;
    isPremium: boolean;
    createdAt: string;
  }
}
