export const dynamic = 'force-dynamic';

// src/app/ayuda/cambiar-password/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Lock, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cambiar contraseña | Centro de Ayuda | Apocaliptyx",
  description: "Cómo cambiar tu contraseña de Apocaliptyx",
};

export default function CambiarPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Cambiar contraseña</h1>
          <p className="text-gray-400">Mantén tu cuenta segura</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso a paso</h2>
          
          <ol className="space-y-3 mb-8">
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Ve a Configuración &gt; Seguridad</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Haz clic en &quot;Cambiar contraseña&quot;</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Ingresa tu contraseña actual</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Ingresa y confirma tu nueva contraseña</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <span>Guarda los cambios</span>
            </li>
          </ol>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="font-bold text-white">Consejos de seguridad</h3>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Usa al menos 8 caracteres</li>
              <li>• Combina letras, números y símbolos</li>
              <li>• No uses la misma contraseña en otros sitios</li>
              <li>• Cambia tu contraseña regularmente</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">¿Olvidaste tu contraseña?</h3>
                <p className="text-gray-300">
                  Usa la opción &quot;¿Olvidaste tu contraseña?&quot; en la página de login para recuperar el acceso a tu cuenta.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/verificar-cuenta" className="text-gray-400 hover:text-white transition-colors">
              → Verificar mi cuenta
            </Link>
            <Link href="/ayuda/recuperar-cuenta" className="text-gray-400 hover:text-white transition-colors">
              → Recuperar acceso a mi cuenta
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}