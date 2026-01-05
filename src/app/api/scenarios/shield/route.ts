// src/app/api/scenarios/shield/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scenarioStealingService, SHIELD_TYPES } from '@/services/scenarioStealing.service';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// GET - Obtener tipos de escudo disponibles
export async function GET() {
  return NextResponse.json({
    shields: Object.values(SHIELD_TYPES)
  });
}

// POST - Aplicar escudo a un escenario
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { scenarioId, shieldType } = body;

    if (!scenarioId || !shieldType) {
      return NextResponse.json(
        { error: 'scenarioId y shieldType son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de escudo
    if (!SHIELD_TYPES[shieldType as keyof typeof SHIELD_TYPES]) {
      return NextResponse.json(
        { error: 'Tipo de escudo no válido. Opciones: basic, premium, ultimate' },
        { status: 400 }
      );
    }

    // Obtener el ID del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase()
      .from('users')
      .select('id, ap_coins')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que sea el holder del escenario
    const { data: scenario } = await supabase()
      .from('scenarios')
      .select('current_holder_id, creator_id, steal_count')
      .eq('id', scenarioId)
      .single();

    if (!scenario) {
      return NextResponse.json(
        { error: 'Escenario no encontrado' },
        { status: 404 }
      );
    }

    // Solo el holder actual puede proteger
    const isHolder = scenario.current_holder_id === userData.id;
    const isCreatorAndNeverStolen = scenario.creator_id === userData.id && scenario.steal_count === 0;

    if (!isHolder && !isCreatorAndNeverStolen) {
      return NextResponse.json(
        { error: 'Solo el propietario actual puede proteger este escenario' },
        { status: 403 }
      );
    }

    // Aplicar escudo
    const result = await scenarioStealingService.applyShield(
      scenarioId,
      userData.id,
      shieldType as keyof typeof SHIELD_TYPES
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '¡Escudo aplicado exitosamente!',
      protectedUntil: result.protectedUntil,
      shieldType: result.shieldType
    });
  } catch (error: any) {
    console.error('Error in POST /api/scenarios/shield:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
