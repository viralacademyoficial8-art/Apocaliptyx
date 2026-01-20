export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET - Obtener historial de transferencias de un escenario
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const scenarioId = params.id;

    // Obtener información del escenario y su creador
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select(`
        id,
        creator_id,
        steal_price,
        created_at,
        users!scenarios_creator_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', scenarioId)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ transfers: [] });
    }

    const creator = scenario.users as any;
    const transfers: any[] = [];

    // Agregar la creación como primera transferencia
    transfers.push({
      id: `creation_${scenarioId}`,
      scenarioId,
      fromUserId: 'system',
      fromUsername: 'Sistema',
      fromAvatar: '',
      toUserId: scenario.creator_id,
      toUsername: creator?.username || 'creador',
      toAvatar: creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator?.username || 'default'}`,
      price: 20, // Precio inicial de creación
      timestamp: scenario.created_at,
      type: 'creation',
    });

    // Obtener historial de robos
    const { data: steals, error: stealsError } = await supabase
      .from('scenario_steals')
      .select(`
        id,
        steal_price,
        stolen_at,
        previous_owner_id,
        new_owner_id,
        previous_owner:users!scenario_steals_previous_owner_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        new_owner:users!scenario_steals_new_owner_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('scenario_id', scenarioId)
      .order('stolen_at', { ascending: true });

    if (!stealsError && steals) {
      steals.forEach((steal, index) => {
        const prevOwner = steal.previous_owner as any;
        const newOwner = steal.new_owner as any;

        transfers.push({
          id: steal.id,
          scenarioId,
          fromUserId: steal.previous_owner_id,
          fromUsername: prevOwner?.username || 'usuario',
          fromAvatar: prevOwner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prevOwner?.username || 'default'}`,
          toUserId: steal.new_owner_id,
          toUsername: newOwner?.username || 'usuario',
          toAvatar: newOwner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newOwner?.username || 'default'}`,
          price: steal.steal_price,
          timestamp: steal.stolen_at,
          type: 'steal',
        });
      });
    }

    // Verificar si hay recuperaciones con escudo (shield recoveries)
    const { data: recoveries, error: recoveriesError } = await supabase
      .from('scenario_shield_recoveries')
      .select(`
        id,
        recovery_price,
        recovered_at,
        original_owner_id,
        stealer_id,
        original_owner:users!scenario_shield_recoveries_original_owner_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        stealer:users!scenario_shield_recoveries_stealer_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('scenario_id', scenarioId)
      .order('recovered_at', { ascending: true });

    if (!recoveriesError && recoveries) {
      recoveries.forEach((recovery) => {
        const originalOwner = recovery.original_owner as any;
        const stealer = recovery.stealer as any;

        transfers.push({
          id: recovery.id,
          scenarioId,
          fromUserId: recovery.stealer_id,
          fromUsername: stealer?.username || 'usuario',
          fromAvatar: stealer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stealer?.username || 'default'}`,
          toUserId: recovery.original_owner_id,
          toUsername: originalOwner?.username || 'usuario',
          toAvatar: originalOwner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${originalOwner?.username || 'default'}`,
          price: recovery.recovery_price || 0,
          timestamp: recovery.recovered_at,
          type: 'recovery',
        });
      });
    }

    // Ordenar todas las transferencias por fecha
    transfers.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      transfers,
      currentPrice: scenario.steal_price || 20,
    });
  } catch (error) {
    console.error('Error in GET history:', error);
    return NextResponse.json({ transfers: [], currentPrice: 20 });
  }
}
