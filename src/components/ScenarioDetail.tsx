"use client";

import { useState, useEffect } from "react";
import { Scenario } from "@/types";
import { useAuthStore, useScenarioStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Flame,
  Trophy,
  Shield,
  Lock,
  Share2,
  Crown,
  Zap,
  Target,
  AlertTriangle,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getCategoryColor, calculateTimeLeft } from "@/lib/utils";
import { predictionsService, type PredictionType, type Prediction } from "@/services/predictions.service";

interface ScenarioDetailProps {
  scenario: Scenario;
}

// Mapeo local de etiquetas de categoría
const CATEGORY_LABELS: Record<string, string> = {
  tecnologia: "Tecnología",
  deportes: "Deportes",
  economia: "Economía",
  politica: "Política",
  farandula: "Farándula",
  otros: "Otros",
};

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const scenarioStore = useScenarioStore();
  const [isStealing, setIsStealing] = useState(false);
  
  // Estados para votación
  const [isVoting, setIsVoting] = useState(false);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);
  const [voteCounts, setVoteCounts] = useState({ yes: 0, no: 0 });
  const [loadingVotes, setLoadingVotes] = useState(true);

  // ⬇️ Fallbacks seguros para usernames
  const creatorUsername = scenario.creatorUsername ?? "profeta_anonimo";
  const holderUsername =
    scenario.currentHolderUsername ?? creatorUsername;

  const isOwner = user?.id === scenario.currentHolderId;

  // Normalizamos fechas y valores para evitar undefined
  const dueDate = new Date((scenario.dueDate as any) ?? Date.now());
  const createdAt = new Date((scenario.createdAt as any) ?? Date.now());
  const lockUntil = scenario.lockUntil
    ? new Date(scenario.lockUntil as any)
    : null;
  const protectionUntil = scenario.protectionUntil
    ? new Date(scenario.protectionUntil as any)
    : null;

  const currentPrice = scenario.currentPrice ?? 0;
  const totalPot = scenario.totalPot ?? 0;
  const transferCount = scenario.transferCount ?? 0;

  const timeLeft = calculateTimeLeft(dueDate);
  const categoryLabel =
    CATEGORY_LABELS[scenario.category] ?? scenario.category;

  // Cargar votos y predicción del usuario
  useEffect(() => {
    const loadVotesData = async () => {
      setLoadingVotes(true);
      try {
        // Cargar conteo de votos
        const counts = await predictionsService.countVotes(scenario.id);
        setVoteCounts(counts);

        // Si hay usuario, cargar su predicción
        if (user?.id) {
          const prediction = await predictionsService.getUserPrediction(user.id, scenario.id);
          setUserPrediction(prediction);
        }
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        setLoadingVotes(false);
      }
    };

    loadVotesData();
  }, [scenario.id, user?.id]);

  // Usar votos de la base de datos o del escenario
  const votesYes = voteCounts.yes || (scenario.votes?.yes ?? 0);
  const votesNo = voteCounts.no || (scenario.votes?.no ?? 0);
  const totalVotes = votesYes + votesNo || 1;
  const yesPct = (votesYes / totalVotes) * 100;
  const noPct = (votesNo / totalVotes) * 100;

  const canSteal = () => {
    if (!user) return false;
    if (isOwner) return false;
    if (scenario.status !== "active") return false;
    if (
      scenario.isProtected &&
      protectionUntil &&
      new Date() < protectionUntil
    )
      return false;
    if (lockUntil && new Date() < lockUntil) return false;
    if (user.apCoins < currentPrice) return false;
    return true;
  };

  const canVote = () => {
    if (!user) return false;
    if (userPrediction) return false; // Ya votó
    if (scenario.status !== "active") return false;
    return true;
  };

  const handleVote = async (vote: PredictionType) => {
    if (!user) {
      toast.error("Debes iniciar sesión para votar");
      router.push("/login");
      return;
    }

    if (!canVote()) {
      if (userPrediction) {
        toast.error("Ya has votado en este escenario");
      } else {
        toast.error("No puedes votar en este escenario");
      }
      return;
    }

    setIsVoting(true);
    try {
      const result = await predictionsService.voteWithNotification({
        userId: user.id,
        username: user.username,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioOwnerId: scenario.currentHolderId || scenario.creatorId || '',
        prediction: vote,
        amount: 0, // Por ahora sin apuesta, solo voto
      });

      if (result.success) {
        toast.success(`¡Votaste "${vote === 'YES' ? 'Sí' : 'No'}"!`);
        
        // Actualizar estado local
        setUserPrediction({
          id: 'temp',
          user_id: user.id,
          scenario_id: scenario.id,
          prediction: vote,
          amount: 0,
          status: 'PENDING',
          profit: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        // Actualizar conteo de votos
        setVoteCounts(prev => ({
          yes: vote === 'YES' ? prev.yes + 1 : prev.yes,
          no: vote === 'NO' ? prev.no + 1 : prev.no,
        }));
      } else {
        toast.error(result.error || "Error al votar");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al votar");
    } finally {
      setIsVoting(false);
    }
  };

  const handleSteal = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      router.push("/login");
      return;
    }

    if (!canSteal()) {
      toast.error("No puedes robar este escenario");
      return;
    }

    setIsStealing(true);
    try {
      const stealScenarioFn = (scenarioStore as any).stealScenario;
      if (!stealScenarioFn) {
        toast.error("La función para robar escenario aún no está implementada");
      } else {
        await stealScenarioFn(scenario.id);
        toast.success("¡Escenario robado exitosamente!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al robar escenario");
    } finally {
      setIsStealing(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/escenario/${scenario.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: scenario.title,
          text: `Mira este escenario en Apocaliptics: ${scenario.title}`,
          url,
        });
      } catch {
        // silencio si cancelan
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    }
  };

  const getStatusBadge = () => {
    switch (scenario.status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            🟢 Activo
          </Badge>
        );
      case "locked":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            🔒 Bloqueado
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            ✅ Completado
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            ❌ Fallido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-800 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Category & Status */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={getCategoryColor(scenario.category)}
                >
                  {categoryLabel}
                </Badge>
                {getStatusBadge()}
                {scenario.isProtected && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Protegido
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {scenario.title}
              </h1>

              {/* Creator info */}
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                onClick={() => router.push(`/perfil/${creatorUsername}`)}
              >
                <span className="text-gray-400">Creado por</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={scenario.creatorAvatar} />
                  <AvatarFallback className="text-xs bg-purple-600">
                    {creatorUsername.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-purple-400">
                  @{creatorUsername}
                </span>
              </div>
            </div>

            {/* Share button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="border-gray-700 hover:bg-gray-800"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Descripción
            </h3>
            <p className="text-gray-200 whitespace-pre-wrap">
              {scenario.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Due Date */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Fecha Límite
              </div>
              <div className="font-bold">
                {format(dueDate, "dd MMM yyyy", { locale: es })}
              </div>
              {!timeLeft.isExpired && (
                <div className="text-xs text-yellow-400 mt-1">
                  {timeLeft.days}d {timeLeft.hours}h restantes
                </div>
              )}
            </div>

            {/* Current Price */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Flame className="w-4 h-4" />
                Precio Actual
              </div>
              <div className="font-bold text-yellow-400 text-xl">
                {currentPrice} AP
              </div>
            </div>

            {/* Total Pot */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Trophy className="w-4 h-4" />
                Bolsa Total
              </div>
              <div className="font-bold text-green-400 text-xl">
                {totalPot} AP
              </div>
            </div>

            {/* Transfer Count */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Veces Robado
              </div>
              <div className="font-bold text-xl">{transferCount}</div>
            </div>
          </div>

          {/* Current Holder */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Holder Actual</div>
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => router.push(`/perfil/${holderUsername}`)}
                  >
                    <Avatar className="w-8 h-8 border-2 border-yellow-500">
                      <AvatarImage src={scenario.creatorAvatar} />
                      <AvatarFallback className="bg-yellow-600">
                        {holderUsername.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-yellow-400">
                      @{holderUsername}
                    </span>
                    {isOwner && (
                      <Badge className="bg-yellow-500 text-black text-xs">
                        Tú
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {scenario.isProtected && protectionUntil && (
                <div className="text-right">
                  <div className="text-xs text-blue-400">
                    Protegido hasta
                  </div>
                  <div className="text-sm font-semibold">
                    {format(protectionUntil, "dd MMM HH:mm", { locale: es })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voting Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              ¿Crees que se cumplirá?
            </h3>
            
            {/* Barras de progreso */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold">Sí</span>
                  <span className="text-sm text-gray-400">
                    {loadingVotes ? '...' : `${votesYes} votos`}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${yesPct}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-semibold">No</span>
                  <span className="text-sm text-gray-400">
                    {loadingVotes ? '...' : `${votesNo} votos`}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${noPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Botones de votar o estado del voto */}
            {userPrediction ? (
              // Usuario ya votó
              <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Check className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">
                  Votaste: {userPrediction.prediction === 'YES' ? '✅ Sí' : '❌ No'}
                </span>
              </div>
            ) : scenario.status === 'active' ? (
              // Puede votar
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVote('YES')}
                  disabled={isVoting || !user}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {isVoting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ThumbsUp className="w-5 h-5 mr-2" />
                      Sí, se cumplirá
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleVote('NO')}
                  disabled={isVoting || !user}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                >
                  {isVoting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ThumbsDown className="w-5 h-5 mr-2" />
                      No, no se cumplirá
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Escenario no activo
              <div className="text-center text-gray-500 py-2">
                Este escenario ya no acepta votos
              </div>
            )}

            {!user && scenario.status === 'active' && (
              <p className="text-center text-gray-500 text-sm mt-3">
                <button 
                  onClick={() => router.push('/login')}
                  className="text-purple-400 hover:underline"
                >
                  Inicia sesión
                </button>
                {' '}para votar
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isOwner && scenario.status === "active" && (
              <Button
                onClick={handleSteal}
                disabled={!canSteal() || isStealing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
              >
                {isStealing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Robando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Robar por {currentPrice} AP
                  </>
                )}
              </Button>
            )}

            {isOwner && (
              <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <span className="text-green-400 font-semibold">
                  Este escenario es tuyo
                </span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => router.push("/tienda")}
              className="border-gray-700 hover:bg-gray-800"
            >
              <Lock className="w-4 h-4 mr-2" />
              Comprar Protección
            </Button>
          </div>

          {/* Warnings */}
          {lockUntil && new Date() < lockUntil && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <span className="text-yellow-400 font-semibold">
                  Escenario bloqueado
                </span>
                <p className="text-sm text-yellow-200/80">
                  No se puede robar hasta{" "}
                  {format(lockUntil, "dd MMM HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}