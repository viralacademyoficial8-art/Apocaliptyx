// src/app/ayuda/usar-foro/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, MessageSquare, ThumbsUp, Flag, Search } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo usar el foro? | Centro de Ayuda | Apocaliptyx",
  description: "Guía para participar en el foro de la comunidad",
};

export default function UsarForoPage() {
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
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo usar el foro?</h1>
          <p className="text-gray-400">Guía para participar en la comunidad</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              El foro es el lugar para discutir predicciones, compartir análisis y conectar con otros profetas.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Funciones principales</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Search className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Buscar temas</h3>
                <p className="text-sm text-gray-400">Usa el buscador para encontrar discusiones sobre escenarios específicos.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <MessageSquare className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Crear posts</h3>
                <p className="text-sm text-gray-400">Comparte tus análisis, preguntas o predicciones con la comunidad.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <ThumbsUp className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Votar y comentar</h3>
                <p className="text-sm text-gray-400">Da upvote a posts útiles y participa en las discusiones.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Flag className="w-5 h-5 text-red-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Reportar contenido</h3>
                <p className="text-sm text-gray-400">Si ves contenido inapropiado, repórtalo para que los moderadores lo revisen.</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-yellow-400 mb-2">Reglas del foro</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Sé respetuoso con otros usuarios</li>
              <li>• No spam ni autopromoción excesiva</li>
              <li>• No compartir información personal de otros</li>
              <li>• Mantén las discusiones relevantes</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/mensajes-privados" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo enviar mensajes privados?
            </Link>
            <Link href="/ayuda/seguir-usuarios" className="text-gray-400 hover:text-white transition-colors">
              → Seguir a otros usuarios
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}