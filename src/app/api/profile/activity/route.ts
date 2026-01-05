// src/app/api/profile/activity/route.ts

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

    // Get recent transactions as activity
    const { data: transactions, error } = await getSupabaseAdmin()
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        description,
        created_at,
        scenarios (
          title
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const activityIcons: Record<string, string> = {
      PURCHASE: '🛒',
      SALE: '💰',
      STEAL: '🦹',
      WIN: '🏆',
      LOSS: '😢',
      REWARD: '🎁',
      PURCHASE_COINS: '💎',
      DAILY_BONUS: '📅',
      ACHIEVEMENT: '🏅',
      REFERRAL: '👥',
    };

    const activityTitles: Record<string, string> = {
      PURCHASE: 'Compra de escenario',
      SALE: 'Venta de escenario',
      STEAL: 'Robo exitoso',
      WIN: '¡Predicción ganada!',
      LOSS: 'Predicción perdida',
      REWARD: 'Recompensa del sistema',
      PURCHASE_COINS: 'Compra de AP Coins',
      DAILY_BONUS: 'Bonus diario',
      ACHIEVEMENT: '¡Logro desbloqueado!',
      REFERRAL: 'Bonus de referido',
    };

    const activity = (transactions || []).map((tx: any) => ({
      id: tx.id,
      type: mapTransactionType(tx.type),
      title: activityTitles[tx.type] || tx.type,
      description: tx.description || 
        (tx.scenarios?.title ? `"${tx.scenarios.title}" - ${tx.amount.toLocaleString()} AP` : `${tx.amount.toLocaleString()} AP`),
      icon: activityIcons[tx.type] || '📋',
      timestamp: tx.created_at,
      metadata: {
        amount: tx.amount,
        scenarioTitle: tx.scenarios?.title,
      },
    }));

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapTransactionType(type: string): 'PREDICTION' | 'ACHIEVEMENT' | 'PURCHASE' | 'LEVEL_UP' | 'STEAL' | 'STOLEN' {
  switch (type) {
    case 'STEAL':
      return 'STEAL';
    case 'SALE':
      return 'STOLEN';
    case 'ACHIEVEMENT':
      return 'ACHIEVEMENT';
    case 'PURCHASE':
    case 'PURCHASE_COINS':
      return 'PURCHASE';
    default:
      return 'PREDICTION';
  }
}
