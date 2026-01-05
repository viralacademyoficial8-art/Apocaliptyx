// src/app/api/scenarios/steal/stealable/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scenarioStealingService } from '@/services/scenarioStealing.service';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// GET - Obtener escenarios que se pueden robar
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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Obtener el ID del usuario desde la base de datos
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

    const scenarios = await scenarioStealingService.getStealableScenarios(userData.id, limit);

    // Enriquecer con información de holders
    const enrichedScenarios = await Promise.all(
      scenarios.map(async (scenario) => {
        const { data: holder } = await supabase()
          .from('users')
          .select('id, username, display_name, avatar_url')
          .eq('id', scenario.current_holder_id || scenario.creator_id)
          .single();

        return {
          ...scenario,
          holder: holder ? {
            id: holder.id,
            username: holder.display_name || holder.username,
            avatarUrl: holder.avatar_url
          } : null
        };
      })
    );

    return NextResponse.json({
      scenarios: enrichedScenarios,
      total: enrichedScenarios.length
    });
  } catch (error: any) {
    console.error('Error in GET /api/scenarios/steal/stealable:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
