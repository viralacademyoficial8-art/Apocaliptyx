export const dynamic = 'force-dynamic';

// src/app/api/profile/history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const { data: currentUser } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's scenario holdings (predictions)
    const { data: holdings, error } = await getSupabaseAdmin()
      .from('scenario_holdings')
      .select(`
        id,
        purchase_price,
        purchased_at,
        sold_at,
        sold_price,
        is_current_holder,
        scenarios (
          id,
          title,
          category,
          status,
          outcome,
          resolved_at
        )
      `)
      .eq('user_id', currentUser.id)
      .order('purchased_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const history = (holdings || []).map((holding: any) => {
      const scenario = holding.scenarios;
      let result: 'WON' | 'LOST' | 'PENDING' | 'CANCELLED' = 'PENDING';
      let profit = 0;

      if (scenario?.status === 'CANCELLED') {
        result = 'CANCELLED';
      } else if (scenario?.outcome !== null && !holding.is_current_holder) {
        // Scenario resolved and user sold
        profit = (holding.sold_price || 0) - holding.purchase_price;
        result = profit > 0 ? 'WON' : 'LOST';
      } else if (scenario?.outcome !== null) {
        // Scenario resolved, user still holds
        result = scenario.outcome ? 'WON' : 'LOST';
        profit = scenario.outcome ? holding.purchase_price * 0.5 : -holding.purchase_price;
      }

      return {
        id: holding.id,
        scenarioId: scenario?.id,
        scenarioTitle: scenario?.title || 'Unknown Scenario',
        scenarioCategory: scenario?.category || 'OTROS',
        prediction: 'UP',
        amount: holding.purchase_price,
        result,
        profit,
        createdAt: holding.purchased_at,
        resolvedAt: scenario?.resolved_at || holding.sold_at,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
