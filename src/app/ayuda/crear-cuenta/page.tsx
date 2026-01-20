export const dynamic = 'force-dynamic';

// src/app/ayuda/crear-cuenta/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, UserPlus, Mail, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo crear una cuenta? | Centro de Ayuda | Apocaliptyx",
  description: "Aprende a crear tu cuenta en Apocaliptyx paso a paso",
};

export default function CrearCuentaPage() {
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-4">
            <UserPlus className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo crear una cuenta?</h1>
          <p className="text-gray-400">Guía paso a paso para registrarte en Apocaliptyx</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              Crear una cuenta en Apocaliptyx es gratis y solo toma unos minutos. Una vez registrado, recibirás <strong className="text-yellow-400">1,000 AP Coins</strong> de bienvenida para comenzar a predecir.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso 1: Ir a la página de registro</h2>
          <p className="text-gray-300 mb-4">
            Haz clic en el botón <strong>&quot;Registrarse&quot;</strong> en la esquina superior derecha de la página, o ve directamente a:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <code className="text-purple-400">https://apocaliptyx.vercel.app/registro</code>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso 2: Elegir método de registro</h2>
          <p className="text-gray-300 mb-4">Puedes registrarte de dos formas:</p>
          
          <div className="grid gap-4 mb-6">
            <div className="flex items-start gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Con Email</h3>
                <p className="text-sm text-gray-400">Ingresa tu email, crea una contraseña y elige un nombre de usuario único.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Con Google o Discord</h3>
                <p className="text-sm text-gray-400">Más rápido. Solo haz clic en el botón correspondiente y autoriza la conexión.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso 3: Completar tu perfil</h2>
          <p className="text-gray-300 mb-4">
            Si te registras con email, necesitarás proporcionar:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><strong>Email:</strong> Tu correo electrónico (se usará para notificaciones)</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><strong>Usuario:</strong> Nombre único que te identificará (3-20 caracteres)</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><strong>Contraseña:</strong> Mínimo 8 caracteres</span>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso 4: Verificar tu email</h2>
          <p className="text-gray-300 mb-4">
            Recibirás un email de verificación. Haz clic en el enlace para activar tu cuenta completamente.
          </p>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-green-400 mb-2">🎉 ¡Listo!</h3>
            <p className="text-gray-300">
              Una vez verificado, recibirás tus <strong className="text-yellow-400">1,000 AP Coins</strong> de bienvenida y podrás comenzar a explorar escenarios, hacer predicciones y competir con otros profetas.
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">¿Necesitas más ayuda?</h3>
            <p className="text-gray-400 mb-4">Si tienes problemas para crear tu cuenta, contáctanos:</p>
            <Link href="mailto:contacto@apocaliptyx.com" className="text-purple-400 hover:text-purple-300">
              contacto@apocaliptyx.com
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/ap-coins" className="text-gray-400 hover:text-white transition-colors">
              → ¿Qué son los AP Coins?
            </Link>
            <Link href="/ayuda/como-funciona" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo funciona la plataforma?
            </Link>
            <Link href="/ayuda/guia-inicio" className="text-gray-400 hover:text-white transition-colors">
              → Guía de inicio rápido
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}