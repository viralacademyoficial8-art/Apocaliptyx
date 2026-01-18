'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Swords,
  Trophy,
  Users,
  Coins,
  Calendar,
  Target,
  Loader2,
  Crown,
  Flame,
  TrendingUp,
  ChevronRight,
  Skull,
  Zap,
} from 'lucide-react';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StolenScenario {
  id: string;
  stolen_at: string;
  steal_price: number;
  scenario: {
    id: string;
    title: string;
    description?: string;
    category: string;
    total_pool: number;
    participant_count: number;
    yes_pool?: number;
    no_pool?: number;
    status?: string;
  } | null;
  victim: {
    username: string;
    avatar_url?: string;
  } | null;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  level: number;
}

export default function EscenariosRobadosPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stolenScenarios, setStolenScenarios] = useState<StolenScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStolen: 0,
    totalValue: 0,
    uniqueVictims: 0,
    biggestHeist: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener perfil del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, level')
        .eq('username', username)
        .single();

      if (!userData) {
        router.push('/404');
        return;
      }

      setProfile(userData);

      // Obtener escenarios robados
      const { data: steals } = await supabase
        .from('scenario_steal_history')
        .select(`
          id,
          stolen_at,
          price_paid,
          scenario:scenarios (
            id,
            title,
            description,
            category,
            total_pool,
            participant_count,
            yes_pool,
            no_pool,
            status
          ),
          victim:users!scenario_steal_history_victim_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('thief_id', userData.id)
        .order('stolen_at', { ascending: false });

      // Transform data - Supabase returns arrays for joined relations
      const scenarios = (steals || []).map((steal: unknown) => {
        const s = steal as {
          id: string;
          stolen_at: string;
          price_paid: number;
          scenario: Array<StolenScenario['scenario']> | StolenScenario['scenario'];
          victim: Array<StolenScenario['victim']> | StolenScenario['victim'];
        };
        return {
          id: s.id,
          stolen_at: s.stolen_at,
          steal_price: s.price_paid,
          scenario: Array.isArray(s.scenario) ? s.scenario[0] : s.scenario,
          victim: Array.isArray(s.victim) ? s.victim[0] : s.victim,
        } as StolenScenario;
      });
      setStolenScenarios(scenarios);

      // Calcular estadísticas
      const uniqueVictims = new Set(scenarios.map(s => s.victim?.username).filter(Boolean));
      setStats({
        totalStolen: scenarios.length,
        totalValue: scenarios.reduce((sum, s) => sum + (s.steal_price || 0), 0),
        uniqueVictims: uniqueVictims.size,
        biggestHeist: Math.max(...scenarios.map(s => s.steal_price || 0), 0),
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [username, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-950 to-purple-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {/* Back Button */}
          <Link
            href={`/perfil/${username}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil de @{username}
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Swords className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border-2 border-red-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Escenarios Robados
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{profile.username?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                Historial de conquistas de <span className="text-red-400 font-semibold">@{profile.username}</span>
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-sm text-gray-400">Total Robados</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalStolen}</p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500/60 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-sm text-gray-400">Valor Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalValue.toLocaleString()} <span className="text-lg text-yellow-400">AP</span></p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/60 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-gray-400">Victimas</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.uniqueVictims}</p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/60 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm text-gray-400">Mayor Golpe</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.biggestHeist.toLocaleString()} <span className="text-lg text-orange-400">AP</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {stolenScenarios.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Skull className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sin conquistas aún</h3>
            <p className="text-gray-400 mb-6">@{profile.username} no ha robado ningún escenario todavía</p>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
            >
              <Target className="w-4 h-4" />
              Explorar escenarios
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Historial de Robos
              </h2>
              <span className="text-sm text-gray-400">{stolenScenarios.length} escenarios</span>
            </div>

            {stolenScenarios.map((steal, index) => (
              <Link
                key={steal.id}
                href={`/escenario/${steal.scenario?.id}`}
                className="block group"
              >
                <div className="relative bg-gray-900/80 border border-gray-800 rounded-xl p-5 hover:border-red-500/50 transition-all overflow-hidden">
                  {/* Ranking Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">
                    #{index + 1}
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                    {/* Scenario Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          {steal.scenario?.category || 'Sin categoría'}
                        </span>
                        {steal.scenario?.status === 'active' && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Activo
                          </span>
                        )}
                        {steal.scenario?.status === 'resolved' && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            Resuelto
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                        {steal.scenario?.title || 'Escenario eliminado'}
                      </h3>

                      {steal.scenario?.description && (
                        <p className="text-sm text-gray-400 line-clamp-1 mb-3">
                          {steal.scenario.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(steal.stolen_at), { addSuffix: true, locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {steal.scenario?.participant_count || 0} participantes
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          Pool: {steal.scenario?.total_pool?.toLocaleString() || 0} AP
                        </span>
                      </div>
                    </div>

                    {/* Right side - Price and Victim */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-800 md:pl-6">
                      {/* Steal Price */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Precio de robo</p>
                        <p className="text-xl font-bold text-red-400">{steal.steal_price?.toLocaleString() || 0} AP</p>
                      </div>

                      {/* Victim */}
                      {steal.victim && (
                        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                          <Skull className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-400">
                            Robado a <span className="text-white">@{steal.victim.username}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
