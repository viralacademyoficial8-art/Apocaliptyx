// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWAProvider } from '@/components/pwa';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Apocaliptics - Predice el Futuro',
  description: 'Plataforma gamificada de predicciones con AP Coins',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Apocaliptics',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Apocaliptics" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionProvider>
          <LanguageProvider>
            <PWAProvider>
              {children}
            </PWAProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}