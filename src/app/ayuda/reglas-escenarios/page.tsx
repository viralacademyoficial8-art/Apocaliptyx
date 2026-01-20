export const dynamic = 'force-dynamic';

// src/app/ayuda/reglas-escenarios/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, BookOpen, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Reglas de los escenarios | Centro de Ayuda | Apocaliptyx",
  description: "Reglas y políticas para escenarios en Apocaliptyx",
};

export default function ReglasEscenariosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
            <BookOpen className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reglas de los escenarios</h1>
          <p className="text-gray-400">Políticas y normas de la comunidad</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Escenarios permitidos</h2>
          
          <div className="space-y-3 mb-8">
            {[
              "Eventos deportivos verificables",
              "Resultados de elecciones oficiales",
              "Premios y ceremonias (Oscar, Grammy, etc.)",
              "Lanzamientos de productos confirmados",
              "Récords y estadísticas verificables",
              "Eventos del clima (con fuentes oficiales)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Escenarios prohibidos</h2>
          
          <div className="space-y-3 mb-8">
            {[
              "Predicciones sobre muerte o daño a personas",
              "Contenido ilegal o que promueva actividades ilegales",
              "Eventos que no sean públicamente verificables",
              "Escenarios subjetivos sin criterio objetivo",
              "Contenido discriminatorio u ofensivo",
              "Manipulación de mercados o información privilegiada",
              "Duplicados de escenarios existentes",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Consecuencias por violar las reglas</h2>
          
          <ul className="space-y-2 mb-8">
            <li className="text-gray-300">• <strong>Primera infracción:</strong> Advertencia y eliminación del escenario</li>
            <li className="text-gray-300">• <strong>Segunda infracción:</strong> Suspensión temporal de crear escenarios</li>
            <li className="text-gray-300">• <strong>Infracciones graves:</strong> Suspensión o ban permanente de la cuenta</li>
          </ul>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">¿Crees que un escenario viola las reglas?</h3>
            <p className="text-gray-400 mb-4">
              Usa el botón de &quot;Reportar&quot; en la página del escenario para notificar a los moderadores.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/crear-escenario" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo crear un escenario?
            </Link>
            <Link href="/ayuda/resolucion-escenarios" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo se resuelven los escenarios?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}