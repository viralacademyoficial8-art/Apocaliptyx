// src/app/admin/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin';
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Contenido principal (dejamos espacio al sidebar) */}
        <main className="ml-16 lg:ml-64 min-h-screen bg-background">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}