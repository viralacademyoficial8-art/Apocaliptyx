"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/lib/stores";
import { scenariosService } from "@/services/scenarios.service";
import { predictionsService, Prediction } from "@/services/predictions.service";
import { createClient } from "@supabase/supabase-js";
import { 
  Loader2, ArrowLeft, Clock, Users, Flame, 
  TrendingUp, TrendingDown, AlertCircle, Share2, Flag, X
} from "lucide-react";
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
}

export default function EscenarioPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para votar
  const [betAmount, setBetAmount] = useState(100);
  const [selectedVote, setSelectedVote] = useState<"YES" | "NO" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);

  // Estado para reportar
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

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
        if (user?.id) {
          const prediction = await predictionsService.getUserPrediction(
            user.id,
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
    if (!user) {
      toast.error("Debes iniciar sesión para votar");
      router.push("/login");
      return;
    }

    if (!selectedVote) {
      toast.error("Selecciona una opción");
      return;
    }

    if (betAmount < (scenario?.min_bet || 10)) {
      toast.error(`Apuesta mínima: ${scenario?.min_bet || 10} AP Coins`);
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
        amount: betAmount,
        userId: user.id,
      });

      if (result.success && result.data) {
        toast.success(`¡Predicción registrada! Apostaste ${betAmount} AP Coins a ${selectedVote === "YES" ? "SÍ" : "NO"}`);
        
        // Recargar escenario para ver pools actualizados
        const updated = await scenariosService.getById(scenarioId);
        if (updated) {
          setScenario(updated);
        }
        setUserPrediction(result.data);
      } else {
        toast.error(result.error || "Error al registrar la predicción");
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
    if (!user) {
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
      await supabase
        .from('scenario_reports')
        .insert({
          reporter_id: user.id,
          scenario_id: scenarioId,
          reason: reportReason,
          description: reportDescription,
          status: 'pending',
        });

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

  // Calcular porcentajes
  const yesPercent = scenario && scenario.total_pool > 0 
    ? Math.round((scenario.yes_pool / scenario.total_pool) * 100) 
    : 50;
  const noPercent = 100 - yesPercent;

  // Calcular días restantes
  const daysLeft = scenario 
    ? Math.ceil((new Date(scenario.resolution_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

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
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
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
          <p className="text-gray-400 text-lg">{scenario.description}</p>
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

        {/* Voting section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Haz tu predicción</h2>
          
          {userPrediction ? (
            <div className="text-center py-8">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                userPrediction.prediction === "YES" 
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {userPrediction.prediction === "YES" ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                Votaste: {userPrediction.prediction === "YES" ? "SÍ" : "NO"}
              </div>
              <p className="text-gray-400 mt-3">
                Apostaste {userPrediction.amount} AP Coins
              </p>
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
                  onClick={() => setSelectedVote("YES")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedVote === "YES"
                      ? "border-green-500 bg-green-500/20"
                      : "border-gray-700 hover:border-green-500/50"
                  }`}
                >
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                    selectedVote === "YES" ? "text-green-500" : "text-gray-500"
                  }`} />
                  <p className="text-xl font-bold">SÍ</p>
                  <p className="text-sm text-gray-400">{yesPercent}% cree que sí</p>
                </button>
                
                <button
                  onClick={() => setSelectedVote("NO")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedVote === "NO"
                      ? "border-red-500 bg-red-500/20"
                      : "border-gray-700 hover:border-red-500/50"
                  }`}
                >
                  <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${
                    selectedVote === "NO" ? "text-red-500" : "text-gray-500"
                  }`} />
                  <p className="text-xl font-bold">NO</p>
                  <p className="text-sm text-gray-400">{noPercent}% cree que no</p>
                </button>
              </div>

              {/* Bet amount */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">
                  Cantidad a apostar (AP Coins)
                </label>
                <div className="flex gap-2">
                  {[50, 100, 250, 500, 1000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        betAmount === amount
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  min={scenario.min_bet}
                  max={scenario.max_bet}
                  className="w-full mt-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleVote}
                disabled={!selectedVote || isVoting || betAmount < scenario.min_bet}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Apostar ${betAmount} AP Coins`
                )}
              </button>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Distribución de votos</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-400 font-medium">SÍ: {scenario.yes_pool.toLocaleString()} AP ({yesPercent}%)</span>
            <span className="text-red-400 font-medium">NO: {scenario.no_pool.toLocaleString()} AP ({noPercent}%)</span>
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
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          <button
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

      <Footer />
    </div>
  );
}