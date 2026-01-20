export const dynamic = 'force-dynamic';

// src/app/ayuda/crear-escenario/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, PlusCircle, FileText, Calendar, CheckSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo crear un escenario? | Centro de Ayuda | Apocaliptyx",
  description: "Aprende a crear escenarios de predicción en Apocaliptyx",
};

export default function CrearEscenarioPage() {
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
            <PlusCircle className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo crear un escenario?</h1>
          <p className="text-gray-400">Guía completa para crear predicciones</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              Los escenarios son predicciones sobre eventos futuros. Tú defines la pregunta, las opciones y la fecha límite. Otros usuarios apuestan en la opción que creen correcta.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Requisitos para crear escenarios</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-gray-300">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span>Tener una cuenta verificada</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span>Mínimo nivel 2 (o cuenta premium)</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span>Tener suficientes AP Coins para el depósito inicial (si aplica)</span>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso a paso</h2>

          <div className="space-y-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">1. Define tu escenario</h3>
              </div>
              <ul className="space-y-2 text-gray-300 ml-12">
                <li><strong>Título:</strong> Pregunta clara y concisa (máx. 100 caracteres)</li>
                <li><strong>Descripción:</strong> Contexto y detalles del evento</li>
                <li><strong>Categoría:</strong> Deportes, Economía, Entretenimiento, etc.</li>
                <li><strong>Imagen:</strong> Opcional, pero recomendada</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">2. Configura las opciones</h3>
              </div>
              <ul className="space-y-2 text-gray-300 ml-12">
                <li>Mínimo 2 opciones, máximo 10</li>
                <li>Las opciones deben ser mutuamente excluyentes</li>
                <li>Una sola opción puede ser la correcta</li>
                <li>Evita opciones ambiguas</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">3. Establece fechas</h3>
              </div>
              <ul className="space-y-2 text-gray-300 ml-12">
                <li><strong>Fecha de cierre:</strong> Cuándo se dejan de aceptar predicciones</li>
                <li><strong>Fecha de resolución:</strong> Cuándo se conocerá el resultado</li>
                <li>La resolución debe ser después del cierre</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Ejemplos de buenos escenarios</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-medium mb-2">✓ Buen escenario</p>
              <p className="text-gray-300">&quot;¿Quién ganará el Super Bowl 2026?&quot;</p>
              <p className="text-sm text-gray-500 mt-1">Claro, verificable, con fecha definida</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-medium mb-2">✗ Mal escenario</p>
              <p className="text-gray-300">&quot;¿Será un buen año para el fútbol?&quot;</p>
              <p className="text-sm text-gray-500 mt-1">Subjetivo, no verificable objetivamente</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Reglas importantes</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• No crear escenarios sobre eventos ya ocurridos</li>
                  <li>• No crear escenarios duplicados</li>
                  <li>• El resultado debe ser públicamente verificable</li>
                  <li>• No se permiten escenarios sobre temas ilegales o dañinos</li>
                  <li>• Los escenarios pueden ser rechazados por moderadores</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8 text-center">
            <h3 className="font-bold text-white mb-2">¿Listo para crear?</h3>
            <p className="text-gray-400 mb-4">Crea tu primer escenario y deja que la comunidad prediga.</p>
            <Link
              href="/crear"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Crear Escenario
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/participar-escenario" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo participar en escenarios?
            </Link>
            <Link href="/ayuda/resolucion-escenarios" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo se resuelven los escenarios?
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