'use client';

import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { ProfileAchievements } from '@/components/perfil';

export default function LogrosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </Link>

          <div className="flex items-center gap-2 text-yellow-300">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Logros</span>
          </div>
        </div>

        <ProfileAchievements />
      </div>
    </div>
  );
}
