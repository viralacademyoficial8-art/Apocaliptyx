export const dynamic = 'force-dynamic';

// src/app/api/scenarios/steal/leaderboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { scenarioStealingService } from '@/services/scenarioStealing.service';

// GET - Obtener top ladrones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const topThieves = await scenarioStealingService.getTopThieves(limit);

    return NextResponse.json({
      leaderboard: topThieves
    });
  } catch (error: any) {
    console.error('Error in GET /api/scenarios/steal/leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
