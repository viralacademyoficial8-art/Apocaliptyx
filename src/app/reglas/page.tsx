// src/app/reglas/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Reglas de la Comunidad | Apocaliptyx",
  description: "Normas y directrices de la comunidad Apocaliptyx",
};

export default function ReglasPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Reglas de la Comunidad</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Estas reglas existen para mantener Apocaliptyx como un espacio seguro, divertido y justo para todos.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-2">Nuestra filosofía</h2>
          <p className="text-gray-300">
            En Apocaliptyx creemos en la competencia justa, el respeto mutuo y la diversión. 
            Queremos que todos los profetas digitales tengan la mejor experiencia posible.
          </p>
        </div>

        <div className="space-y-8">
          {/* Comportamiento permitido */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">Lo que SÍ puedes hacer</h2>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Crear escenarios sobre eventos verificables (deportes, economía, entretenimiento, etc.)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Participar en discusiones respetuosas en el foro
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Compartir estrategias y consejos con otros usuarios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Reportar contenido o usuarios que violen las reglas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Personalizar tu perfil y expresar tu personalidad
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Competir de forma justa por el leaderboard
              </li>
            </ul>
          </section>

          {/* Comportamiento prohibido */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-red-400">Lo que NO puedes hacer</h2>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Crear escenarios sobre muerte, violencia o tragedias
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Publicar contenido ilegal, discriminatorio o de odio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Acosar, amenazar o intimidar a otros usuarios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Crear múltiples cuentas para manipular resultados
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Hacer spam, publicidad no autorizada o phishing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Compartir información personal de otros sin consentimiento
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Intentar hackear, explotar bugs o manipular el sistema
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Vender o intercambiar cuentas o AP Coins fuera de la plataforma
              </li>
            </ul>
          </section>

          {/* Escenarios */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reglas para escenarios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="font-bold text-green-400 mb-2">Escenarios permitidos</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Deportes y competencias</li>
                  <li>• Economía y finanzas</li>
                  <li>• Entretenimiento (premios, estrenos)</li>
                  <li>• Tecnología</li>
                  <li>• Elecciones y política (sin incitar odio)</li>
                  <li>• Clima y fenómenos naturales</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h3 className="font-bold text-red-400 mb-2">Escenarios prohibidos</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Muerte o enfermedad de personas</li>
                  <li>• Actos terroristas o violencia</li>
                  <li>• Contenido sexual o pornográfico</li>
                  <li>• Discriminación por raza, género, etc.</li>
                  <li>• Actividades ilegales</li>
                  <li>• Información personal de terceros</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Consecuencias */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-400">Consecuencias</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Las violaciones a estas reglas pueden resultar en:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <h3 className="font-bold text-yellow-400">Advertencia</h3>
                <p className="text-xs text-gray-500">Primera infracción menor</p>
              </div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
                <div className="text-2xl mb-2">🔇</div>
                <h3 className="font-bold text-orange-400">Silenciamiento</h3>
                <p className="text-xs text-gray-500">Restricción temporal</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                <div className="text-2xl mb-2">⏸️</div>
                <h3 className="font-bold text-red-400">Suspensión</h3>
                <p className="text-xs text-gray-500">1-30 días sin acceso</p>
              </div>
              <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg text-center">
                <div className="text-2xl mb-2">🚫</div>
                <h3 className="font-bold text-gray-400">Ban Permanente</h3>
                <p className="text-xs text-gray-500">Expulsión definitiva</p>
              </div>
            </div>
          </section>

          {/* Apelaciones */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Apelaciones</h2>
            <p className="text-gray-400 mb-4">
              Si crees que fuiste sancionado injustamente, puedes apelar contactando a nuestro equipo de moderación:
            </p>
            <a
              href="mailto:apelaciones@apocaliptyx.com"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              apelaciones@apocaliptyx.com
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Incluye tu nombre de usuario y una explicación detallada de la situación.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Estas reglas pueden actualizarse. Última revisión: Enero 2026</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}