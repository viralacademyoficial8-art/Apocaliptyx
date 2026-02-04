// API endpoint for resolving scenarios and processing payouts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { notificationsService } from '@/services/notifications.service';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get current user and verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'No tienes permisos para esta acción' }, { status: 403 });
    }

    const body = await request.json();
    const { scenario_id, result } = body;

    if (!scenario_id || !result || !['YES', 'NO'].includes(result)) {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Se requiere scenario_id y result (YES/NO)' },
        { status: 400 }
      );
    }

    // Get scenario info before resolution
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*, current_holder:users!scenarios_current_holder_id_fkey(id, username)')
      .eq('id', scenario_id)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Escenario no encontrado' }, { status: 404 });
    }

    if (scenario.status === 'RESOLVED') {
      return NextResponse.json({ error: 'El escenario ya ha sido resuelto' }, { status: 400 });
    }

    // Call the RPC function to process the payout
    const { data: payoutResult, error: payoutError } = await supabase.rpc('process_scenario_payout', {
      p_scenario_id: scenario_id,
      p_result: result,
    });

    if (payoutError) {
      console.error('Error processing payout:', payoutError);
      return NextResponse.json({ error: payoutError.message }, { status: 500 });
    }

    const resultData = payoutResult as {
      success: boolean;
      payout_id?: string;
      recipient_id?: string;
      payout_amount?: number;
      was_fulfilled?: boolean;
      transaction_id?: string;
      error?: string;
    };

    if (!resultData.success) {
      return NextResponse.json({ error: resultData.error || 'Error al procesar el pago' }, { status: 500 });
    }

    // Send notification to the holder
    const holderId = resultData.recipient_id;
    if (holderId) {
      if (resultData.was_fulfilled && resultData.payout_amount && resultData.payout_amount > 0) {
        // Notification for fulfilled scenario
        await notificationsService.create(
          holderId,
          'scenario_resolved',
          `¡Felicitaciones! Tu escenario "${scenario.title}" se ha cumplido`,
          `Has recibido ${resultData.payout_amount.toLocaleString()} AP Coins como recompensa por ser el último holder.`,
          `/escenario/${scenario_id}`,
          {
            scenario_id,
            scenario_title: scenario.title,
            result,
            payout_amount: resultData.payout_amount,
            was_fulfilled: true,
          }
        );
      } else {
        // Notification for unfulfilled scenario
        await notificationsService.create(
          holderId,
          'scenario_resolved',
          `Tu escenario "${scenario.title}" no se cumplió`,
          `El escenario ha sido marcado como no cumplido. El pool acumulado permanece en el sistema.`,
          `/escenario/${scenario_id}`,
          {
            scenario_id,
            scenario_title: scenario.title,
            result,
            payout_amount: 0,
            was_fulfilled: false,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: resultData.was_fulfilled
        ? `Escenario resuelto como CUMPLIDO. Se pagaron ${resultData.payout_amount?.toLocaleString()} AP al holder.`
        : 'Escenario resuelto como NO CUMPLIDO. No se realizó pago.',
      data: resultData,
    });
  } catch (error) {
    console.error('Error resolving scenario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
