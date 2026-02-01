export const dynamic = 'force-dynamic';

// src/app/api/feed/route.ts
// API para obtener el feed de actividad global de la plataforma
// Lee de la tabla feed_activities para persistencia garantizada

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export interface FeedItem {
  id: string;
  type: 'scenario_created' | 'scenario_stolen' | 'scenario_protected' | 'scenario_vote' | 'scenario_resolved' | 'scenario_closed' | 'live_stream' | 'achievement';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    isVerified: boolean;
  };
  metadata?: {
    scenarioId?: string;
    scenarioTitle?: string;
    amount?: number;
    voteType?: 'YES' | 'NO';
    outcome?: boolean;
    previousHolder?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filterType = searchParams.get('type'); // Optional type filter

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // Query feed_activities table with user data
    let query = supabase
      .from('feed_activities')
      .select(`
        id,
        type,
        title,
        description,
        icon,
        user_id,
        scenario_id,
        scenario_title,
        amount,
        vote_type,
        outcome,
        created_at,
        users:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        )
      `)
      .order('created_at', { ascending: false });

    // Apply type filter if provided
    if (filterType && filterType !== 'all') {
      if (filterType === 'votes_yes') {
        query = query.eq('type', 'scenario_vote').eq('vote_type', 'YES');
      } else if (filterType === 'votes_no') {
        query = query.eq('type', 'scenario_vote').eq('vote_type', 'NO');
      } else {
        query = query.eq('type', filterType);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error: activitiesError } = await query;

    if (activitiesError) {
      console.error('Error fetching feed activities:', activitiesError);
      // Fallback to legacy method if feed_activities table doesn't exist
      return await getLegacyFeed(supabase, limit, offset);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('feed_activities')
      .select('*', { count: 'exact', head: true });

    if (filterType && filterType !== 'all') {
      if (filterType === 'votes_yes') {
        countQuery = countQuery.eq('type', 'scenario_vote').eq('vote_type', 'YES');
      } else if (filterType === 'votes_no') {
        countQuery = countQuery.eq('type', 'scenario_vote').eq('vote_type', 'NO');
      } else {
        countQuery = countQuery.eq('type', filterType);
      }
    }

    const { count } = await countQuery;
    const total = count || 0;

    // Transform activities to FeedItem format
    const feedItems: FeedItem[] = (activities || []).map((activity: any) => {
      const user = activity.users as any;
      return {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        timestamp: activity.created_at,
        user: {
          id: user?.id || activity.user_id,
          username: user?.username || 'Usuario',
          displayName: user?.display_name || null,
          avatarUrl: user?.avatar_url || null,
          level: user?.level || 1,
          isVerified: user?.is_verified || false,
        },
        metadata: {
          scenarioId: activity.scenario_id || undefined,
          scenarioTitle: activity.scenario_title || undefined,
          amount: activity.amount ? Number(activity.amount) : undefined,
          voteType: activity.vote_type || undefined,
          outcome: activity.outcome,
        },
      };
    });

    const response = NextResponse.json({
      items: feedItems,
      total,
      hasMore: offset + limit < total,
    });

    // Prevent browser caching to ensure fresh data on reload
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching feed:', error);
    const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    errorResponse.headers.set('Cache-Control', 'no-store');
    return errorResponse;
  }
}

// Legacy fallback function for backwards compatibility
async function getLegacyFeed(supabase: any, limit: number, offset: number) {
  const feedItems: FeedItem[] = [];

  // 1. Escenarios creados recientemente
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      category,
      total_pool,
      created_at,
      creator_id,
      users:creator_id (
        id,
        username,
        display_name,
        avatar_url,
        level,
        is_verified
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (scenarios) {
    for (const scenario of scenarios) {
      const user = scenario.users as any;
      feedItems.push({
        id: `scenario_created_${scenario.id}`,
        type: 'scenario_created',
        title: 'Nuevo escenario creado',
        description: scenario.title,
        icon: '🎯',
        timestamp: scenario.created_at,
        user: {
          id: user?.id || scenario.creator_id,
          username: user?.username || 'Usuario',
          displayName: user?.display_name || null,
          avatarUrl: user?.avatar_url || null,
          level: user?.level || 1,
          isVerified: user?.is_verified || false,
        },
        metadata: {
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          amount: scenario.total_pool,
        },
      });
    }
  }

  // 2. Transacciones de robo (STEAL)
  const { data: steals } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      created_at,
      user_id,
      reference_id,
      reference_type,
      users (
        id,
        username,
        display_name,
        avatar_url,
        level,
        is_verified
      )
    `)
    .eq('type', 'STEAL')
    .order('created_at', { ascending: false })
    .limit(20);

  if (steals) {
    const stealScenarioIds = steals
      .filter((s: any) => s.reference_id && s.reference_type === 'scenario')
      .map((s: any) => s.reference_id as string);

    const { data: stealScenarios } = stealScenarioIds.length > 0
      ? await supabase.from('scenarios').select('id, title').in('id', stealScenarioIds)
      : { data: [] };

    const scenarioMap = new Map((stealScenarios || []).map((s: any) => [s.id, s]));

    for (const steal of steals) {
      const user = steal.users as any;
      const scenario = scenarioMap.get(steal.reference_id as string);
      if (user && scenario) {
        feedItems.push({
          id: `steal_${steal.id}`,
          type: 'scenario_stolen',
          title: 'Escenario robado',
          description: scenario.title,
          icon: '🦹',
          timestamp: steal.created_at,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            level: user.level || 1,
            isVerified: user.is_verified || false,
          },
          metadata: {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            amount: steal.amount,
          },
        });
      }
    }
  }

  // 3. Transacciones de protección (PROTECT)
  const { data: protects } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      created_at,
      user_id,
      reference_id,
      reference_type,
      users (
        id,
        username,
        display_name,
        avatar_url,
        level,
        is_verified
      )
    `)
    .eq('type', 'PROTECT')
    .order('created_at', { ascending: false })
    .limit(20);

  if (protects) {
    const protectScenarioIds = protects
      .filter((p: any) => p.reference_id && p.reference_type === 'scenario')
      .map((p: any) => p.reference_id as string);

    const { data: protectScenarios } = protectScenarioIds.length > 0
      ? await supabase.from('scenarios').select('id, title').in('id', protectScenarioIds)
      : { data: [] };

    const protectScenarioMap = new Map((protectScenarios || []).map((s: any) => [s.id, s]));

    for (const protect of protects) {
      const user = protect.users as any;
      const scenario = protectScenarioMap.get(protect.reference_id as string);
      if (user && scenario) {
        feedItems.push({
          id: `protect_${protect.id}`,
          type: 'scenario_protected',
          title: 'Escenario protegido',
          description: scenario.title,
          icon: '🛡️',
          timestamp: protect.created_at,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            level: user.level || 1,
            isVerified: user.is_verified || false,
          },
          metadata: {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            amount: protect.amount,
          },
        });
      }
    }
  }

  // 4. Predicciones/Votos recientes
  const { data: predictions } = await supabase
    .from('predictions')
    .select(`
      id,
      prediction,
      amount,
      created_at,
      user_id,
      scenario_id,
      users (
        id,
        username,
        display_name,
        avatar_url,
        level,
        is_verified
      ),
      scenarios (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false })
    .limit(30);

  if (predictions) {
    for (const pred of predictions) {
      const user = pred.users as any;
      const scenario = pred.scenarios as any;
      if (user && scenario) {
        const isYesVote = pred.prediction === 'YES' || pred.prediction === true;
        feedItems.push({
          id: `prediction_${pred.id}`,
          type: 'scenario_vote',
          title: isYesVote ? 'Voto SI' : 'Voto NO',
          description: scenario.title,
          icon: isYesVote ? '👍' : '👎',
          timestamp: pred.created_at,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            level: user.level || 1,
            isVerified: user.is_verified || false,
          },
          metadata: {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            amount: pred.amount,
            voteType: isYesVote ? 'YES' : 'NO',
          },
        });
      }
    }
  }

  // 5. Escenarios resueltos/cerrados
  const { data: resolved } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      outcome,
      resolved_at,
      total_pool,
      creator_id,
      users:creator_id (
        id,
        username,
        display_name,
        avatar_url,
        level,
        is_verified
      )
    `)
    .not('resolved_at', 'is', null)
    .order('resolved_at', { ascending: false })
    .limit(15);

  if (resolved) {
    for (const scenario of resolved) {
      const user = scenario.users as any;
      if (user) {
        feedItems.push({
          id: `resolved_${scenario.id}`,
          type: scenario.outcome !== null ? 'scenario_resolved' : 'scenario_closed',
          title: scenario.outcome !== null ? 'Escenario resuelto' : 'Escenario cerrado',
          description: scenario.title,
          icon: scenario.outcome !== null ? '✅' : '🔒',
          timestamp: scenario.resolved_at,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            level: user.level || 1,
            isVerified: user.is_verified || false,
          },
          metadata: {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            outcome: scenario.outcome,
            amount: scenario.total_pool,
          },
        });
      }
    }
  }

  // Sort by timestamp
  feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const paginatedItems = feedItems.slice(offset, offset + limit);

  const response = NextResponse.json({
    items: paginatedItems,
    total: feedItems.length,
    hasMore: offset + limit < feedItems.length,
  });

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
