// src/app/ayuda/resolucion-escenarios/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, CheckCircle, Clock, Users, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo se resuelven los escenarios? | Centro de Ayuda | Apocaliptyx",
  description: "Entiende el proceso de resolución de escenarios en Apocaliptyx",
};

export default function ResolucionEscenariosPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo se resuelven los escenarios?</h1>
          <p className="text-gray-400">El proceso de verificación y pago de resultados</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              Cuando un evento ocurre, el escenario pasa por un proceso de verificación para determinar la opción ganadora y distribuir las recompensas.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Proceso de resolución</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">1. Cierre de predicciones</h3>
                <p className="text-sm text-gray-400">Cuando llega la fecha de cierre, ya no se aceptan más predicciones. El pool queda bloqueado.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">2. Verificación del resultado</h3>
                <p className="text-sm text-gray-400">El creador del escenario o los moderadores verifican el resultado usando fuentes públicas confiables.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">3. Período de disputa (opcional)</h3>
                <p className="text-sm text-gray-400">En algunos casos, hay un período donde los usuarios pueden disputar el resultado si creen que es incorrecto.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">4. Distribución de ganancias</h3>
                <p className="text-sm text-gray-400">Las ganancias se distribuyen automáticamente a los ganadores según sus apuestas.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Estados de un escenario</h2>
          
          <div className="grid gap-3 mb-8">
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-medium">ACTIVO</span>
              <span className="text-gray-300">Acepta predicciones</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium">CERRADO</span>
              <span className="text-gray-300">No acepta más predicciones, esperando resultado</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">EN REVISIÓN</span>
              <span className="text-gray-300">Resultado en proceso de verificación</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">RESUELTO</span>
              <span className="text-gray-300">Resultado confirmado, ganancias distribuidas</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-medium">CANCELADO</span>
              <span className="text-gray-300">Escenario anulado, AP Coins devueltos</span>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">¿Qué pasa si hay disputa?</h3>
            <p className="text-gray-400">
              Si hay desacuerdo sobre el resultado, el equipo de moderación revisará las fuentes y tomará una decisión final. En casos extremos, el escenario puede ser cancelado y los AP Coins devueltos.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/participar-escenario" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo participar en escenarios?
            </Link>
            <Link href="/ayuda/reglas-escenarios" className="text-gray-400 hover:text-white transition-colors">
              → Reglas de los escenarios
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}