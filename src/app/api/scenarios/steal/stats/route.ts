// src/app/api/scenarios/steal/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scenarioStealingService } from '@/services/scenarioStealing.service';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// GET - Obtener estadísticas de robo del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    let userId: string;

    if (targetUserId) {
      // Ver stats de otro usuario
      userId = targetUserId;
    } else {
      // Ver stats propias
      const { data: userData, error: userError } = await supabase()
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      userId = userData.id;
    }

    const stats = await scenarioStealingService.getUserStealStats(userId);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error in GET /api/scenarios/steal/stats:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
