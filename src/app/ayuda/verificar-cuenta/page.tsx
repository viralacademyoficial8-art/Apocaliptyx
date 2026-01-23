export const dynamic = 'force-dynamic';

// src/app/ayuda/verificar-cuenta/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, CheckCircle, Mail, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Verificar mi cuenta | Centro de Ayuda | Apocaliptyx",
  description: "Cómo verificar tu cuenta de Apocaliptyx",
};

export default function VerificarCuentaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verificar mi cuenta</h1>
          <p className="text-muted-foreground">Activa todas las funciones de tu cuenta</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Por qué verificar?</h2>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 bg-card/50 border border-border rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-foreground">Acceso completo a todas las funciones</span>
            </div>
            <div className="flex items-center gap-3 bg-card/50 border border-border rounded-lg p-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-foreground">Mayor seguridad para tu cuenta</span>
            </div>
            <div className="flex items-center gap-3 bg-card/50 border border-border rounded-lg p-4">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="text-foreground">Recibir notificaciones importantes</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Cómo verificar</h2>
          
          <ol className="space-y-2 mb-8 text-foreground">
            <li>1. Revisa tu bandeja de entrada (y spam)</li>
            <li>2. Busca el email de verificación de Apocaliptyx</li>
            <li>3. Haz clic en el enlace de verificación</li>
            <li>4. ¡Listo! Tu cuenta está verificada</li>
          </ol>

          <div className="bg-card/50 border border-border rounded-xl p-6 mt-8">
            <h3 className="font-bold text-foreground mb-2">¿No recibiste el email?</h3>
            <p className="text-muted-foreground">
              Ve a Configuración &gt; Cuenta y haz clic en &quot;Reenviar email de verificación&quot;. Si sigue sin llegar, contacta a soporte.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/cambiar-password" className="text-muted-foreground hover:text-foreground transition-colors">
              → Cambiar contraseña
            </Link>
            <Link href="/ayuda/personalizar-perfil" className="text-muted-foreground hover:text-foreground transition-colors">
              → Personalizar mi perfil
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}