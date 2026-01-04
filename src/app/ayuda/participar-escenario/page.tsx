// src/app/ayuda/participar-escenario/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Target, Coins, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo participar en escenarios? | Centro de Ayuda | Apocaliptyx",
  description: "Aprende a hacer predicciones y apostar en escenarios",
};

export default function ParticiparEscenarioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo participar en escenarios?</h1>
          <p className="text-gray-400">Guía para hacer predicciones y apostar</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              Participar en un escenario significa apostar AP Coins en la opción que crees que será la correcta. Si aciertas, ganas una parte proporcional del pool total.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso a paso</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Encuentra un escenario</h3>
                <p className="text-sm text-gray-400">Navega por el dashboard o usa el buscador para encontrar escenarios que te interesen.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Lee los detalles</h3>
                <p className="text-sm text-gray-400">Revisa la descripción, las opciones disponibles, la fecha de cierre y las probabilidades actuales.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Elige tu opción</h3>
                <p className="text-sm text-gray-400">Selecciona la opción que crees que será la correcta.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">4</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Decide tu apuesta</h3>
                <p className="text-sm text-gray-400">Ingresa la cantidad de AP Coins que quieres apostar. Verás las ganancias potenciales.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">5</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Confirma</h3>
                <p className="text-sm text-gray-400">Revisa tu predicción y confirma. ¡Los AP Coins se deducirán de tu cuenta!</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Entendiendo las probabilidades</h2>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-white">¿Cómo se calculan las ganancias?</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Las ganancias dependen de cuánto apostaste en relación al total apostado en la opción ganadora:
            </p>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-lg">
                <span className="text-yellow-400">Tu ganancia</span>
                <span className="text-gray-400"> = </span>
                <span className="text-blue-400">(Tu apuesta / Total en opción ganadora)</span>
                <span className="text-gray-400"> × </span>
                <span className="text-green-400">Pool total</span>
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Ejemplo práctico</h2>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <p className="text-gray-300 mb-4">
              <strong>Escenario:</strong> ¿Quién ganará el partido?
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-400">Equipo A</p>
                <p className="text-yellow-400 font-bold">8,000 AP apostados</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-400">Equipo B</p>
                <p className="text-yellow-400 font-bold">2,000 AP apostados</p>
              </div>
            </div>
            <p className="text-gray-300 mb-2">
              <strong>Pool total:</strong> 10,000 AP
            </p>
            <p className="text-gray-300 mb-4">
              Si apuestas <strong className="text-yellow-400">500 AP</strong> al Equipo B y gana:
            </p>
            <p className="text-green-400 font-bold">
              Tu ganancia = (500 / 2,500) × 10,000 = 2,000 AP 🎉
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (Ganaste 1,500 AP netos: 2,000 - 500 apostados)
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Cosas a tener en cuenta</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Las predicciones no se pueden cancelar una vez confirmadas</li>
                  <li>• Puedes hacer múltiples predicciones en el mismo escenario</li>
                  <li>• Las probabilidades cambian a medida que más usuarios participan</li>
                  <li>• Si el escenario se cancela, recuperas tus AP Coins</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-purple-400 mb-2">💡 Estrategias</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Apuesta temprano:</strong> Las probabilidades suelen ser mejores al inicio</li>
              <li>• <strong>Diversifica:</strong> No pongas todos tus AP Coins en un solo escenario</li>
              <li>• <strong>Investiga:</strong> Lee sobre el evento antes de apostar</li>
              <li>• <strong>Gestiona riesgos:</strong> Apuesta más en opciones seguras, menos en arriesgadas</li>
            </ul>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/crear-escenario" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo crear un escenario?
            </Link>
            <Link href="/ayuda/resolucion-escenarios" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo se resuelven los escenarios?
            </Link>
            <Link href="/ayuda/ap-coins" className="text-gray-400 hover:text-white transition-colors">
              → ¿Qué son los AP Coins?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}