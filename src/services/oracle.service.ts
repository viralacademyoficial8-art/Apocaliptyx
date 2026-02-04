// =====================================================
// ORACLE SERVICE
// Servicio principal de verificación automática
// Orquesta Google Search + Gemini AI + Database
// =====================================================

import { getSupabaseClient } from '@/lib/supabase/client';
import { googleSearchService, SearchResponse } from './google-search.service';
import { geminiService, VerificationResult } from './gemini.service';
import { notificationsService } from './notifications.service';

export interface ScenarioPendingVerification {
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

export interface VerificationProcessResult {
  success: boolean;
  scenarioId: string;
  scenarioTitle: string;
  searchResults?: SearchResponse;
  verificationResult?: VerificationResult;
  payoutProcessed: boolean;
  payoutAmount?: number;
  recipientId?: string;
  error?: string;
  executionTimeMs: number;
}

export interface OracleBatchResult {
  success: boolean;
  totalScenarios: number;
  processed: number;
  fulfilled: number;
  notFulfilled: number;
  errors: number;
  results: VerificationProcessResult[];
  executionTimeMs: number;
}

const DEFAULT_TRUSTED_SOURCES = [
  'reuters.com',
  'apnews.com',
  'bloomberg.com',
  'bbc.com',
  'cnn.com',
  'nytimes.com',
];

export const oracleService = {
  // ============================================
  // OBTENER ESCENARIOS PENDIENTES
  // ============================================

  async getPendingScenarios(): Promise<ScenarioPendingVerification[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('scenarios_pending_verification')
      .select('*');

    if (error) {
      console.error('Error fetching pending scenarios:', error);
      return [];
    }

    return (data || []) as ScenarioPendingVerification[];
  },

  // ============================================
  // VERIFICAR UN ESCENARIO INDIVIDUAL
  // ============================================

  async verifyScenario(
    scenario: ScenarioPendingVerification,
    autoProcess: boolean = true
  ): Promise<VerificationProcessResult> {
    const startTime = Date.now();
    const supabase = getSupabaseClient();

    try {
      // 1. Verificar que los servicios están configurados
      if (!googleSearchService.isConfigured()) {
        throw new Error('Google Search API not configured');
      }
      if (!geminiService.isConfigured()) {
        throw new Error('Gemini API not configured');
      }

      // 2. Obtener fuentes confiables
      const trustedSources = scenario.verification_sources || DEFAULT_TRUSTED_SOURCES;

      // 3. Buscar noticias relacionadas
      console.log(`[Oracle] Searching news for: ${scenario.title}`);
      const searchResults = await googleSearchService.searchForScenario(
        scenario.title,
        scenario.verification_criteria,
        trustedSources
      );

      if (!searchResults.success) {
        throw new Error(`Search failed: ${searchResults.error}`);
      }

      console.log(`[Oracle] Found ${searchResults.results.length} results`);

      // 4. Verificar con Gemini
      console.log(`[Oracle] Verifying with Gemini AI...`);
      const geminiResponse = await geminiService.verifyScenario(
        scenario.title,
        scenario.description || '',
        scenario.verification_criteria,
        scenario.resolution_date,
        searchResults.results
      );

      if (!geminiResponse.success || !geminiResponse.result) {
        throw new Error(`Gemini verification failed: ${geminiResponse.error}`);
      }

      const verificationResult = geminiResponse.result;
      console.log(`[Oracle] Verification result: ${verificationResult.fulfilled ? 'FULFILLED' : 'NOT FULFILLED'} (confidence: ${verificationResult.confidence})`);

      // 5. Registrar la verificación en la base de datos
      await (supabase.rpc as any)('record_verification', {
        p_scenario_id: scenario.id,
        p_search_query: searchResults.query,
        p_search_results: searchResults.results,
        p_ai_prompt: `Verification for: ${scenario.title}`,
        p_ai_response: verificationResult,
        p_result: verificationResult.fulfilled ? 'fulfilled' : 'not_fulfilled',
        p_confidence: verificationResult.confidence,
        p_evidence_urls: verificationResult.evidenceUrls,
        p_analysis: verificationResult.analysis,
        p_execution_time: geminiResponse.executionTimeMs,
      });

      // 6. Si la confianza es suficiente y autoProcess está activo, procesar resultado
      let payoutProcessed = false;
      let payoutAmount = 0;
      let recipientId: string | undefined;

      if (autoProcess && verificationResult.confidence >= 0.75) {
        console.log(`[Oracle] Auto-processing payout...`);

        const processResult = await (supabase.rpc as any)('process_oracle_verification', {
          p_scenario_id: scenario.id,
          p_result: verificationResult.fulfilled ? 'fulfilled' : 'not_fulfilled',
          p_auto_process: true,
        });

        if (processResult.data?.success) {
          payoutProcessed = true;
          payoutAmount = processResult.data.payout?.payout_amount || scenario.theft_pool;
          recipientId = processResult.data.payout?.recipient_id || scenario.current_holder_id || undefined;

          // 7. Enviar notificación al holder
          if (recipientId) {
            const notificationMessage = await geminiService.generateNotificationMessage(
              scenario.title,
              verificationResult.fulfilled,
              payoutAmount
            );

            await notificationsService.create({
              userId: recipientId,
              type: verificationResult.fulfilled ? 'prediction_won' : 'prediction_lost',
              title: verificationResult.fulfilled ? '¡Apocalipsis Cumplido!' : 'Escenario Finalizado',
              message: notificationMessage,
              data: {
                scenario_id: scenario.id,
                fulfilled: verificationResult.fulfilled,
                payout_amount: payoutAmount,
              },
            });
          }
        }
      } else if (autoProcess) {
        console.log(`[Oracle] Confidence too low (${verificationResult.confidence}), marking for manual review`);

        // Marcar para revisión manual
        await (supabase
          .from('scenarios') as any)
          .update({
            ai_verification_result: verificationResult,
            ai_verification_date: new Date().toISOString(),
            appeal_status: 'pending', // Necesita revisión
          })
          .eq('id', scenario.id);
      }

      return {
        success: true,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        searchResults,
        verificationResult,
        payoutProcessed,
        payoutAmount,
        recipientId,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[Oracle] Error verifying scenario ${scenario.id}:`, error);

      // Registrar el error
      await (supabase
        .from('verification_logs') as any)
        .insert({
          scenario_id: scenario.id,
          search_query: scenario.title,
          verification_result: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          execution_time_ms: Date.now() - startTime,
        });

      return {
        success: false,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        payoutProcessed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      };
    }
  },

  // ============================================
  // PROCESAR TODOS LOS ESCENARIOS PENDIENTES
  // ============================================

  async processAllPending(autoProcess: boolean = true): Promise<OracleBatchResult> {
    const startTime = Date.now();
    const results: VerificationProcessResult[] = [];
    let fulfilled = 0;
    let notFulfilled = 0;
    let errors = 0;

    try {
      // Obtener escenarios pendientes
      const pendingScenarios = await this.getPendingScenarios();
      console.log(`[Oracle] Found ${pendingScenarios.length} scenarios to verify`);

      // Procesar en secuencia para evitar rate limits
      for (const scenario of pendingScenarios) {
        console.log(`[Oracle] Processing: ${scenario.title}`);

        const result = await this.verifyScenario(scenario, autoProcess);
        results.push(result);

        if (result.success) {
          if (result.verificationResult?.fulfilled) {
            fulfilled++;
          } else {
            notFulfilled++;
          }
        } else {
          errors++;
        }

        // Esperar un poco entre requests para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        totalScenarios: pendingScenarios.length,
        processed: results.length,
        fulfilled,
        notFulfilled,
        errors,
        results,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[Oracle] Batch processing error:', error);
      return {
        success: false,
        totalScenarios: 0,
        processed: 0,
        fulfilled: 0,
        notFulfilled: 0,
        errors: 1,
        results,
        executionTimeMs: Date.now() - startTime,
      };
    }
  },

  // ============================================
  // VERIFICACIÓN MANUAL (Admin)
  // ============================================

  async manualVerification(
    scenarioId: string,
    result: 'YES' | 'NO',
    adminNotes: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    try {
      // Registrar verificación manual
      await (supabase.from('verification_logs') as any).insert({
        scenario_id: scenarioId,
        search_query: 'MANUAL_VERIFICATION',
        verification_result: result === 'YES' ? 'fulfilled' : 'not_fulfilled',
        confidence_score: 1.0,
        analysis_summary: `Manual verification by admin: ${adminNotes}`,
      });

      // Procesar pago
      const processResult = await (supabase.rpc as any)('process_scenario_payout', {
        p_scenario_id: scenarioId,
        p_result: result,
      });

      if (processResult.error) {
        throw new Error(processResult.error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('[Oracle] Manual verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // ============================================
  // OBTENER CONFIGURACIÓN DEL ORÁCULO
  // ============================================

  async getConfig(): Promise<Record<string, any>> {
    const supabase = getSupabaseClient();

    const { data } = await (supabase
      .from('oracle_config') as any)
      .select('key, value');

    if (!data) return {};

    return data.reduce((acc: Record<string, any>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  },

  // ============================================
  // ACTUALIZAR CONFIGURACIÓN
  // ============================================

  async updateConfig(
    key: string,
    value: any
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    const { error } = await (supabase
      .from('oracle_config') as any)
      .upsert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  // ============================================
  // VERIFICAR ESTADO DE SERVICIOS
  // ============================================

  checkServicesStatus(): {
    googleSearch: boolean;
    gemini: boolean;
    allConfigured: boolean;
  } {
    const googleSearch = googleSearchService.isConfigured();
    const gemini = geminiService.isConfigured();

    return {
      googleSearch,
      gemini,
      allConfigured: googleSearch && gemini,
    };
  },
};
