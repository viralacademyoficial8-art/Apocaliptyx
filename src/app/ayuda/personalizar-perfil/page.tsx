// src/app/ayuda/personalizar-perfil/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, User, Camera, Edit, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Personalizar mi perfil | Centro de Ayuda | Apocaliptyx",
  description: "Cómo personalizar tu perfil de Apocaliptyx",
};

export default function PersonalizarPerfilPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-full mb-4">
            <User className="w-6 h-6 text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Personalizar mi perfil</h1>
          <p className="text-gray-400">Haz que tu perfil destaque</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Qué puedes personalizar</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Camera className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Avatar</h3>
                <p className="text-sm text-gray-400">Sube una imagen de perfil. Formatos: JPG, PNG. Máximo 5MB.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Edit className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Nombre para mostrar</h3>
                <p className="text-sm text-gray-400">Tu nombre visible para otros usuarios (diferente del username).</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <Globe className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Biografía</h3>
                <p className="text-sm text-gray-400">Cuéntale al mundo quién eres. Máximo 160 caracteres.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Cómo editar tu perfil</h2>
          
          <ol className="space-y-2 mb-8 text-gray-300">
            <li>1. Ve a tu perfil haciendo clic en tu avatar</li>
            <li>2. Haz clic en &quot;Editar perfil&quot;</li>
            <li>3. Modifica los campos que desees</li>
            <li>4. Guarda los cambios</li>
          </ol>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-purple-400 mb-2">💡 Consejo</h3>
            <p className="text-gray-300">
              Un perfil completo con avatar y biografía genera más confianza y es más probable que otros usuarios te sigan.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/seguir-usuarios" className="text-gray-400 hover:text-white transition-colors">
              → Seguir a otros usuarios
            </Link>
            <Link href="/ayuda/verificar-cuenta" className="text-gray-400 hover:text-white transition-colors">
              → Verificar mi cuenta
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}