export const dynamic = 'force-dynamic';

// src/app/ayuda/como-funciona/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Lightbulb, Target, Users, Trophy, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo funciona la plataforma? | Centro de Ayuda | Apocaliptyx",
  description: "Entiende cómo funciona Apocaliptyx y el sistema de predicciones",
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
            <Lightbulb className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo funciona la plataforma?</h1>
          <p className="text-muted-foreground">Entiende el sistema de predicciones de Apocaliptyx</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <p className="text-foreground leading-relaxed text-lg">
              Apocaliptyx es una plataforma de <strong className="text-purple-400">predicciones sociales</strong> donde los usuarios crean escenarios sobre eventos futuros y compiten por demostrar quién puede &quot;ver el futuro&quot;.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">El ciclo de un escenario</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">1</div>
              <div className="bg-card/50 border border-border rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Creación</h3>
                <p className="text-sm text-muted-foreground">Un usuario crea un escenario con una pregunta sobre un evento futuro y define las opciones de respuesta.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">2</div>
              <div className="bg-card/50 border border-border rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Predicciones</h3>
                <p className="text-sm text-muted-foreground">Los usuarios apuestan AP Coins en la opción que creen que ocurrirá. Mientras más arriesgada la predicción, mayor la recompensa potencial.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">3</div>
              <div className="bg-card/50 border border-border rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Espera</h3>
                <p className="text-sm text-muted-foreground">El escenario permanece abierto hasta la fecha límite o hasta que ocurra el evento.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">4</div>
              <div className="bg-card/50 border border-border rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Resolución</h3>
                <p className="text-sm text-muted-foreground">Cuando el evento ocurre, se determina la opción ganadora y se distribuyen las recompensas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Pago</h3>
                <p className="text-sm text-muted-foreground">Los ganadores reciben sus AP Coins más las ganancias proporcionales del pool total.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Tipos de escenarios</h2>
          
          <div className="grid gap-4 mb-8">
            <div className="flex items-start gap-4 bg-card/50 border border-border rounded-lg p-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Deportes</h3>
                <p className="text-sm text-muted-foreground">¿Quién ganará el partido? ¿Cuántos goles habrá? Predicciones sobre eventos deportivos.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card/50 border border-border rounded-lg p-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Economía</h3>
                <p className="text-sm text-muted-foreground">¿Subirá o bajará el precio de X? Predicciones sobre mercados y finanzas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card/50 border border-border rounded-lg p-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Entretenimiento</h3>
                <p className="text-sm text-muted-foreground">¿Quién ganará el Oscar? ¿Cuánto recaudará la película? Predicciones de cultura pop.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card/50 border border-border rounded-lg p-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Política</h3>
                <p className="text-sm text-muted-foreground">¿Quién ganará las elecciones? Predicciones sobre eventos políticos mundiales.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Sistema de recompensas</h2>
          
          <p className="text-foreground mb-4">
            Las ganancias se calculan proporcionalmente:
          </p>

          <div className="bg-card rounded-lg p-6 mb-6">
            <p className="text-center text-lg">
              <span className="text-muted-foreground">Tu ganancia = </span>
              <span className="text-yellow-400">(Tu apuesta / Total apostado en opción ganadora)</span>
              <span className="text-muted-foreground"> × </span>
              <span className="text-green-400">Pool total</span>
            </p>
          </div>

          <p className="text-foreground mb-4">
            Esto significa que:
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-start gap-2 text-foreground">
              <span className="text-green-400">✓</span>
              <span>Si apuestas temprano a una opción impopular que luego gana, obtienes más ganancias.</span>
            </li>
            <li className="flex items-start gap-2 text-foreground">
              <span className="text-green-400">✓</span>
              <span>Si apuestas a la opción favorita, tus ganancias serán menores pero más seguras.</span>
            </li>
          </ul>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-yellow-400 mb-2">⚠️ Importante</h3>
            <p className="text-foreground">
              Apocaliptyx es una plataforma de <strong>entretenimiento</strong>. Los AP Coins no tienen valor monetario real y no se pueden convertir en dinero. Juega responsablemente.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/crear-escenario" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo crear un escenario?
            </Link>
            <Link href="/ayuda/participar-escenario" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo participar en escenarios?
            </Link>
            <Link href="/ayuda/resolucion-escenarios" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo se resuelven los escenarios?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}