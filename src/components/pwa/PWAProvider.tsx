// src/components/pwa/PWAProvider.tsx

'use client';

import { InstallPrompt } from './InstallPrompt';
import { NotificationPrompt } from './NotificationPrompt';
import { UpdatePrompt } from './UpdatePrompt';
import { OfflineIndicator } from './OfflineIndicator';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OfflineIndicator />
      <UpdatePrompt />
      <InstallPrompt />
      <NotificationPrompt />
    </>
  );
}