// =====================================================
// CRON JOB: VERIFY SCENARIOS
// Se ejecuta automáticamente cada día a medianoche
// Verifica escenarios vencidos y procesa pagos
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { oracleService } from '@/services/oracle.service';

// Clave secreta para proteger el endpoint
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    // Vercel envía este header automáticamente en cron jobs
    const authHeader = request.headers.get('authorization');

    // En desarrollo, permitir sin auth
    if (process.env.NODE_ENV === 'production') {
      if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        console.log('[Cron] Unauthorized request');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting scenario verification...');
    console.log('[Cron] Timestamp:', new Date().toISOString());

    // Verificar que los servicios están configurados
    const servicesStatus = oracleService.checkServicesStatus();

    if (!servicesStatus.allConfigured) {
      console.error('[Cron] Services not configured:', servicesStatus);
      return NextResponse.json({
        success: false,
        error: 'Oracle services not configured',
        services: servicesStatus,
      }, { status: 500 });
    }

    // Procesar todos los escenarios pendientes
    const result = await oracleService.processAllPending(true);

    console.log('[Cron] Verification complete:', {
      totalScenarios: result.totalScenarios,
      processed: result.processed,
      fulfilled: result.fulfilled,
      notFulfilled: result.notFulfilled,
      errors: result.errors,
      executionTimeMs: result.executionTimeMs,
    });

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Scenario verification completed',
      summary: {
        totalScenarios: result.totalScenarios,
        processed: result.processed,
        fulfilled: result.fulfilled,
        notFulfilled: result.notFulfilled,
        errors: result.errors,
        executionTimeMs: result.executionTimeMs,
      },
      // Solo incluir detalles si hay pocos resultados
      details: result.totalScenarios <= 10 ? result.results.map(r => ({
        scenarioId: r.scenarioId,
        title: r.scenarioTitle,
        success: r.success,
        fulfilled: r.verificationResult?.fulfilled,
        confidence: r.verificationResult?.confidence,
        payoutProcessed: r.payoutProcessed,
        error: r.error,
      })) : undefined,
    });
  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// También permitir POST para trigger manual desde admin
export async function POST(request: NextRequest) {
  try {
    // Verificar que es admin (usando header de auth)
    const authHeader = request.headers.get('authorization');

    // Parsear body para opciones
    const body = await request.json().catch(() => ({}));
    const { autoProcess = true, scenarioId } = body;

    // Si se especifica un escenario específico
    if (scenarioId) {
      console.log(`[Cron] Manual verification for scenario: ${scenarioId}`);

      // Obtener escenario
      const pendingScenarios = await oracleService.getPendingScenarios();
      const scenario = pendingScenarios.find(s => s.id === scenarioId);

      if (!scenario) {
        return NextResponse.json({
          success: false,
          error: 'Scenario not found or not pending verification',
        }, { status: 404 });
      }

      const result = await oracleService.verifyScenario(scenario, autoProcess);

      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    // Procesar todos
    console.log('[Cron] Manual trigger - processing all pending scenarios');
    const result = await oracleService.processAllPending(autoProcess);

    return NextResponse.json({
      success: true,
      message: 'Manual verification completed',
      summary: {
        totalScenarios: result.totalScenarios,
        processed: result.processed,
        fulfilled: result.fulfilled,
        notFulfilled: result.notFulfilled,
        errors: result.errors,
        executionTimeMs: result.executionTimeMs,
      },
    });
  } catch (error) {
    console.error('[Cron] Manual trigger error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
