import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List audit logs
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId') || '';
    const entityType = searchParams.get('entityType') || '';
    const action = searchParams.get('action') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('admin_audit_logs')
      .select(`
        *,
        admin:users!admin_audit_logs_admin_id_fkey(id, username, display_name, avatar_url)
      `, { count: 'exact' });

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get unique entity types for filters
    const { data: entityTypes } = await supabase
      .from('admin_audit_logs')
      .select('entity_type')
      .limit(100);

    const uniqueEntityTypes = [...new Set(entityTypes?.map(e => e.entity_type) || [])];

    // Get unique actions for filters
    const { data: actions } = await supabase
      .from('admin_audit_logs')
      .select('action')
      .limit(100);

    const uniqueActions = [...new Set(actions?.map(a => a.action) || [])];

    // Get admin list for filters
    const { data: admins } = await supabase
      .from('users')
      .select('id, username, display_name')
      .in('role', ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']);

    return NextResponse.json({
      logs,
      filters: {
        entityTypes: uniqueEntityTypes,
        actions: uniqueActions,
        admins
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET stats for dashboard
export async function POST(request: NextRequest) {
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'stats') {
      // Get stats for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentLogs, count: totalLogs } = await supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Group by action
      const actionCounts: Record<string, number> = {};
      recentLogs?.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      // Group by entity type
      const entityCounts: Record<string, number> = {};
      recentLogs?.forEach(log => {
        entityCounts[log.entity_type] = (entityCounts[log.entity_type] || 0) + 1;
      });

      // Group by admin
      const adminCounts: Record<string, number> = {};
      recentLogs?.forEach(log => {
        adminCounts[log.admin_id] = (adminCounts[log.admin_id] || 0) + 1;
      });

      // Get admin names
      const adminIds = Object.keys(adminCounts);
      const { data: adminNames } = await supabase
        .from('users')
        .select('id, username, display_name')
        .in('id', adminIds);

      const adminStats = Object.entries(adminCounts).map(([id, count]) => {
        const admin = adminNames?.find(a => a.id === id);
        return {
          id,
          username: admin?.username || 'Unknown',
          display_name: admin?.display_name,
          count
        };
      }).sort((a, b) => b.count - a.count);

      return NextResponse.json({
        totalLogs,
        actionCounts,
        entityCounts,
        adminStats,
        period: '7 days'
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error getting audit stats:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
