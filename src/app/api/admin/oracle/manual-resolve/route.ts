// =====================================================
// API: Manual Resolve Scenario
// Permite a admins resolver manualmente un escenario
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { oracleService } from '@/services/oracle.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, result, notes } = body;

    if (!scenarioId || !result) {
      return NextResponse.json(
        { success: false, error: 'scenarioId and result are required' },
        { status: 400 }
      );
    }

    if (result !== 'YES' && result !== 'NO') {
      return NextResponse.json(
        { success: false, error: 'result must be YES or NO' },
        { status: 400 }
      );
    }

    const resolveResult = await oracleService.manualVerification(
      scenarioId,
      result,
      notes || 'Manual resolution by admin'
    );

    if (!resolveResult.success) {
      return NextResponse.json(
        { success: false, error: resolveResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scenario resolved as ${result}`,
    });
  } catch (error) {
    console.error('Error in manual resolve:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
