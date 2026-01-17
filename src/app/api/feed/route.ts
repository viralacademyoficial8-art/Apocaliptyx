export const dynamic = 'force-dynamic';

// src/app/api/feed/route.ts
// API para obtener el feed de actividad global de la plataforma

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
    const following = searchParams.get('following') === 'true';
    const userId = searchParams.get('userId');

    const supabase = getSupabaseAdmin();
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
        users!scenarios_creator_id_fkey (
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
        if (user) {
          feedItems.push({
            id: `scenario_created_${scenario.id}`,
            type: 'scenario_created',
            title: 'Nuevo escenario creado',
            description: scenario.title,
            icon: '🎯',
            timestamp: scenario.created_at,
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
              amount: scenario.total_pool,
            },
          });
        }
      }
    }

    // 2. Transacciones de robo (STEAL)
    const { data: steals } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        created_at,
        user_id,
        scenario_id,
        users!transactions_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        ),
        scenarios!transactions_scenario_id_fkey (
          id,
          title
        )
      `)
      .eq('type', 'STEAL')
      .order('created_at', { ascending: false })
      .limit(20);

    if (steals) {
      for (const steal of steals) {
        const user = steal.users as any;
        const scenario = steal.scenarios as any;
        if (user && scenario) {
          feedItems.push({
            id: `steal_${steal.id}`,
            type: 'scenario_stolen',
            title: '¡Escenario robado!',
            description: `${user.display_name || user.username} robó "${scenario.title}"`,
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
        description,
        created_at,
        user_id,
        scenario_id,
        users!transactions_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        ),
        scenarios!transactions_scenario_id_fkey (
          id,
          title
        )
      `)
      .eq('type', 'PROTECT')
      .order('created_at', { ascending: false })
      .limit(20);

    if (protects) {
      for (const protect of protects) {
        const user = protect.users as any;
        const scenario = protect.scenarios as any;
        if (user && scenario) {
          feedItems.push({
            id: `protect_${protect.id}`,
            type: 'scenario_protected',
            title: '¡Escenario protegido!',
            description: `${user.display_name || user.username} protegió "${scenario.title}"`,
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

    // 4. Predicciones/Votos recientes en escenarios
    const { data: predictions } = await supabase
      .from('predictions')
      .select(`
        id,
        prediction,
        amount,
        created_at,
        user_id,
        scenario_id,
        users!predictions_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        ),
        scenarios!predictions_scenario_id_fkey (
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
            title: isYesVote ? 'Votó SÍ' : 'Votó NO',
            description: `${user.display_name || user.username} apostó ${pred.amount?.toLocaleString() || 0} AP en "${scenario.title}"`,
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
        users!scenarios_creator_id_fkey (
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
            title: scenario.outcome !== null ? '¡Escenario resuelto!' : 'Escenario cerrado',
            description: scenario.outcome !== null
              ? `"${scenario.title}" - Resultado: ${scenario.outcome ? 'SÍ sucedió' : 'NO sucedió'}`
              : `"${scenario.title}" fue cerrado`,
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

    // 6. Logros desbloqueados
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        user_id,
        achievement_id,
        users!user_achievements_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        ),
        achievements (
          id,
          name,
          description,
          icon
        )
      `)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    if (achievements) {
      for (const ua of achievements) {
        const user = ua.users as any;
        const achievement = ua.achievements as any;
        if (user && achievement) {
          feedItems.push({
            id: `achievement_${ua.id}`,
            type: 'achievement',
            title: '¡Logro desbloqueado!',
            description: `${user.display_name || user.username} desbloqueó "${achievement.name}"`,
            icon: achievement.icon || '🏆',
            timestamp: ua.unlocked_at,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.display_name,
              avatarUrl: user.avatar_url,
              level: user.level || 1,
              isVerified: user.is_verified || false,
            },
          });
        }
      }
    }

    // 7. Transmisiones en vivo
    const { data: streams } = await supabase
      .from('live_streams')
      .select(`
        id,
        title,
        status,
        started_at,
        created_at,
        user_id,
        users!live_streams_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          is_verified
        )
      `)
      .eq('status', 'live')
      .order('started_at', { ascending: false })
      .limit(10);

    if (streams) {
      for (const stream of streams) {
        const user = stream.users as any;
        if (user) {
          feedItems.push({
            id: `stream_${stream.id}`,
            type: 'live_stream',
            title: '¡En vivo ahora!',
            description: `${user.display_name || user.username} está transmitiendo: "${stream.title}"`,
            icon: '🔴',
            timestamp: stream.started_at || stream.created_at,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.display_name,
              avatarUrl: user.avatar_url,
              level: user.level || 1,
              isVerified: user.is_verified || false,
            },
          });
        }
      }
    }

    // Ordenar por timestamp (más reciente primero)
    feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Aplicar paginación
    const paginatedItems = feedItems.slice(offset, offset + limit);

    return NextResponse.json({
      items: paginatedItems,
      total: feedItems.length,
      hasMore: offset + limit < feedItems.length,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
