'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
  CounterAnimation,
} from '@/components/animations';
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
  Star,
  Crown,
  Swords,
  Activity,
  Clock,
  ChevronRight,
  Play,
  Rocket,
  Gift,
  Eye,
  MousePointer,
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

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    tecnologia: 'from-blue-500 to-cyan-500',
    politica: 'from-red-500 to-orange-500',
    deportes: 'from-green-500 to-emerald-500',
    farandula: 'from-pink-500 to-rose-500',
    guerra: 'from-orange-500 to-amber-500',
    economia: 'from-yellow-500 to-lime-500',
    salud: 'from-emerald-500 to-teal-500',
    otros: 'from-gray-500 to-slate-500',
  };
  return colors[category] || 'from-purple-500 to-pink-500';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
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
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <LandingNavbar />

      {/* HERO SECTION - Glassmorphism Style */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs - Responsive sizes */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 lg:w-[600px] lg:h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <FadeInView direction="up" delay={0.1}>
            <div className="max-w-5xl mx-auto text-center">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-zinc-300">
                  <span className="text-white font-semibold">{isLoading ? '...' : formatNumber(stats.totalUsers)}</span> profetas activos ahora
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight">
                <span className="text-white">Predice.</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Compite.
                </span>
                <br />
                <span className="text-white">Gana.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                El juego de predicciones donde tu vision del futuro vale oro.
                Crea escenarios, roba predicciones y conviertete en leyenda.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/registro">
                  <Button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                    <Rocket className="w-5 h-5 mr-2" />
                    Comenzar Gratis
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 backdrop-blur-sm text-white hover:bg-zinc-800 px-8 py-6 text-lg rounded-xl">
                    <Play className="w-5 h-5 mr-2" />
                    Ver como funciona
                  </Button>
                </Link>
              </div>

              {/* Bonus Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <Gift className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-200">
                  <span className="font-bold text-yellow-400">1,000 AP Coins</span> gratis al registrarte
                </span>
              </div>
            </div>
          </FadeInView>

          {/* Floating Stats Cards */}
          <FadeInView direction="up" delay={0.3}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Profetas', value: stats.totalUsers, icon: Users, color: 'purple' },
                { label: 'Escenarios', value: stats.totalScenarios, icon: Target, color: 'pink' },
                { label: 'Cumplidos', value: stats.completedScenarios, icon: Trophy, color: 'yellow' },
                { label: 'Win Rate', value: stats.avgWinRate, icon: TrendingUp, color: 'green', suffix: '%' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group relative p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1"
                >
                  <stat.icon className={`w-5 h-5 mb-2 text-${stat.color}-400`} />
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {isLoading ? '...' : (
                      <CounterAnimation end={stat.value} duration={2} />
                    )}
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeInView>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <MousePointer className="w-6 h-6 text-zinc-600" />
        </div>
      </section>

      {/* HOW IT WORKS - Modern Cards */}
      <section id="como-funciona" className="py-24 relative">
        <div className="container mx-auto px-4">
          <FadeInView direction="up">
            <div className="text-center mb-16">
              <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Como funciona</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 mb-4">
                4 pasos para ganar
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Simple, adictivo y estrategico. Asi es Apocaliptyx.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Crea',
                desc: 'Crea un escenario sobre cualquier evento futuro. Cuesta solo 20 AP.',
                icon: Sparkles,
                color: 'from-purple-500 to-violet-600',
              },
              {
                step: '02',
                title: 'Compite',
                desc: 'Otros pueden robar tu prediccion pagando mas. La bolsa crece.',
                icon: Swords,
                color: 'from-pink-500 to-rose-600',
              },
              {
                step: '03',
                title: 'Protege',
                desc: 'Usa candados y escudos para defender tus mejores predicciones.',
                icon: Shield,
                color: 'from-orange-500 to-amber-600',
              },
              {
                step: '04',
                title: 'Gana',
                desc: 'Cuando se cumple, el ultimo dueno se lleva toda la bolsa.',
                icon: Trophy,
                color: 'from-yellow-500 to-orange-600',
              },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="group relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"
                       style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                  <div className="relative h-full p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group-hover:-translate-y-2">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${item.color} mb-4`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs text-zinc-600 font-mono mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="py-24 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <FadeInView direction="up">
            <div className="text-center mb-16">
              <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Caracteristicas</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2">
                Todo lo que necesitas
              </h2>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* Large Card */}
            <FadeInView direction="up" delay={0.1} className="md:col-span-2 md:row-span-2">
              <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                <div className="relative z-10">
                  <Crown className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Sistema de Niveles</h3>
                  <p className="text-zinc-400 mb-6 max-w-md">
                    Evoluciona desde Monividente hasta Nostradamus Supremo. Cada nivel desbloquea nuevas habilidades y prestigio.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {['Monividente', 'Oraculo', 'Vidente', 'Nostradamus'].map((level, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${
                        i === 0 ? 'bg-zinc-700 text-zinc-300' :
                        i === 1 ? 'bg-blue-500/20 text-blue-400' :
                        i === 2 ? 'bg-purple-500/20 text-purple-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInView>

            {/* Small Cards */}
            <FadeInView direction="up" delay={0.2}>
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors h-full">
                <Lock className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-bold mb-2">Items Estrategicos</h3>
                <p className="text-sm text-zinc-400">Candados, escudos y relojes para dominar el juego.</p>
              </div>
            </FadeInView>

            <FadeInView direction="up" delay={0.3}>
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors h-full">
                <Activity className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-bold mb-2">Tiempo Real</h3>
                <p className="text-sm text-zinc-400">Ve robos y predicciones cumplirse en vivo.</p>
              </div>
            </FadeInView>

            <FadeInView direction="up" delay={0.4}>
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-bold mb-2">7 Categorias</h3>
                <p className="text-sm text-zinc-400">Tecnologia, deportes, politica y mas.</p>
              </div>
            </FadeInView>

            <FadeInView direction="up" delay={0.5}>
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <Users className="w-8 h-8 text-pink-400 mb-3" />
                <h3 className="font-bold mb-2">Red Social</h3>
                <p className="text-sm text-zinc-400">Sigue profetas, comenta y compite.</p>
              </div>
            </FadeInView>

            <FadeInView direction="up" delay={0.6}>
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <Eye className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="font-bold mb-2">Leaderboard</h3>
                <p className="text-sm text-zinc-400">Compite por ser el #1 global.</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* LIVE DATA SECTION */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Top Prophets */}
            <FadeInView direction="left">
              <div className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Top Profetas</h3>
                    <p className="text-sm text-zinc-500">Los mejores de la plataforma</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center text-zinc-500">Cargando...</div>
                  ) : topProphets.length > 0 ? (
                    <div className="divide-y divide-zinc-800">
                      {topProphets.slice(0, 5).map((prophet, i) => (
                        <div key={prophet.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            i === 0 ? 'bg-yellow-500 text-black' :
                            i === 1 ? 'bg-zinc-400 text-black' :
                            i === 2 ? 'bg-orange-600 text-white' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden flex-shrink-0">
                            {prophet.avatarUrl ? (
                              <Image src={prophet.avatarUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {prophet.displayName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{prophet.displayName}</div>
                            <div className="text-xs text-zinc-500">@{prophet.username}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-400">{formatNumber(prophet.apCoins)}</div>
                            <div className="text-xs text-zinc-500">AP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500">Se el primero</div>
                  )}
                  <Link href="/leaderboard" className="flex items-center justify-center gap-2 p-4 bg-zinc-800/50 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium">
                    Ver leaderboard completo <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeInView>

            {/* Recent Activity */}
            <FadeInView direction="right">
              <div className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Actividad Reciente</h3>
                    <p className="text-sm text-zinc-500">Lo ultimo en la plataforma</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center text-zinc-500">Cargando...</div>
                  ) : recentActivity.length > 0 ? (
                    <div className="divide-y divide-zinc-800">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor(activity.category)} flex items-center justify-center flex-shrink-0`}>
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm">{activity.title}</div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <span className="capitalize">{activity.category}</span>
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
                    <div className="p-8 text-center text-zinc-500">Sin actividad</div>
                  )}
                  <Link href="/explorar" className="flex items-center justify-center gap-2 p-4 bg-zinc-800/50 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium">
                    Explorar escenarios <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <FadeInView direction="up">
            <div className="text-center mb-16">
              <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Testimonios</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2">
                Lo que dicen los profetas
              </h2>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { text: "Apocaliptyx es adictivo. La mecanica de robo le da un giro unico a las predicciones.", author: "Luis M.", level: "Nostradamus" },
              { text: "Como chess pero con predicciones. Estrategia pura y recompensas reales.", author: "Fadil P.", level: "Vidente" },
              { text: "Perfecto para gamers que les gustan las noticias. Lo juego todos los dias.", author: "Leo G.", level: "Oraculo" },
            ].map((t, i) => (
              <StaggerItem key={i}>
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-zinc-300 italic flex-1 mb-4">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600" />
                    <div>
                      <div className="font-medium text-sm">{t.author}</div>
                      <div className="text-xs text-zinc-500">{t.level}</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeInView direction="up">
            <div className="max-w-4xl mx-auto relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 rounded-3xl blur-3xl" />

              <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 text-center overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                  }} />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6">
                    <Skull className="w-10 h-10 text-white" />
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                    Listo para predecir?
                  </h2>

                  <p className="text-zinc-400 max-w-lg mx-auto mb-8">
                    Unete a la comunidad de profetas y demuestra que puedes ver el futuro.
                  </p>

                  <Link href="/registro">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-6 text-lg font-bold rounded-xl hover:scale-105 transition-transform">
                      <Flame className="w-5 h-5 mr-2" />
                      Empezar ahora - Es gratis
                    </Button>
                  </Link>

                  <p className="text-xs text-zinc-600 mt-6">
                    Sin tarjeta • 1,000 AP Coins gratis • Cancela cuando quieras
                  </p>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
