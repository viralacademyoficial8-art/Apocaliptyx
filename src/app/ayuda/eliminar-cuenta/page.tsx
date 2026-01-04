// src/app/ayuda/eliminar-cuenta/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Trash2, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Eliminar mi cuenta | Centro de Ayuda | Apocaliptyx",
  description: "Cómo eliminar permanentemente tu cuenta",
};

export default function EliminarCuentaPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Eliminar mi cuenta</h1>
          <p className="text-gray-400">Eliminar permanentemente tu cuenta de Apocaliptyx</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-400 mb-2">⚠️ Esta acción es irreversible</h3>
                <p className="text-gray-300">
                  Al eliminar tu cuenta, perderás permanentemente todos tus AP Coins, historial de predicciones, insignias y datos asociados.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Lo que perderás</h2>
          
          <div className="space-y-3 mb-8">
            {[
              "Todos tus AP Coins (no reembolsables)",
              "Tu historial de predicciones",
              "Tus insignias y logros",
              "Tu posición en el leaderboard",
              "Tus mensajes y publicaciones del foro",
              "Tus seguidores y seguidos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Cómo eliminar tu cuenta</h2>
          
          <ol className="space-y-2 mb-8 text-gray-300">
            <li>1. Ve a Configuración &gt; Cuenta</li>
            <li>2. Baja hasta &quot;Zona de peligro&quot;</li>
            <li>3. Haz clic en &quot;Eliminar cuenta&quot;</li>
            <li>4. Confirma ingresando tu contraseña</li>
            <li>5. Confirma que entiendes las consecuencias</li>
          </ol>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-white mb-2">¿Solo quieres un descanso?</h3>
            <p className="text-gray-400">
              En lugar de eliminar tu cuenta, puedes simplemente cerrar sesión. Tu cuenta y AP Coins estarán aquí cuando vuelvas.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/cambiar-password" className="text-gray-400 hover:text-white transition-colors">
              → Cambiar contraseña
            </Link>
            <Link href="/politica-de-privacidad" className="text-gray-400 hover:text-white transition-colors">
              → Política de Privacidad
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}