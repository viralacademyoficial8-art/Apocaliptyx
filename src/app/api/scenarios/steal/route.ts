export const dynamic = 'force-dynamic';

// src/app/api/scenarios/steal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scenarioStealingService } from '@/services/scenarioStealing.service';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { hasInfiniteCoins, UserRole } from '@/types/roles';
import { notificationsService } from '@/services/notifications.service';

const supabase = () => getSupabaseAdmin();

// GET - Obtener información de robo de un escenario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'scenarioId es requerido' },
        { status: 400 }
      );
    }

    const stealInfo = await scenarioStealingService.getScenarioStealInfo(scenarioId);

    if (!stealInfo) {
      return NextResponse.json(
        { error: 'Escenario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(stealInfo);
  } catch (error: any) {
    console.error('Error in GET /api/scenarios/steal:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

// POST - Robar un escenario
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
    const { scenarioId } = body;

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'scenarioId es requerido' },
        { status: 400 }
      );
    }

    // Obtener el ID del usuario desde la base de datos
    // Usar ilike para búsqueda case-insensitive del email
    const normalizedEmail = session.user.email.toLowerCase().trim();
    const { data: userData, error: userError } = await supabase()
      .from('users')
      .select('id, ap_coins, role')
      .ilike('email', normalizedEmail)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario tiene coins infinitas
    const userHasInfiniteCoins = hasInfiniteCoins(userData.role as UserRole || 'USER');
    const originalBalance = userData.ap_coins;

    // IMPORTANTE: Obtener info del escenario ANTES del robo para la notificación
    const scenarioInfo = await scenarioStealingService.getScenarioStealInfo(scenarioId);
    const originalHolderId = scenarioInfo?.currentHolderId;
    const scenarioTitle = scenarioInfo?.title || 'Escenario';

    // Obtener username del ladrón para la notificación
    const { data: thiefData } = await supabase()
      .from('users')
      .select('username, display_name')
      .eq('id', userData.id)
      .single();
    const thiefUsername = thiefData?.display_name || thiefData?.username || 'Usuario';

    // Ejecutar el robo
    const result = await scenarioStealingService.stealScenario(scenarioId, userData.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Si el usuario tiene coins infinitas, restaurar su balance
    if (userHasInfiniteCoins && result.stealPrice) {
      await supabase()
        .from('users')
        .update({ ap_coins: originalBalance })
        .eq('id', userData.id);
    }

    // NOTIFICACIÓN: Avisar al propietario original que le robaron el escenario
    if (originalHolderId && originalHolderId !== userData.id) {
      try {
        await notificationsService.notifyScenarioStolen(
          originalHolderId,
          scenarioTitle,
          thiefUsername,
          scenarioId
        );
      } catch (notifError) {
        // No fallar el robo si la notificación falla
        console.error('Error sending steal notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: '¡Escenario robado exitosamente!',
      stealPrice: result.stealPrice,
      nextPrice: result.nextPrice,
      poolTotal: result.poolTotal,
      stealNumber: result.stealNumber
    });
  } catch (error: any) {
    console.error('Error in POST /api/scenarios/steal:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
