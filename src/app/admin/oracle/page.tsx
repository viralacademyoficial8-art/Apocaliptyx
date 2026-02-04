'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
  Play,
  Settings,
  Eye,
  FileText,
  Zap,
  Globe,
  Bot,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  resolution_date: string;
  verification_criteria: string | null;
  verification_sources: string[] | null;
  verification_attempts: number;
  current_holder_id: string | null;
  theft_pool: number;
  status: string;
  holder_username: string | null;
  urgency: 'overdue' | 'due_today' | 'upcoming';
}

interface VerificationLog {
  id: string;
  scenario_id: string;
  search_query: string;
  verification_result: string;
  confidence_score: number;
  analysis_summary: string;
  evidence_urls: string[];
  executed_at: string;
  execution_time_ms: number;
  error_message: string | null;
}

interface OracleConfig {
  trusted_sources: string[];
  min_sources_required: number;
  confidence_threshold: number;
  verification_cooldown_hours: number;
  enable_auto_payout: boolean;
  appeal_window_hours: number;
}

interface ServiceStatus {
  googleSearch: boolean;
  gemini: boolean;
  allConfigured: boolean;
}

export default function OraclePage() {
  const [loading, setLoading] = useState(true);
  const [pendingScenarios, setPendingScenarios] = useState<PendingScenario[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [config, setConfig] = useState<OracleConfig | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'logs' | 'config'>('pending');
  const [processing, setProcessing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar escenarios pendientes
      const { data: pending } = await supabase
        .from('scenarios_pending_verification')
        .select('*');
      setPendingScenarios((pending || []) as PendingScenario[]);

      // Cargar logs de verificación recientes
      const { data: logs } = await supabase
        .from('verification_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      setVerificationLogs((logs || []) as VerificationLog[]);

      // Cargar configuración
      const { data: configData } = await supabase
        .from('oracle_config')
        .select('key, value');

      if (configData) {
        const configObj: any = {};
        configData.forEach((item: any) => {
          try {
            configObj[item.key] = JSON.parse(item.value);
          } catch {
            configObj[item.key] = item.value;
          }
        });
        setConfig(configObj as OracleConfig);
      }

      // Verificar estado de servicios
      const statusRes = await fetch('/api/admin/oracle/status');
      if (statusRes.ok) {
        const status = await statusRes.json();
        setServiceStatus(status);
      }
    } catch (error) {
      console.error('Error loading oracle data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runVerification = async (scenarioId?: string) => {
    setProcessing(true);
    setSelectedScenario(scenarioId || null);
    try {
      const res = await fetch('/api/cron/verify-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, autoProcess: true }),
      });
      const data = await res.json();

      if (data.success) {
        alert(scenarioId
          ? `Verificación completada: ${data.result?.verificationResult?.fulfilled ? 'CUMPLIDO' : 'NO CUMPLIDO'}`
          : `Verificación completada: ${data.summary?.processed} escenarios procesados`
        );
        loadData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error running verification:', error);
      alert('Error ejecutando verificación');
    } finally {
      setProcessing(false);
      setSelectedScenario(null);
    }
  };

  const manualResolve = async (scenarioId: string, result: 'YES' | 'NO') => {
    const notes = prompt('Notas de la resolución manual:');
    if (!notes) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/oracle/manual-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, result, notes }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Escenario resuelto como ${result === 'YES' ? 'CUMPLIDO' : 'NO CUMPLIDO'}`);
        loadData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error resolving scenario:', error);
      alert('Error resolviendo escenario');
    } finally {
      setProcessing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'due_today':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'Vencido';
      case 'due_today':
        return 'Vence Hoy';
      default:
        return 'Próximo';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'fulfilled':
        return 'text-green-400';
      case 'not_fulfilled':
        return 'text-red-400';
      case 'inconclusive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Oráculo de Verificación</h1>
            <p className="text-gray-400 text-sm">
              Sistema automático de verificación con IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => runVerification()}
            disabled={processing || !serviceStatus?.allConfigured}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Ejecutar Verificación
          </button>
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${serviceStatus?.googleSearch ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Globe className={`w-5 h-5 ${serviceStatus?.googleSearch ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Google Search</p>
              <p className={`font-semibold ${serviceStatus?.googleSearch ? 'text-green-400' : 'text-red-400'}`}>
                {serviceStatus?.googleSearch ? 'Conectado' : 'No Configurado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${serviceStatus?.gemini ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Bot className={`w-5 h-5 ${serviceStatus?.gemini ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Gemini AI</p>
              <p className={`font-semibold ${serviceStatus?.gemini ? 'text-green-400' : 'text-red-400'}`}>
                {serviceStatus?.gemini ? 'Conectado' : 'No Configurado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="font-semibold text-white">{pendingScenarios.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Verificaciones Hoy</p>
              <p className="font-semibold text-white">
                {verificationLogs.filter(l =>
                  new Date(l.executed_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if services not configured */}
      {!serviceStatus?.allConfigured && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Servicios no configurados</p>
            <p className="text-yellow-400/70 text-sm">
              Configura las variables de entorno GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID y GEMINI_API_KEY en Vercel para activar la verificación automática.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Pendientes ({pendingScenarios.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Historial
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuración
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingScenarios.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl p-8 text-center border border-gray-800">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">No hay escenarios pendientes</p>
              <p className="text-gray-400 text-sm">Todos los escenarios están al día</p>
            </div>
          ) : (
            pendingScenarios.map(scenario => (
              <div
                key={scenario.id}
                className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getUrgencyColor(scenario.urgency)}`}>
                        {getUrgencyLabel(scenario.urgency)}
                      </span>
                      <span className="text-xs text-gray-500">{scenario.category}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Intentos: {scenario.verification_attempts}
                      </span>
                    </div>

                    <h3 className="text-white font-medium mb-1">{scenario.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(scenario.resolution_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        {scenario.theft_pool} AP
                      </span>
                      {scenario.holder_username && (
                        <span>Holder: @{scenario.holder_username}</span>
                      )}
                    </div>

                    {scenario.verification_criteria && (
                      <p className="text-sm text-gray-500 mt-2">
                        Criterio: {scenario.verification_criteria}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runVerification(scenario.id)}
                      disabled={processing || !serviceStatus?.allConfigured}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 disabled:opacity-50 transition-colors text-sm"
                    >
                      {processing && selectedScenario === scenario.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Verificar
                    </button>

                    <button
                      onClick={() => manualResolve(scenario.id, 'YES')}
                      disabled={processing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Sí
                    </button>

                    <button
                      onClick={() => manualResolve(scenario.id, 'NO')}
                      disabled={processing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-colors text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      No
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-3">
          {verificationLogs.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl p-8 text-center border border-gray-800">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-medium">No hay verificaciones</p>
              <p className="text-gray-400 text-sm">Las verificaciones aparecerán aquí</p>
            </div>
          ) : (
            verificationLogs.map(log => (
              <div
                key={log.id}
                className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getResultColor(log.verification_result)}`}>
                        {log.verification_result === 'fulfilled' && '✓ Cumplido'}
                        {log.verification_result === 'not_fulfilled' && '✗ No Cumplido'}
                        {log.verification_result === 'inconclusive' && '? Inconcluso'}
                        {log.verification_result === 'error' && '⚠ Error'}
                      </span>
                      {log.confidence_score && (
                        <span className="text-xs text-gray-500">
                          Confianza: {Math.round(log.confidence_score * 100)}%
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-2">
                      Query: "{log.search_query}"
                    </p>

                    {log.analysis_summary && (
                      <p className="text-sm text-gray-500">{log.analysis_summary}</p>
                    )}

                    {log.error_message && (
                      <p className="text-sm text-red-400">Error: {log.error_message}</p>
                    )}

                    {log.evidence_urls && log.evidence_urls.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Fuentes:</p>
                        <div className="flex flex-wrap gap-1">
                          {log.evidence_urls.slice(0, 3).map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:underline"
                            >
                              {new URL(url).hostname}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDistanceToNow(new Date(log.executed_at), { locale: es, addSuffix: true })}</p>
                    <p>{log.execution_time_ms}ms</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'config' && config && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-medium mb-4">Configuración del Oráculo</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Fuentes Confiables
                </label>
                <p className="text-white">
                  {Array.isArray(config.trusted_sources)
                    ? config.trusted_sources.join(', ')
                    : 'No configurado'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Fuentes Mínimas
                  </label>
                  <p className="text-white font-medium">{config.min_sources_required}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Umbral de Confianza
                  </label>
                  <p className="text-white font-medium">{config.confidence_threshold * 100}%</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Cooldown (horas)
                  </label>
                  <p className="text-white font-medium">{config.verification_cooldown_hours}h</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Ventana de Apelación
                  </label>
                  <p className="text-white font-medium">{config.appeal_window_hours}h</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Auto-Pago
                </label>
                <p className={`font-medium ${config.enable_auto_payout ? 'text-green-400' : 'text-red-400'}`}>
                  {config.enable_auto_payout ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-medium mb-4">Variables de Entorno Requeridas</h3>
            <div className="space-y-2 font-mono text-sm">
              <p className="text-gray-400">
                <span className="text-purple-400">GOOGLE_SEARCH_API_KEY</span>=tu_api_key
              </p>
              <p className="text-gray-400">
                <span className="text-purple-400">GOOGLE_SEARCH_ENGINE_ID</span>=tu_search_engine_id
              </p>
              <p className="text-gray-400">
                <span className="text-purple-400">GEMINI_API_KEY</span>=tu_gemini_api_key
              </p>
              <p className="text-gray-400">
                <span className="text-purple-400">CRON_SECRET</span>=tu_cron_secret (opcional)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
