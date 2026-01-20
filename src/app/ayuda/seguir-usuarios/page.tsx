export const dynamic = 'force-dynamic';

// src/app/ayuda/seguir-usuarios/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, UserPlus, Bell, Eye } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Seguir a otros usuarios | Centro de Ayuda | Apocaliptyx",
  description: "Cómo seguir a otros profetas en Apocaliptyx",
};

export default function SeguirUsuariosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <UserPlus className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Seguir a otros usuarios</h1>
          <p className="text-gray-400">Conecta con otros profetas</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Por qué seguir usuarios?</h2>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Ve sus predicciones y escenarios en tu feed</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Recibe notificaciones de sus nuevas predicciones</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <UserPlus className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Construye tu red de profetas confiables</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Cómo seguir a alguien</h2>
          
          <ol className="space-y-2 mb-8 text-gray-300">
            <li>1. Busca el usuario o encuéntralo en el leaderboard</li>
            <li>2. Ve a su perfil</li>
            <li>3. Haz clic en el botón &quot;Seguir&quot;</li>
          </ol>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">Ver a quién sigues</h3>
            <p className="text-gray-400">
              En tu perfil puedes ver la lista de usuarios que sigues y tus seguidores.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/mensajes-privados" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo enviar mensajes privados?
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