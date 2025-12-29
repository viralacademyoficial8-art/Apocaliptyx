'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <Button variant="outline" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
        Continuar con Google
      </Button>
      <Button variant="outline" onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}>
        Continuar con Discord
      </Button>
      <Button variant="outline" onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
        Continuar con GitHub
      </Button>
    </div>
  );
}
