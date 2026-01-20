// src/app/ayuda/guia-inicio/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Rocket, UserPlus, Search, Target, Trophy, Settings } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Guía de inicio rápido | Centro de Ayuda | Apocaliptyx",
  description: "Aprende a usar Apocaliptyx en 5 minutos",
};

export default function GuiaInicioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <Rocket className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Guía de inicio rápido</h1>
          <p className="text-gray-400">Aprende a usar Apocaliptyx en 5 minutos</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              ¡Bienvenido a Apocaliptyx! Esta guía te llevará paso a paso desde crear tu cuenta hasta hacer tu primera predicción.
            </p>
          </div>

          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-purple-400 font-medium">Paso 1</span>
                <h2 className="text-xl font-bold text-white">Crea tu cuenta</h2>
              </div>
            </div>
            <div className="ml-16 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ol className="space-y-2 text-gray-300">
                <li>1. Ve a <Link href="/registro" className="text-purple-400 hover:text-purple-300">/registro</Link></li>
                <li>2. Elige registrarte con email, Google o Discord</li>
                <li>3. Completa tu información</li>
                <li>4. ¡Recibe tus <strong className="text-yellow-400">1,000 AP Coins</strong> de bienvenida!</li>
              </ol>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-blue-400 font-medium">Paso 2</span>
                <h2 className="text-xl font-bold text-white">Explora los escenarios</h2>
              </div>
            </div>
            <div className="ml-16 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ol className="space-y-2 text-gray-300">
                <li>1. Ve al <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">Dashboard</Link></li>
                <li>2. Navega por las categorías: Deportes, Economía, Entretenimiento, etc.</li>
                <li>3. Usa los filtros para encontrar escenarios que te interesen</li>
                <li>4. Lee los detalles de cada escenario antes de participar</li>
              </ol>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <span className="text-sm text-yellow-400 font-medium">Paso 3</span>
                <h2 className="text-xl font-bold text-white">Haz tu primera predicción</h2>
              </div>
            </div>
            <div className="ml-16 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ol className="space-y-2 text-gray-300">
                <li>1. Selecciona un escenario que te interese</li>
                <li>2. Elige la opción que crees que ocurrirá</li>
                <li>3. Decide cuántos AP Coins quieres apostar</li>
                <li>4. Confirma tu predicción</li>
                <li>5. ¡Espera el resultado!</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  💡 <strong>Consejo:</strong> Empieza con apuestas pequeñas (50-100 AP) mientras aprendes.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-orange-400 font-medium">Paso 4</span>
                <h2 className="text-xl font-bold text-white">Gana y sube en el ranking</h2>
              </div>
            </div>
            <div className="ml-16 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ul className="space-y-2 text-gray-300">
                <li>🏆 Cuando aciertas, ganas AP Coins proporcionales al pool</li>
                <li>📈 Cada predicción correcta suma puntos a tu perfil</li>
                <li>⭐ Sube de nivel y desbloquea insignias</li>
                <li>🥇 Compite en el <Link href="/leaderboard" className="text-purple-400 hover:text-purple-300">Leaderboard</Link></li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-pink-400 font-medium">Paso 5</span>
                <h2 className="text-xl font-bold text-white">Personaliza tu experiencia</h2>
              </div>
            </div>
            <div className="ml-16 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ul className="space-y-2 text-gray-300">
                <li>👤 Personaliza tu perfil con avatar y biografía</li>
                <li>🔔 Configura tus notificaciones</li>
                <li>👥 Sigue a otros profetas</li>
                <li>💬 Participa en el <Link href="/foro" className="text-purple-400 hover:text-purple-300">Foro</Link></li>
                <li>🛒 Visita la <Link href="/tienda" className="text-purple-400 hover:text-purple-300">Tienda</Link> para ítems especiales</li>
              </ul>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-4">🎯 Consejos para empezar</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>No apuestes todo en un solo escenario - diversifica</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Inicia sesión diariamente para recibir bonos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Lee las reglas de cada escenario antes de participar</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Sigue a los mejores profetas para aprender de ellos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Participa en el foro para obtener insights</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mt-8 text-center">
            <h3 className="font-bold text-green-400 mb-2">🚀 ¡Estás listo!</h3>
            <p className="text-gray-300 mb-4">
              Ya tienes todo lo necesario para comenzar. ¡Demuestra que puedes ver el futuro!
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/ap-coins" className="text-gray-400 hover:text-white transition-colors">
              → ¿Qué son los AP Coins?
            </Link>
            <Link href="/ayuda/crear-escenario" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo crear un escenario?
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