'use client';

import Link from 'next/link';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Button } from '@/components/ui/button';
import {
  Skull,
  Zap,
  Trophy,
  Users,
  Lock,
  Target,
  TrendingUp,
  Shield,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Crown,
  Swords,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-red-950 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-24 lg:pt-32 lg:pb-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-6">
              <div className="bg-red-500/20 border border-red-500/30 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 justify-center">
                <Flame className="w-4 h-4 text-red-400" />
                <span>El juego de predicciones más adictivo</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Predice el Futuro.
              <br />
              <span className="text-red-500">Gana Prediciendo</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Crea escenarios sobre eventos futuros, róbalos de otros profetas,
              y gana cuando se cumplen. Conviértete en el próximo Nostradamus.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12">
              <Link href="/registro" className="w-full sm:w-auto">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold w-full">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Comenzar Gratis - 1,000 AP Coins
                </Button>
              </Link>
              <Link href="#como-funciona" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-white/60 bg-transparent text-white hover:bg-white/10 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full"
                >
                  Ver Cómo Funciona
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Gratis para empezar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>1,000 AP Coins de regalo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Apocaliptics */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                ¿Qué es Apocaliptics?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Un juego de estrategia donde tus predicciones valen oro
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-8 mb-12">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 sm:p-8">
                <Target className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Predice Eventos
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Crea escenarios sobre lo que crees que pasará: política,
                  tecnología, deportes, farándula. Si aciertas, ganas.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-500/30 rounded-xl p-6 sm:p-8">
                <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Roba &amp; Compite
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Roba escenarios de otros profetas pagando más. El precio sube
                  cada vez. El último dueño cuando se cumple el escenario se
                  lleva todo.
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6 sm:p-8">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Sube de Nivel
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Comienza como Monividente y escala hasta Nostradamus. Cada
                  victoria aumenta tu reputación y te acerca al top del
                  leaderboard.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 sm:p-8">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Estrategia Real
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Usa ítems especiales: candados para proteger, relojes para
                  robar gratis, escudos para recuperar. La estrategia es clave.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              4 pasos simples para empezar a ganar
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                <span className="text-2xl sm:text-3xl font-bold text-red-400">
                  1
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">
                Crea un Escenario
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                &quot;Bitcoin alcanza $200K&quot; o &quot;México gana el
                Mundial&quot;. Cuesta 20 AP Coins.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-500">
                <span className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  2
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">
                Otros lo Roban
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Si les gusta tu predicción, pagan para robártela. La bolsa
                crece con cada robo.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-500">
                <span className="text-2xl sm:text-3xl font-bold text-purple-400">
                  3
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">
                Protege o Roba
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Usa candados para proteger tus escenarios o roba los de otros
                profetas.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                <span className="text-2xl sm:text-3xl font-bold text-green-400">
                  4
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">Gana Todo</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cuando se cumple el escenario, el último dueño se lleva toda la
                bolsa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Características Principales
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Todo lo que necesitas para convertirte en el mejor profeta
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Categorías Variadas
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tecnología, política, deportes, farándula, economía, guerra,
                salud. Elige lo que más te guste.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Ítems Especiales
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Candados para proteger, relojes para robar gratis, escudos para
                recuperar. Estrategia es poder.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Leaderboard Global
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Compite por ser el #1. Rankings por reputación, win rate, AP
                Coins y escenarios ganados.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Red Social</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sigue a otros profetas, comparte escenarios, construye tu
                comunidad. Es más que un juego.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Niveles de Profeta
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Desde Monividente hasta Nostradamus. Cada nivel desbloquea
                beneficios y prestigio.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Notificaciones
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Te avisamos cuando te roban, cuando ganas, cuando alguien te
                sigue. Nunca pierdas el control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-500 mb-2">
                  1,234
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Profetas Activos
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
                  5,678
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Escenarios Creados
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 mb-2">
                  892
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Predicciones Cumplidas
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-500 mb-2">
                  95%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Win Rate Promedio
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Lo Que Dicen Nuestros Profetas
            </h2>
          </div>

          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <div className="bg-card/80 border border-border rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 italic flex-1">
                &quot;Al principio pensé que era otro juego más, pero
                Apocaliptics es adictivo. Llevo 3 meses y soy nivel Vidente.
                ¡Me encanta!&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Luis Nostradamus
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Profeta #1
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 italic flex-1">
                &quot;La mecánica de robo es genial. Es como chess pero con
                predicciones. Estrategia pura. 10/10.&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Fadil Prophet
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Profeta #2
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 italic flex-1">
                &quot;Perfecto para gamers que les gustan las noticias y la
                estrategia. Lo juego todos los días.&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Leo Gamer
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Oráculo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 sm:p-10 md:p-12 text-center text-white">
            <Skull className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para Predecir el Futuro?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-red-100">
              Únete a miles de profetas y conviértete en el próximo Nostradamus
            </p>
            <Link href="/registro">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 font-bold"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Comenzar Gratis - 1,000 AP Coins
              </Button>
            </Link>
            <p className="text-xs sm:text-sm text-red-200 mt-6">
              Sin tarjeta requerida • Gratis para siempre • 1,000 AP Coins de
              regalo
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
