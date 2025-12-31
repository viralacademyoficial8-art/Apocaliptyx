// src/components/providers/SessionProvider.tsx

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { AuthSync } from "../auth/AuthSync";

interface Props {
  children: React.ReactNode;
}

export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <AuthSync />
      {children}
    </NextAuthSessionProvider>
  );
}