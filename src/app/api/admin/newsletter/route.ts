export const dynamic = 'force-dynamic';

// src/app/api/admin/newsletter/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const { data } = await supabase()
    .from('users')
    .select('role')
    .eq('email', email)
    .single();

  return data?.role && ['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(data.role);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase()
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Get paginated results
    const { data: subscribers, count, error } = await query
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // If table doesn't exist, return empty data
      if (error.code === '42P01') {
        return NextResponse.json({
          subscribers: [],
          total: 0,
          stats: { total: 0, active: 0, inactive: 0, thisWeek: 0, thisMonth: 0 },
        });
      }
      throw error;
    }

    // Get stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { count: totalCount } = await supabase()
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase()
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: weekCount } = await supabase()
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString());

    const { count: monthCount } = await supabase()
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', monthAgo.toISOString());

    const stats = {
      total: totalCount || 0,
      active: activeCount || 0,
      inactive: (totalCount || 0) - (activeCount || 0),
      thisWeek: weekCount || 0,
      thisMonth: monthCount || 0,
    };

    return NextResponse.json({
      subscribers: subscribers || [],
      total: count || 0,
      stats,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/admin/newsletter:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
