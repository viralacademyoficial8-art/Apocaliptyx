// src/app/ayuda/recuperar-cuenta/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Key, Mail, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Recuperar acceso a mi cuenta | Centro de Ayuda | Apocaliptyx",
  description: "Cómo recuperar el acceso a tu cuenta",
};

export default function RecuperarCuentaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-4">
            <Key className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Recuperar acceso a mi cuenta</h1>
          <p className="text-gray-400">Opciones para recuperar tu cuenta</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Si olvidaste tu contraseña</h2>
          
          <ol className="space-y-2 mb-8 text-gray-300">
            <li>1. Ve a la página de login</li>
            <li>2. Haz clic en &quot;¿Olvidaste tu contraseña?&quot;</li>
            <li>3. Ingresa tu email registrado</li>
            <li>4. Revisa tu bandeja de entrada</li>
            <li>5. Sigue el enlace para crear una nueva contraseña</li>
          </ol>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Si no tienes acceso a tu email</h2>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300">
                  Si no puedes acceder al email asociado a tu cuenta, contacta a soporte con información que demuestre que eres el dueño de la cuenta (username, fecha de registro aproximada, etc.)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-white">Contactar soporte</h3>
            </div>
            <p className="text-gray-400">
              <a href="mailto:contacto@apocaliptyx.com" className="text-blue-400 hover:text-blue-300">
                contacto@apocaliptyx.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/cambiar-password" className="text-gray-400 hover:text-white transition-colors">
              → Cambiar contraseña
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