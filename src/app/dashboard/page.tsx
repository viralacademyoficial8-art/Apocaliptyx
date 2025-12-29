'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/lib/stores';
import { formatDate } from '@/lib/utils';
import { scenariosService } from '@/services';
import { 
  Flame, Trophy, ShoppingBag, ArrowRight, TrendingUp, 
  Users, Clock, Loader2, AlertCircle 
} from 'lucide-react';

// Importamos las animaciones
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from '@/components/animations';

// Tipo para escenarios
interface ScenarioData {
  id: string;
  title: string;
  description: string;
  category: string;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  participant_count: number;
  resolution_date: string;
  is_featured: boolean;
  is_hot: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  // Estados para datos de Supabase
  const [featuredScenarios, setFeaturedScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar escenarios destacados de Supabase
  useEffect(() => {
    async function loadScenarios() {
      try {
        setLoading(true);
        const scenarios = await scenariosService.getFeatured();
        setFeaturedScenarios(scenarios);
        setError(null);
      } catch (err) {
        console.error('Error loading scenarios:', err);
        setError('Error al cargar escenarios');
      } finally {
        setLoading(false);
      }
    }

    loadScenarios();
  }, []);

  // Fallback si NO hay usuario cargado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-4">Bienvenido a Apocaliptics</h1>
          <p className="text-gray-400 mb-6">
            Todavía no hay un profeta activo en esta sesión. Más adelante aquí
            podrás ver tu resumen personal (nivel, escenarios, monedas, etc.).
          </p>
          
          {/* Mostrar escenarios aunque no esté logueado */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">🔥 Escenarios Destacados</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 py-4">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : featuredScenarios.length === 0 ? (
              <p className="text-gray-500">No hay escenarios destacados aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/login')}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium transition-colors"
          >
            Iniciar Sesión
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ✅ Usuario autenticado
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* HEADER */}
        <FadeInView direction="up" delay={0.05}>
          <section>
            <p className="text-xs text-zinc-400">Bienvenido de nuevo,</p>
            <h1 className="text-2xl font-bold text-zinc-50">
              {user.displayName || user.username}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              En Apocaliptics desde {formatDate(user.createdAt)}
            </p>
          </section>
        </FadeInView>

        {/* CARDS RESUMEN */}
        <FadeInView direction="up" delay={0.12}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StaggerItem>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-xs text-zinc-400">AP Coins</p>
                  <p className="text-xl font-bold">
                    {user.apCoins?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-zinc-400">Escenarios ganados</p>
                  <p className="text-xl font-bold">{user.scenariosWon || 0}</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-xs text-zinc-400">Escenarios creados</p>
                  <p className="text-xl font-bold">{user.scenariosCreated || 0}</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </FadeInView>

        {/* ESCENARIOS DESTACADOS - DATOS REALES DE SUPABASE */}
        <FadeInView direction="up" delay={0.18}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Escenarios Destacados
              </h2>
              <button 
                onClick={() => router.push('/explorar')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-400">Cargando escenarios...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 py-4 bg-red-500/10 rounded-lg px-4">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : featuredScenarios.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-gray-500 mb-4">No hay escenarios destacados aún.</p>
                <button
                  onClick={() => router.push('/crear')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium"
                >
                  Crear el primero
                </button>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredScenarios.map((scenario) => (
                  <StaggerItem key={scenario.id}>
                    <ScenarioCard scenario={scenario} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </section>
        </FadeInView>

        {/* CTAs */}
        <FadeInView direction="up" delay={0.25}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StaggerItem>
              <button
                onClick={() => router.push('/tienda')}
                className="w-full rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-left hover:bg-purple-500/20 transition-colors"
              >
                <h2 className="text-lg font-semibold mb-1">Ir a la Tienda</h2>
                <p className="text-xs text-zinc-300">
                  Compra ítems para proteger, robar o potenciar tus escenarios.
                </p>
              </button>
            </StaggerItem>

            <StaggerItem>
              <button
                onClick={() => router.push('/leaderboard')}
                className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left hover:bg-yellow-500/20 transition-colors"
              >
                <h2 className="text-lg font-semibold mb-1">Ver Leaderboard</h2>
                <p className="text-xs text-zinc-300">
                  Revisa en qué posición vas entre todos los profetas.
                </p>
              </button>
            </StaggerItem>
          </StaggerContainer>
        </FadeInView>
      </main>
    </div>
  );
}

// Componente de tarjeta de escenario
function ScenarioCard({ scenario }: { scenario: ScenarioData }) {
  const router = useRouter();
  const yesPercent = scenario.total_pool > 0 
    ? Math.round((scenario.yes_pool / scenario.total_pool) * 100) 
    : 50;
  const noPercent = 100 - yesPercent;

  const daysLeft = Math.ceil(
    (new Date(scenario.resolution_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div 
      onClick={() => router.push(`/escenarios/${scenario.id}`)}
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-purple-500/50 hover:bg-zinc-900 transition-all cursor-pointer group"
    >
      {/* Category & Hot badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
          {scenario.category}
        </span>
        {scenario.is_hot && (
          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full flex items-center gap-1">
            🔥 Hot
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
        {scenario.title}
      </h3>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">Sí {yesPercent}%</span>
          <span className="text-red-400">No {noPercent}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500 transition-all"
            style={{ width: `${yesPercent}%` }}
          />
          <div 
            className="bg-red-500 transition-all"
            style={{ width: `${noPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-yellow-500" />
          <span>{scenario.total_pool.toLocaleString()} AP</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{scenario.participant_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{daysLeft > 0 ? `${daysLeft}d` : 'Cerrado'}</span>
        </div>
      </div>
    </div>
  );
}