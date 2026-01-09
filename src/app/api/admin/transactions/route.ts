import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List transactions with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const userId = searchParams.get('userId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:users!transactions_user_id_fkey(id, username, avatar_url)
      `, { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: transactions, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get transaction type stats
    const { data: typeStats } = await supabase
      .from('transactions')
      .select('type, amount');

    const stats: Record<string, { count: number; total: number }> = {};
    typeStats?.forEach(t => {
      if (!stats[t.type]) {
        stats[t.type] = { count: 0, total: 0 };
      }
      stats[t.type].count++;
      stats[t.type].total += t.amount || 0;
    });

    // Calculate totals
    const totalIn = typeStats?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalOut = typeStats?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

    return NextResponse.json({
      transactions,
      total: count,
      page,
      limit,
      stats,
      summary: {
        totalTransactions: count,
        totalIn,
        totalOut,
        netFlow: totalIn - totalOut
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create manual transaction (admin grant/deduct)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount, type, description } = body;

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, username, ap_coins')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type,
        description: description || `Admin ${amount > 0 ? 'grant' : 'deduction'}: ${type}`,
        balance_after: user.ap_coins + amount
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ ap_coins: user.ap_coins + amount })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: amount > 0 ? 'grant_coins' : 'deduct_coins',
      entity_type: 'transaction',
      entity_id: transaction.id,
      entity_name: user.username,
      changes: { amount, type, description }
    });

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: userId,
      type: amount > 0 ? 'reward' : 'system',
      title: amount > 0 ? 'AP Coins Recibidos' : 'Ajuste de Balance',
      message: `${amount > 0 ? 'Has recibido' : 'Se han deducido'} ${Math.abs(amount)} AP coins. ${description || ''}`,
      data: { transaction_id: transaction.id, amount }
    });

    return NextResponse.json({
      success: true,
      transaction,
      newBalance: user.ap_coins + amount
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
