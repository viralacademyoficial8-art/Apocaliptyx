export const dynamic = 'force-dynamic';

// src/app/ayuda/mensajes-privados/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Mail, Image, Smile, Ban } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo enviar mensajes privados? | Centro de Ayuda | Apocaliptyx",
  description: "Guía para usar el chat privado",
};

export default function MensajesPrivadosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
            <Mail className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo enviar mensajes privados?</h1>
          <p className="text-gray-400">Guía para usar el chat privado</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Iniciar una conversación</h2>
          
          <ol className="space-y-3 mb-8">
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Ve al perfil del usuario que quieres contactar</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Haz clic en el botón &quot;Mensaje&quot;</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Escribe tu mensaje y envía</span>
            </li>
          </ol>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Funciones del chat</h2>
          
          <div className="grid gap-3 mb-8">
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Image className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Enviar imágenes y archivos</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Smile className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Usar emojis</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Ban className="w-5 h-5 text-red-400" />
              <span className="text-gray-300">Bloquear usuarios no deseados</span>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">Acceder a tus chats</h3>
            <p className="text-gray-400">
              Encuentra todas tus conversaciones en el icono de chat en la barra de navegación, o ve directamente a <Link href="/chat" className="text-purple-400">/chat</Link>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/usar-foro" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo usar el foro?
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