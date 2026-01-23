export const dynamic = 'force-dynamic';

// src/app/ayuda/coins-gratis/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Gift, Calendar, Trophy, Users, Star, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo obtener AP Coins gratis? | Centro de Ayuda | Apocaliptyx",
  description: "Todas las formas de conseguir AP Coins sin pagar",
};

export default function CoinsGratisPage() {
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
            <Gift className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo obtener AP Coins gratis?</h1>
          <p className="text-muted-foreground">Todas las formas de conseguir AP Coins sin pagar</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-8">
            <p className="text-foreground leading-relaxed text-lg">
              ¡No necesitas gastar dinero real para disfrutar Apocaliptyx! Hay muchas formas de ganar AP Coins gratis.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Bono de Bienvenida</h3>
                  <p className="text-yellow-400 font-semibold">+1,000 AP Coins</p>
                </div>
              </div>
              <p className="text-muted-foreground">Al crear tu cuenta, recibes automáticamente 1,000 AP Coins para empezar.</p>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Recompensa Diaria</h3>
                  <p className="text-blue-400 font-semibold">+50-500 AP Coins/día</p>
                </div>
              </div>
              <p className="text-muted-foreground">Inicia sesión cada día para reclamar tu recompensa. ¡La racha consecutiva aumenta el premio!</p>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Ganar Predicciones</h3>
                  <p className="text-purple-400 font-semibold">Variable</p>
                </div>
              </div>
              <p className="text-muted-foreground">Cuando aciertas un escenario, ganas AP Coins del pool. ¡Es la mejor forma de multiplicar tus coins!</p>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Logros y Misiones</h3>
                  <p className="text-orange-400 font-semibold">+100-1,000 AP Coins</p>
                </div>
              </div>
              <p className="text-muted-foreground">Completa logros (primera predicción, racha de aciertos, etc.) y misiones semanales para ganar recompensas.</p>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Referir Amigos</h3>
                  <p className="text-pink-400 font-semibold">+500 AP Coins/amigo</p>
                </div>
              </div>
              <p className="text-muted-foreground">Invita amigos con tu código de referido. Cuando se registren y hagan su primera predicción, ambos ganan.</p>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Eventos Especiales</h3>
                  <p className="text-cyan-400 font-semibold">Variable</p>
                </div>
              </div>
              <p className="text-muted-foreground">Durante eventos especiales y promociones, hay oportunidades extra de ganar AP Coins. ¡Mantente atento!</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-yellow-400 mb-2">💡 Consejo Pro</h3>
            <p className="text-foreground">
              La forma más efectiva de acumular AP Coins es combinar la recompensa diaria con predicciones inteligentes. ¡No apuestes todo en un solo escenario!
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/ap-coins" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Qué son los AP Coins?
            </Link>
            <Link href="/ayuda/comprar-coins" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo comprar AP Coins?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}