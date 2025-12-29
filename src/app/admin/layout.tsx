// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Contenido principal (dejamos espacio al sidebar) */}
      <main className="ml-16 lg:ml-64 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
}
