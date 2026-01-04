// src/app/ayuda/leaderboard/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Trophy, TrendingUp, Medal, Crown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo funciona el leaderboard? | Centro de Ayuda | Apocaliptyx",
  description: "Entiende el sistema de ranking de Apocaliptyx",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo funciona el leaderboard?</h1>
          <p className="text-gray-400">El sistema de clasificación de profetas</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              El leaderboard clasifica a los mejores profetas según su rendimiento en predicciones. ¡Compite por llegar al top!
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Cómo se calcula el ranking?</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Precisión</h3>
                <p className="text-sm text-gray-400">Porcentaje de predicciones acertadas</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Medal className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Ganancias totales</h3>
                <p className="text-sm text-gray-400">AP Coins ganados en escenarios</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Crown className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Nivel y XP</h3>
                <p className="text-sm text-gray-400">Tu nivel general en la plataforma</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Tipos de leaderboard</h2>
          
          <div className="grid gap-3 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-white">🏆 Global</h3>
              <p className="text-sm text-gray-400">Todos los usuarios de todos los tiempos</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-white">📅 Semanal</h3>
              <p className="text-sm text-gray-400">Los mejores de la semana actual</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-white">📊 Por categoría</h3>
              <p className="text-sm text-gray-400">Los mejores en Deportes, Economía, etc.</p>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mt-8 text-center">
            <h3 className="font-bold text-purple-400 mb-2">¿Listo para competir?</h3>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors mt-2"
            >
              <Trophy className="w-5 h-5" />
              Ver Leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/niveles-xp" className="text-gray-400 hover:text-white transition-colors">
              → Sistema de niveles y XP
            </Link>
            <Link href="/ayuda/insignias" className="text-gray-400 hover:text-white transition-colors">
              → Insignias y logros
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}