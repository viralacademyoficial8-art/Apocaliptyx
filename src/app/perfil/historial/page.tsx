'use client';

export const dynamic = 'force-dynamic';


import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import { ProfileHistory } from '@/components/perfil';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function HistorialPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </Link>

          <div className="flex items-center gap-2 text-blue-300">
            <History className="w-5 h-5" />
            <span className="font-semibold">Historial</span>
          </div>
        </div>

        <ProfileHistory />
      </div>

      <Footer />
    </div>
  );
}
