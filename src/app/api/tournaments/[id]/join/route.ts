import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notificationsService } from '@/services/notifications.service';

interface TournamentRow {
  id: string;
  name: string;
  status: string;
  max_participants?: number;
  participants_count: number;
  entry_fee: number;
}

// POST /api/tournaments/[id]/join - Join a tournament
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tournamentId = params.id;

    // Get tournament
    const { data: tournamentRaw, error: tournamentError } = await supabase
      .from('prediction_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournamentRaw) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    const tournament = tournamentRaw as TournamentRow;

    // Validate tournament status
    if (tournament.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Solo puedes unirte a torneos próximos' },
        { status: 400 }
      );
    }

    // Check if full
    if (tournament.max_participants && tournament.participants_count >= tournament.max_participants) {
      return NextResponse.json(
        { error: 'El torneo está lleno' },
        { status: 400 }
      );
    }

    // Check if already joined
    const { data: existingParticipant } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este torneo' },
        { status: 400 }
      );
    }

    // Check entry fee
    if (tournament.entry_fee > 0) {
      const { data: userDataRaw } = await supabase
        .from('users')
        .select('ap_coins')
        .eq('id', user.id)
        .single();

      const userData = userDataRaw as { ap_coins?: number } | null;

      if (!userData || (userData.ap_coins || 0) < tournament.entry_fee) {
        return NextResponse.json(
          { error: 'No tienes suficientes AP Coins' },
          { status: 400 }
        );
      }

      // Deduct entry fee
      await supabase.rpc('log_ap_transaction' as never, {
        p_user_id: user.id,
        p_amount: -tournament.entry_fee,
        p_type: 'tournament_entry',
        p_description: `Entrada al torneo: ${tournament.name}`,
        p_reference_id: tournamentId,
      } as never);
    }

    // Join tournament
    const { error: joinError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
      } as never);

    if (joinError) throw joinError;

    // Increment participant count
    await supabase
      .from('prediction_tournaments')
      .update({ participants_count: tournament.participants_count + 1 } as never)
      .eq('id', tournamentId);

    // Send notification for successful tournament registration
    await notificationsService.notifyTournamentJoined(
      user.id,
      tournament.name,
      tournamentId,
      tournament.entry_fee > 0 ? tournament.entry_fee : undefined
    );

    return NextResponse.json({
      success: true,
      message: tournament.entry_fee > 0
        ? `Te has inscrito por ${tournament.entry_fee} AP`
        : 'Te has inscrito al torneo',
    });
  } catch (error) {
    console.error('Error joining tournament:', error);
    return NextResponse.json(
      { error: 'Error al unirse al torneo' },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id]/join - Leave a tournament
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tournamentId = params.id;

    // Get tournament
    const { data: tournamentRaw2 } = await supabase
      .from('prediction_tournaments')
      .select('status, participants_count')
      .eq('id', tournamentId)
      .single();

    const tournament2 = tournamentRaw2 as { status: string; participants_count: number } | null;

    if (!tournament2) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    if (tournament2.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'No puedes abandonar un torneo en curso' },
        { status: 400 }
      );
    }

    // Leave tournament
    const { error: leaveError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id);

    if (leaveError) throw leaveError;

    // Decrement participant count
    await supabase
      .from('prediction_tournaments')
      .update({ participants_count: Math.max(0, tournament2.participants_count - 1) } as never)
      .eq('id', tournamentId);

    return NextResponse.json({
      success: true,
      message: 'Has abandonado el torneo',
    });
  } catch (error) {
    console.error('Error leaving tournament:', error);
    return NextResponse.json(
      { error: 'Error al abandonar el torneo' },
      { status: 500 }
    );
  }
}
