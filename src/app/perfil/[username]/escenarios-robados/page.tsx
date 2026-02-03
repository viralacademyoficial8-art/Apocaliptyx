'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSupabaseBrowser } from '@/lib/supabase-client';
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
  ChevronDown,
  ChevronUp,
  Skull,
  Zap,
  ExternalLink,
  TrendingUp,
  Eye,
  User,
} from 'lucide-react';

// Supabase client

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

// Accordion Item Component
function AccordionItem({
  steal,
  index,
  isExpanded,
  onToggle,
  isBiggestHeist,
  totalVictims,
  totalValue,
}: {
  steal: StolenScenario;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isBiggestHeist: boolean;
  totalVictims: number;
  totalValue: number;
}) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tecnologia: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      deportes: 'bg-green-500/20 text-green-400 border-green-500/30',
      politica: 'bg-red-500/20 text-red-400 border-red-500/30',
      entretenimiento: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      economia: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ciencia: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      gaming: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      cripto: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[category?.toLowerCase()] || 'bg-gray-500/20 text-muted-foreground border-gray-500/30';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1 border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Activo
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
            Resuelto
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-muted-foreground rounded-full text-xs font-medium border border-gray-500/30">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card/80 border border-border rounded-xl overflow-hidden hover:border-border transition-all">
      {/* Collapsed Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
          <span className="text-sm font-bold text-red-400">#{index + 1}</span>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(steal.scenario?.category || '')}`}>
              {steal.scenario?.category || 'Sin categoría'}
            </span>
            {getStatusBadge(steal.scenario?.status)}
          </div>
          <h3 className="font-semibold text-foreground truncate">
            {steal.scenario?.title || 'Escenario eliminado'}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(steal.stolen_at), { addSuffix: true, locale: es })}
          </p>
        </div>

        {/* Price Badge */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Precio</p>
          <p className="text-lg font-bold text-red-400">{steal.steal_price?.toLocaleString() || 0} <span className="text-sm">AP</span></p>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-card/50">
          {/* Description */}
          {steal.scenario?.description && (
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {steal.scenario.description}
              </p>
            </div>
          )}

          {/* Robbery Stats - Valor, Víctima, Mayor Golpe */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-border/50">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{steal.steal_price?.toLocaleString() || 0}</p>
              <p className="text-xs text-yellow-400/80">Valor del Robo</p>
            </div>
            <Link
              href={steal.victim ? `/perfil/${steal.victim.username}` : '#'}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/60 rounded-lg p-3 text-center transition-all group"
            >
              <div className="w-8 h-8 mx-auto mb-1 rounded-full overflow-hidden bg-purple-500/20 flex items-center justify-center">
                {steal.victim?.avatar_url ? (
                  <img src={steal.victim.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <p className="text-sm font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">
                @{steal.victim?.username || 'N/A'}
              </p>
              <p className="text-xs text-purple-400/80">Víctima</p>
            </Link>
            <div className={`rounded-lg p-3 text-center ${isBiggestHeist ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50' : 'bg-muted/50 border border-border'}`}>
              <Crown className={`w-5 h-5 mx-auto mb-1 ${isBiggestHeist ? 'text-orange-400' : 'text-muted-foreground'}`} />
              <p className={`text-xl font-bold ${isBiggestHeist ? 'text-orange-400' : 'text-muted-foreground'}`}>
                {isBiggestHeist ? 'SÍ' : 'NO'}
              </p>
              <p className={`text-xs ${isBiggestHeist ? 'text-orange-400/80' : 'text-muted-foreground'}`}>Mayor Golpe</p>
            </div>
          </div>

          {/* Scenario Stats Grid */}
          <div className="p-4 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Estadísticas del Escenario
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{steal.scenario?.participant_count || 0}</p>
                <p className="text-xs text-muted-foreground">Participantes</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{steal.scenario?.total_pool?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Pool Total</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{steal.scenario?.yes_pool?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Pool Sí</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-red-400 mx-auto mb-1 rotate-180" />
                <p className="text-lg font-bold text-foreground">{steal.scenario?.no_pool?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Pool No</p>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            {/* Victim Profile Link */}
            {steal.victim && (
              <Link
                href={`/perfil/${steal.victim.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center gap-3 bg-muted/50 hover:bg-muted border border-border hover:border-purple-500/50 rounded-lg p-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {steal.victim.avatar_url ? (
                    <img
                      src={steal.victim.avatar_url}
                      alt={steal.victim.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Skull className="w-3 h-3 text-red-400" />
                    Ver perfil de la víctima
                  </p>
                  <p className="font-semibold text-foreground truncate group-hover:text-purple-400 transition-colors">
                    @{steal.victim.username}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
              </Link>
            )}

            {/* Scenario Link */}
            {steal.scenario?.id && (
              <Link
                href={`/escenario/${steal.scenario.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg p-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Ver escenario completo</p>
                  <p className="font-semibold text-foreground truncate group-hover:text-red-400 transition-colors">
                    Ir al escenario
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EscenariosRobadosPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const supabase = getSupabaseBrowser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stolenScenarios, setStolenScenarios] = useState<StolenScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalStolen: 0,
    totalValue: 0,
    uniqueVictims: 0,
    biggestHeist: 0,
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(stolenScenarios.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

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
      <div className="min-h-screen bg-background text-foreground">
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-background to-purple-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {/* Back Button */}
          <Link
            href={`/perfil/${username}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
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
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-red-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Escenarios Robados
              </h1>
              <Link
                href={`/perfil/${profile.username}`}
                className="text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors group"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-transparent group-hover:ring-red-500/50 transition-all"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{profile.username?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                Historial de conquistas de <span className="text-red-400 font-semibold group-hover:underline">@{profile.username}</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards - Clickable */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 hover:border-red-500/60 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-sm text-muted-foreground">Total Robados</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalStolen}</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500/60 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-sm text-muted-foreground">Valor Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalValue.toLocaleString()} <span className="text-lg text-yellow-400">AP</span></p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/60 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">Víctimas</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.uniqueVictims}</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/60 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Mayor Golpe</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.biggestHeist.toLocaleString()} <span className="text-lg text-orange-400">AP</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {stolenScenarios.length === 0 ? (
          <div className="text-center py-20 bg-card/50 border border-border rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Skull className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sin conquistas aún</h3>
            <p className="text-muted-foreground mb-6">@{profile.username} no ha robado ningún escenario todavía</p>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
            >
              <Target className="w-4 h-4" />
              Explorar escenarios
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Historial de Robos
                <span className="text-sm font-normal text-muted-foreground ml-2">({stolenScenarios.length} escenarios)</span>
              </h2>

              {/* Expand/Collapse Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted border border-border rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ChevronDown className="w-4 h-4" />
                  Expandir todo
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted border border-border rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ChevronUp className="w-4 h-4" />
                  Colapsar todo
                </button>
              </div>
            </div>

            {/* Accordion List */}
            {stolenScenarios.map((steal, index) => (
              <AccordionItem
                key={steal.id}
                steal={steal}
                index={index}
                isExpanded={expandedItems.has(steal.id)}
                onToggle={() => toggleItem(steal.id)}
                isBiggestHeist={steal.steal_price === stats.biggestHeist}
                totalVictims={stats.uniqueVictims}
                totalValue={stats.totalValue}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
