// src/app/ayuda/insignias/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Award, Target, Flame, Crown, Star, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Insignias y logros | Centro de Ayuda | Apocaliptyx",
  description: "Descubre todas las insignias disponibles",
};

export default function InsigniasPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
            <Award className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Insignias y logros</h1>
          <p className="text-gray-400">Colecciona insignias y demuestra tu experiencia</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Insignias disponibles</h2>
          
          <div className="grid gap-4 mb-8">
            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Primera Predicción</h3>
                <p className="text-sm text-gray-400">Completa tu primera predicción</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Primer Acierto</h3>
                <p className="text-sm text-gray-400">Gana tu primera predicción</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Racha de 5</h3>
                <p className="text-sm text-gray-400">Acierta 5 predicciones seguidas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Top 10</h3>
                <p className="text-sm text-gray-400">Llega al top 10 del leaderboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Creador Estrella</h3>
                <p className="text-sm text-gray-400">Crea 10 escenarios populares</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">Ver tus insignias</h3>
            <p className="text-gray-400">
              Todas tus insignias aparecen en tu perfil público. ¡Colecciónalas todas!
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/niveles-xp" className="text-gray-400 hover:text-white transition-colors">
              → Sistema de niveles y XP
            </Link>
            <Link href="/ayuda/leaderboard" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo funciona el leaderboard?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}