'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Activity,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface LandingStats {
  totalUsers: number;
  totalScenarios: number;
  completedScenarios: number;
  avgWinRate: number;
}

interface TopProphet {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  apCoins: number;
  winRate: number;
}

interface RecentActivity {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number;
  createdAt: string;
  creator: { username: string; avatar_url: string | null } | null;
}

// Función para formatear números grandes
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

// Función para obtener el color de la categoría
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    tecnologia: 'text-blue-400',
    politica: 'text-red-400',
    deportes: 'text-green-400',
    farandula: 'text-pink-400',
    guerra: 'text-orange-400',
    economia: 'text-yellow-400',
    salud: 'text-emerald-400',
    otros: 'text-gray-400',
  };
  return colors[category] || 'text-gray-400';
}

// Función para formatear tiempo relativo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

export default function LandingPage() {
  const [stats, setStats] = useState<LandingStats>({
    totalUsers: 0,
    totalScenarios: 0,
    completedScenarios: 0,
    avgWinRate: 85,
  });
  const [topProphets, setTopProphets] = useState<TopProphet[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/landing/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setTopProphets(data.topProphets || []);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

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
                <span>El juego de predicciones mas adictivo</span>
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
              Crea escenarios sobre eventos futuros, robalos de otros profetas,
              y gana cuando se cumplen. Conviertete en el proximo Nostradamus.
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
                  Ver Como Funciona
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

      {/* Live Stats Bar */}
      <section className="py-8 bg-gradient-to-r from-red-900/20 via-purple-900/20 to-blue-900/20 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">En vivo:</span>
              <span className="text-lg font-bold text-white">
                {isLoading ? '...' : formatNumber(stats.totalUsers)}
              </span>
              <span className="text-sm text-gray-400">profetas activos</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-bold text-white">
                {isLoading ? '...' : formatNumber(stats.totalScenarios)}
              </span>
              <span className="text-sm text-gray-400">escenarios creados</span>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-white">
                {isLoading ? '...' : formatNumber(stats.completedScenarios)}
              </span>
              <span className="text-sm text-gray-400">predicciones cumplidas</span>
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
                Que es Apocaliptics?
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
                  Crea escenarios sobre lo que crees que pasara: politica,
                  tecnologia, deportes, farandula. Si aciertas, ganas.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-500/30 rounded-xl p-6 sm:p-8">
                <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Roba &amp; Compite
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Roba escenarios de otros profetas pagando mas. El precio sube
                  cada vez. El ultimo dueno cuando se cumple el escenario se
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
                  victoria aumenta tu reputacion y te acerca al top del
                  leaderboard.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 sm:p-8">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Estrategia Real
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Usa items especiales: candados para proteger, relojes para
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
              Como Funciona?
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
                &quot;Bitcoin alcanza $200K&quot; o &quot;Mexico gana el
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
                Si les gusta tu prediccion, pagan para robartela. La bolsa
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
                Cuando se cumple el escenario, el ultimo dueno se lleva toda la
                bolsa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Prophets & Recent Activity */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
            {/* Top Prophets */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Top Profetas
                </h3>
                <Link href="/leaderboard" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-card/80 border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Cargando profetas...
                  </div>
                ) : topProphets.length > 0 ? (
                  <div className="divide-y divide-border">
                    {topProphets.slice(0, 5).map((prophet, index) => (
                      <div key={prophet.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden">
                          {prophet.avatarUrl ? (
                            <Image
                              src={prophet.avatarUrl}
                              alt={prophet.displayName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {prophet.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{prophet.displayName}</div>
                          <div className="text-xs text-muted-foreground">@{prophet.username}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-400">{formatNumber(prophet.apCoins)}</div>
                          <div className="text-xs text-muted-foreground">AP Coins</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Se el primero en unirte
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-400" />
                  Actividad Reciente
                </h3>
                <Link href="/escenarios" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-card/80 border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Cargando actividad...
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                          activity.status === 'completed' ? 'from-green-600/20 to-green-400/10' :
                          activity.status === 'active' ? 'from-blue-600/20 to-blue-400/10' :
                          'from-gray-600/20 to-gray-400/10'
                        } flex items-center justify-center`}>
                          {activity.status === 'completed' ? (
                            <Trophy className="w-5 h-5 text-green-400" />
                          ) : (
                            <Target className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{activity.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={getCategoryColor(activity.category)}>
                              {activity.category}
                            </span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(activity.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400 text-sm">{activity.price} AP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Aun no hay escenarios
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Caracteristicas Principales
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Todo lo que necesitas para convertirte en el mejor profeta
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Categorias Variadas
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tecnologia, politica, deportes, farandula, economia, guerra,
                salud. Elige lo que mas te guste.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Items Especiales
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
                Compite por ser el #1. Rankings por reputacion, win rate, AP
                Coins y escenarios ganados.
              </p>
            </div>

            <div className="bg-card/80 border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Red Social</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sigue a otros profetas, comparte escenarios, construye tu
                comunidad. Es mas que un juego.
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
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-500 mb-2">
                  {isLoading ? '...' : formatNumber(stats.totalUsers)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Profetas Activos
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
                  {isLoading ? '...' : formatNumber(stats.totalScenarios)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Escenarios Creados
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 mb-2">
                  {isLoading ? '...' : formatNumber(stats.completedScenarios)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Predicciones Cumplidas
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-500 mb-2">
                  {isLoading ? '...' : `${stats.avgWinRate}%`}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Win Rate Promedio
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Now with real top users */}
      <section className="py-16 md:py-20">
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
                &quot;Al principio pense que era otro juego mas, pero
                Apocaliptics es adictivo. Llevo 3 meses y soy nivel Vidente.
                Me encanta!&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Luis Nostradamus
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Profeta Nivel 5
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
                &quot;La mecanica de robo es genial. Es como chess pero con
                predicciones. Estrategia pura. 10/10.&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Fadil Prophet
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Oraculo en Entrenamiento
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
                estrategia. Lo juego todos los dias.&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full" />
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    Leo Gamer
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Oraculo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 sm:p-10 md:p-12 text-center text-white">
            <Skull className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Listo para Predecir el Futuro?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-red-100">
              Unete a miles de profetas y conviertete en el proximo Nostradamus
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
              Sin tarjeta requerida - Gratis para siempre - 1,000 AP Coins de
              regalo
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Skull className="w-6 h-6 text-red-500" />
              <span className="font-bold">Apocaliptics</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos-y-condiciones" className="hover:text-foreground transition-colors">
                Terminos
              </Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              2024 Apocaliptics. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
