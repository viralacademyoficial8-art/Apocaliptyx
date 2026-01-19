"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/lib/stores";
import { scenariosService } from "@/services/scenarios.service";
import { predictionsService, Prediction } from "@/services/predictions.service";
import { createClient } from "@supabase/supabase-js";
import {
  Loader2, ArrowLeft, Clock, Users, Flame,
  TrendingUp, TrendingDown, AlertCircle, Share2, Flag, X,
  Shield, Crown, Zap, Coins, User, ThumbsUp, ThumbsDown
} from "lucide-react";
import { useScenarioStealing } from "@/hooks/useScenarioStealing";
import { toast } from "@/components/ui/toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Razones de reporte para escenarios
const REPORT_REASONS = [
  { id: 'duplicate', label: 'Escenario duplicado' },
  { id: 'inappropriate', label: 'Contenido inapropiado' },
  { id: 'misleading', label: 'Información engañosa' },
  { id: 'spam', label: 'Spam o publicidad' },
  { id: 'impossible', label: 'Imposible de verificar' },
  { id: 'other', label: 'Otro motivo' },
];

interface ScenarioData {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  result: string | null;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  participant_count: number;
  min_bet: number;
  max_bet: number;
  is_featured: boolean;
  is_hot: boolean;
  resolution_date: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Campos de stealing system
  current_holder_id?: string | null;
  current_price?: number;
  steal_count?: number;
  theft_pool?: number;
  is_protected?: boolean;
  protected_until?: string | null;
  can_be_stolen?: boolean;
  // Para mostrar holder info
  holder_username?: string;
  creator_username?: string;
}

export default function EscenarioPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshBalance } = useAuthStore();

  // Estado para tracking de carga del balance
  const [balanceLoadAttempted, setBalanceLoadAttempted] = useState(false);

  // Sincronizar sesión de NextAuth con Zustand
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Always refresh balance when authenticated to ensure we have latest apCoins
      refreshBalance().finally(() => {
        setBalanceLoadAttempted(true);
      });

      // Fallback: si después de 5 segundos no se carga, marcar como intentado
      const timeout = setTimeout(() => {
        setBalanceLoadAttempted(true);
      }, 5000);

      return () => clearTimeout(timeout);
    } else if (status === 'unauthenticated') {
      setBalanceLoadAttempted(true);
    }
  }, [status, session, refreshBalance]);

  // Usar datos de Zustand si existen
  const currentUser = user;
  // Solo mostrar loading si está autenticado, no hay user, y no se ha intentado cargar
  const isBalanceLoading = status === 'authenticated' && !user && !balanceLoadAttempted;

  const isLoggedIn = status === "authenticated" && !!session?.user;

  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para votar
  const [selectedVote, setSelectedVote] = useState<"YES" | "NO" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);

  // Estado para reportar
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Estado para robo/protección
  const [isStealing, setIsStealing] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [applyingShield, setApplyingShield] = useState<string | null>(null);
  const { stealScenario, applyShield, getShieldTypes } = useScenarioStealing();

  const scenarioId = params.id as string;

  // Cargar escenario
  useEffect(() => {
    async function loadScenario() {
      if (!scenarioId) return;
      
      try {
        setLoading(true);
        const data = await scenariosService.getById(scenarioId);
        
        if (!data) {
          setError("Escenario no encontrado");
          return;
        }
        
        setScenario(data);
        
        // Cargar predicción del usuario si está logueado
        if (currentUser?.id) {
          const prediction = await predictionsService.getUserPrediction(
            currentUser?.id,
            scenarioId
          );
          setUserPrediction(prediction);
        }
      } catch (err) {
        console.error("Error loading scenario:", err);
        setError("Error al cargar el escenario");
      } finally {
        setLoading(false);
      }
    }

    loadScenario();
  }, [scenarioId, user?.id]);

  // Manejar voto
  const handleVote = async () => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Debes iniciar sesión para votar");
      router.push("/login");
      return;
    }

    if (!selectedVote) {
      toast.error("Selecciona una opción");
      return;
    }

    if (userPrediction) {
      toast.error("Ya has votado en este escenario");
      return;
    }

    setIsVoting(true);

    try {
      const result = await predictionsService.create({
        scenarioId,
        prediction: selectedVote,
        amount: 0,
        userId: currentUser?.id,
      });

      if (result.success && result.data) {
        toast.success(`¡Voto registrado! Votaste ${selectedVote === "YES" ? "SÍ" : "NO"}`);
        
        // Recargar escenario para ver pools actualizados
        const updated = await scenariosService.getById(scenarioId);
        if (updated) {
          setScenario(updated);
        }
        setUserPrediction(result.data);
      } else {
        toast.error(result.error || "Error al registrar tu voto");
      }
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Error al votar");
    } finally {
      setIsVoting(false);
    }
  };

  // Manejar reporte
  const handleReport = async () => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Debes iniciar sesión para reportar");
      router.push("/login");
      return;
    }

    if (!reportReason) {
      toast.error("Selecciona un motivo");
      return;
    }

    setReportLoading(true);
    try {
      // Guardar el reporte
      const { data: reportData } = await supabase
        .from('scenario_reports')
        .insert({
          reporter_id: currentUser?.id,
          scenario_id: scenarioId,
          reason: reportReason,
          description: reportDescription,
          status: 'pending',
        })
        .select()
        .single();

      // Notificación para el usuario que reporta
      await supabase
        .from('notifications')
        .insert({
          user_id: currentUser?.id,
          type: 'system',
          title: '📋 Reporte enviado',
          message: `Tu reporte sobre "${scenario?.title?.substring(0, 30)}..." ha sido recibido. Lo revisaremos pronto.`,
          link_url: `/escenario/${scenarioId}`,
          is_read: false,
        });

      // Obtener todos los admins para notificarles
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      // Notificación para cada admin
      if (admins && admins.length > 0) {
        const reasonLabel = REPORT_REASONS.find(r => r.id === reportReason)?.label || reportReason;
        
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'system',
          title: '🚨 Nuevo reporte de escenario',
          message: `@${currentUser?.username} reportó: "${scenario?.title?.substring(0, 25)}..." - Motivo: ${reasonLabel}`,
          link_url: '/admin/reportes',
          is_read: false,
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);
      }

      toast.success("Reporte enviado. Nuestro equipo lo revisará pronto.");
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error("Error reporting scenario:", error);
      toast.error("Error al enviar el reporte");
    } finally {
      setReportLoading(false);
    }
  };

  // Funciones de robo/protección
  const isOwner = user?.id === (scenario?.current_holder_id || scenario?.creator_id);
  const currentPrice = scenario?.current_price || 11;
  const theftPool = scenario?.theft_pool || 0;
  const stealCount = scenario?.steal_count || 0;
  const isProtected = scenario?.is_protected && scenario?.protected_until && new Date(scenario.protected_until) > new Date();

  const canSteal = () => {
    if (!isLoggedIn || !currentUser) return false;
    if (isBalanceLoading) return false; // Wait for balance to load
    if (isOwner) return false;
    if (scenario?.status !== "ACTIVE") return false;
    if (isProtected) return false;
    if ((currentUser?.apCoins || 0) < currentPrice) return false;
    return true;
  };

  const getStealButtonText = () => {
    if (!isLoggedIn) return "Inicia sesión para robar";
    if (isBalanceLoading) return "Cargando...";
    if (!currentUser) return "Error al cargar datos";
    if ((currentUser?.apCoins || 0) < currentPrice) {
      return `Necesitas ${currentPrice} AP (tienes ${currentUser?.apCoins || 0})`;
    }
    return `Robar por ${currentPrice} AP`;
  };

  const handleSteal = async () => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Debes iniciar sesión para robar");
      router.push("/login");
      return;
    }

    if (isBalanceLoading) {
      toast.error("Espera a que se cargue tu balance");
      return;
    }

    if ((currentUser?.apCoins || 0) < currentPrice) {
      toast.error(`No tienes suficientes AP. Necesitas ${currentPrice} AP, tienes ${currentUser?.apCoins || 0}`);
      return;
    }

    if (!canSteal()) {
      toast.error("No puedes robar este escenario");
      return;
    }

    setIsStealing(true);
    try {
      const result = await stealScenario(scenarioId);

      if (result.success) {
        toast.success(`¡Escenario robado! Pagaste ${result.stealPrice} AP`);
        // Refresh balance after steal
        refreshBalance();
        // Reload page to see changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(result.error || "Error al robar escenario");
      }
    } catch (error: any) {
      console.error("Steal error:", error);
      toast.error(error?.message || "Error al robar escenario");
    } finally {
      setIsStealing(false);
    }
  };

  const handleApplyShield = async (shieldType: string) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Debes iniciar sesión");
      return;
    }

    setApplyingShield(shieldType);
    try {
      const result = await applyShield(scenarioId, shieldType as any);

      if (result.success) {
        toast.success("¡Escudo activado!");
        setShowShieldModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(result.error || "Error al aplicar escudo");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al aplicar escudo");
    } finally {
      setApplyingShield(null);
    }
  };

  // Calcular porcentajes
  const yesPercent = scenario && scenario.total_pool > 0
    ? Math.round((scenario.yes_pool / scenario.total_pool) * 100)
    : 50;
  const noPercent = 100 - yesPercent;

  // Calcular días restantes
  const daysLeft = scenario
    ? Math.ceil((new Date(scenario.resolution_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Escenario vencido (no se puede votar, robar ni proteger)
  const isExpired = daysLeft <= 0;

  // Compartir
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scenario?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado al portapapeles");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Cargando escenario...</span>
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Escenario no encontrado</h1>
          <p className="text-gray-400 mb-6">El escenario que buscas no existe o ha sido eliminado.</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              type="button"
              onClick={() => router.push("/explorar")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Ver todos los escenarios
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {scenario.category}
            </span>
            {scenario.is_featured && (
              <span className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                ⭐ Destacado
              </span>
            )}
            {scenario.is_hot && (
              <span className="text-xs px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                🔥 Hot
              </span>
            )}
            <span className={`text-xs px-3 py-1 rounded-full ${
              scenario.status === "ACTIVE" 
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {scenario.status === "ACTIVE" ? "Activo" : scenario.status}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{scenario.title}</h1>
          <p className="text-gray-400 text-lg mb-4">{scenario.description}</p>

          {/* Creator & Owner Tags */}
          <div className="flex flex-wrap gap-3">
            {scenario.creator_username && (
              <button
                type="button"
                onClick={() => router.push(`/perfil/${scenario.creator_username}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm"
              >
                <User className="w-4 h-4" />
                Creado por @{scenario.creator_username}
              </button>
            )}
            {scenario.current_holder_id && scenario.current_holder_id !== scenario.creator_id && scenario.holder_username && (
              <button
                type="button"
                onClick={() => router.push(`/perfil/${scenario.holder_username}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
              >
                <Crown className="w-4 h-4" />
                Robado por @{scenario.holder_username}
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <Flame className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{scenario.total_pool.toLocaleString()}</p>
            <p className="text-sm text-gray-400">AP en juego</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{scenario.participant_count}</p>
            <p className="text-sm text-gray-400">Participantes</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{daysLeft > 0 ? daysLeft : 0}</p>
            <p className="text-sm text-gray-400">Días restantes</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{yesPercent}%</p>
            <p className="text-sm text-gray-400">Dicen SÍ</p>
          </div>
        </div>

        {/* Holder & Stealing Section */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Holder Info */}
            <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Holder Actual</p>
                <p className="text-xl font-bold text-yellow-400">
                  @{scenario.holder_username || scenario.creator_username || 'creador'}
                  {isOwner && <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Tú</span>}
                </p>
              </div>
            </div>

            {/* Stealing Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{theftPool} AP</p>
                <p className="text-xs text-gray-400">Pool acumulado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{currentPrice} AP</p>
                <p className="text-xs text-gray-400">Precio para robar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{stealCount}</p>
                <p className="text-xs text-gray-400">Veces robado</p>
              </div>
            </div>
          </div>

          {/* Protection indicator */}
          {isProtected && scenario.protected_until && (
            <div className="mt-4 flex items-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">
                Protegido hasta {new Date(scenario.protected_until).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {/* Steal & Shield Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isExpired ? (
              <div className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-semibold">Escenario vencido - No se puede robar ni proteger</span>
              </div>
            ) : (
              <>
                {!isOwner && scenario.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={handleSteal}
                    disabled={!canSteal() || isStealing || isBalanceLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-colors"
                  >
                    {isStealing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Robando...
                      </>
                    ) : isBalanceLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        {getStealButtonText()}
                      </>
                    )}
                  </button>
                )}

                {isOwner && (
                  <>
                    <div className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Este escenario es tuyo</span>
                    </div>
                    {isProtected ? (
                      <div className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-semibold">Ya protegido</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowShieldModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors"
                      >
                        <Shield className="w-5 h-5" />
                        Proteger
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {!isLoggedIn && scenario.status === "ACTIVE" && (
            <p className="text-center text-gray-500 text-sm mt-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-purple-400 hover:underline"
              >
                Inicia sesión
              </button>
              {' '}para robar o proteger escenarios
            </p>
          )}
        </div>

        {/* Voting section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">¿Qué opinas?</h2>
          
          {userPrediction ? (
            <div className="text-center py-8">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                userPrediction.prediction === "YES"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {userPrediction.prediction === "YES" ? (
                  <ThumbsUp className="w-5 h-5" />
                ) : (
                  <ThumbsDown className="w-5 h-5" />
                )}
                Opinaste: {userPrediction.prediction === "YES" ? "Me gusta" : "No me gusta"}
              </div>
              <p className="text-gray-400 mt-3">
                Tu opinión ha sido registrada
              </p>
            </div>
          ) : isExpired ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">Este escenario ha vencido y ya no acepta opiniones</p>
            </div>
          ) : scenario.status !== "ACTIVE" ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Este escenario ya no está activo</p>
            </div>
          ) : (
            <>
              {/* Vote options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedVote("YES")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedVote === "YES"
                      ? "border-green-500 bg-green-500/20"
                      : "border-gray-700 hover:border-green-500/50"
                  }`}
                >
                  <ThumbsUp className={`w-8 h-8 mx-auto mb-2 ${
                    selectedVote === "YES" ? "text-green-500" : "text-gray-500"
                  }`} />
                  <p className="text-xl font-bold">Me gusta</p>
                  <p className="text-sm text-gray-400">{yesPercent}% opina igual</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVote("NO")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedVote === "NO"
                      ? "border-red-500 bg-red-500/20"
                      : "border-gray-700 hover:border-red-500/50"
                  }`}
                >
                  <ThumbsDown className={`w-8 h-8 mx-auto mb-2 ${
                    selectedVote === "NO" ? "text-red-500" : "text-gray-500"
                  }`} />
                  <p className="text-xl font-bold">No me gusta</p>
                  <p className="text-sm text-gray-400">{noPercent}% opina igual</p>
                </button>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleVote}
                disabled={!selectedVote || isVoting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Opinar"
                )}
              </button>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Distribución de opiniones</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-400 font-medium">Me gusta: {scenario.yes_pool} ({yesPercent}%)</span>
            <span className="text-red-400 font-medium">No me gusta: {scenario.no_pool} ({noPercent}%)</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 transition-all"
              style={{ width: `${yesPercent}%` }}
            />
            <div 
              className="bg-gradient-to-r from-red-400 to-red-500 transition-all"
              style={{ width: `${noPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-400"
          >
            <Flag className="w-4 h-4" />
            Reportar
          </button>
        </div>
      </main>

      {/* Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                Reportar escenario
              </h2>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  ¿Por qué quieres reportar este escenario?
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      type="button"
                      key={reason.id}
                      onClick={() => setReportReason(reason.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        reportReason === reason.id
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Detalles adicionales (opcional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Proporciona más información sobre el problema..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reportDescription.length}/500 caracteres
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  disabled={!reportReason || reportLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar reporte'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escudos */}
      {showShieldModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Proteger Escenario
              </h2>
              <button
                type="button"
                onClick={() => setShowShieldModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Activa un escudo para proteger tu escenario de robos temporalmente
            </p>

            <div className="space-y-3">
              {getShieldTypes().map((shield) => (
                <div
                  key={shield.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{shield.icon}</span>
                        <span className="font-bold text-white">{shield.name}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {shield.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">
                          {shield.price} AP
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyShield(shield.id)}
                      disabled={
                        applyingShield !== null ||
                        !user ||
                        (currentUser?.apCoins || 0) < shield.price
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      {applyingShield === shield.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Activar"
                      )}
                    </button>
                  </div>
                  {isLoggedIn && (currentUser?.apCoins || 0) < shield.price && (
                    <p className="text-xs text-red-400 mt-2">
                      No tienes suficientes AP coins
                    </p>
                  )}
                </div>
              ))}
            </div>

            {isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                <span className="text-sm text-gray-400">Tu balance: </span>
                <span className="font-bold text-yellow-400">{currentUser?.apCoins || 0} AP</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}