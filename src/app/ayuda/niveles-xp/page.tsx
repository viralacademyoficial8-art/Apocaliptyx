// src/app/ayuda/niveles-xp/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, TrendingUp, Star, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sistema de niveles y XP | Centro de Ayuda | Apocaliptyx",
  description: "Cómo funciona el sistema de experiencia",
};

export default function NivelesXPPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Sistema de niveles y XP</h1>
          <p className="text-gray-400">Progresa y desbloquea beneficios</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Cómo ganar XP?</h2>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Hacer una predicción</span>
              <span className="text-blue-400 font-bold">+10 XP</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Acertar predicción</span>
              <span className="text-green-400 font-bold">+50 XP</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Crear un escenario</span>
              <span className="text-purple-400 font-bold">+25 XP</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Publicar en el foro</span>
              <span className="text-yellow-400 font-bold">+5 XP</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Iniciar sesión diario</span>
              <span className="text-orange-400 font-bold">+15 XP</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Beneficios por nivel</h2>
          
          <div className="space-y-3 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-white">Nivel 1-5</span>
              </div>
              <p className="text-sm text-gray-400">Acceso básico a predicciones</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">Nivel 5-10</span>
              </div>
              <p className="text-sm text-gray-400">Puedes crear escenarios</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Nivel 10-20</span>
              </div>
              <p className="text-sm text-gray-400">Insignias exclusivas, mayor límite de apuestas</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Nivel 20+</span>
              </div>
              <p className="text-sm text-gray-400">Estado de &quot;Profeta Experto&quot;, acceso anticipado a features</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/leaderboard" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo funciona el leaderboard?
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