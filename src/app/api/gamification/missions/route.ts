export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface MissionDef {
  name: string;
  name_es: string;
  description?: string;
  description_es?: string;
  icon: string;
  difficulty: string;
  mission_type: string;
  requirements?: { count?: number };
  rewards?: { ap_coins?: number; xp?: number };
}

interface UserMission {
  id: string;
  mission_id: string;
  progress?: { current?: number };
  is_completed: boolean;
  claimed_at?: string;
  expires_at: string;
  mission?: MissionDef;
}

// GET /api/gamification/missions - Get user's missions
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Assign daily missions if needed
    await supabase.rpc('assign_daily_missions' as never, { p_user_id: user.id } as never);

    // Get user's current missions
    const { data: userMissionsRaw, error } = await supabase
      .from('user_missions')
      .select(`
        *,
        mission:mission_definitions(*)
      `)
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    const userMissions = userMissionsRaw as UserMission[] | null;

    // Separate daily and weekly missions
    const dailyMissions = userMissions?.filter(
      um => um.mission?.mission_type === 'daily'
    ).map(um => ({
      id: um.id,
      missionId: um.mission_id,
      name: um.mission?.name,
      nameEs: um.mission?.name_es,
      description: um.mission?.description,
      descriptionEs: um.mission?.description_es,
      icon: um.mission?.icon,
      difficulty: um.mission?.difficulty,
      progress: um.progress?.current || 0,
      target: um.mission?.requirements?.count || 1,
      rewards: um.mission?.rewards || {},
      isCompleted: um.is_completed,
      isClaimed: !!um.claimed_at,
      expiresAt: um.expires_at,
    })) || [];

    const weeklyMissions = userMissions?.filter(
      um => um.mission?.mission_type === 'weekly'
    ).map(um => ({
      id: um.id,
      missionId: um.mission_id,
      name: um.mission?.name,
      nameEs: um.mission?.name_es,
      description: um.mission?.description,
      descriptionEs: um.mission?.description_es,
      icon: um.mission?.icon,
      difficulty: um.mission?.difficulty,
      progress: um.progress?.current || 0,
      target: um.mission?.requirements?.count || 1,
      rewards: um.mission?.rewards || {},
      isCompleted: um.is_completed,
      isClaimed: !!um.claimed_at,
      expiresAt: um.expires_at,
    })) || [];

    return NextResponse.json({
      daily: dailyMissions,
      weekly: weeklyMissions,
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Error al obtener misiones' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/missions - Claim mission reward
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { missionId } = await request.json();

    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID requerido' }, { status: 400 });
    }

    // Get the user mission
    const { data: userMissionRaw, error: fetchError } = await supabase
      .from('user_missions')
      .select('*, mission:mission_definitions(*)')
      .eq('id', missionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !userMissionRaw) {
      return NextResponse.json({ error: 'Misión no encontrada' }, { status: 404 });
    }

    const userMission = userMissionRaw as UserMission;

    if (!userMission.is_completed) {
      return NextResponse.json({ error: 'Misión no completada' }, { status: 400 });
    }

    if (userMission.claimed_at) {
      return NextResponse.json({ error: 'Recompensa ya reclamada' }, { status: 400 });
    }

    // Get rewards
    const rewards = userMission.mission?.rewards || {};

    // Give AP coins if any
    if (rewards.ap_coins) {
      await supabase.rpc('log_ap_transaction' as never, {
        p_user_id: user.id,
        p_amount: rewards.ap_coins,
        p_type: 'mission',
        p_description: `Misión completada: ${userMission.mission?.name_es}`,
        p_reference_id: userMission.mission_id,
      } as never);
    }

    // Mark as claimed
    const { error: updateError } = await supabase
      .from('user_missions')
      .update({ claimed_at: new Date().toISOString() } as never)
      .eq('id', missionId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      rewards,
      message: '¡Recompensa reclamada!',
    });
  } catch (error) {
    console.error('Error claiming mission:', error);
    return NextResponse.json(
      { error: 'Error al reclamar recompensa' },
      { status: 500 }
    );
  }
}
