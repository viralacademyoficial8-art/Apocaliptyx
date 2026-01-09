import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List warnings
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
    const userId = searchParams.get('userId') || '';
    const severity = searchParams.get('severity') || '';
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_warnings')
      .select(`
        *,
        user:users!user_warnings_user_id_fkey(id, username, display_name, avatar_url),
        admin:users!user_warnings_admin_id_fkey(id, username, display_name)
      `, { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (active !== null && active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    const { data: warnings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      warnings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching warnings:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create warning
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, reason, warning_type, severity, details, expires_days } = body;

    if (!userId || !reason || !warning_type) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Use the warn_user function
    const { data, error } = await supabase.rpc('warn_user', {
      p_admin_id: adminUser.id,
      p_user_id: userId,
      p_reason: reason,
      p_warning_type: warning_type,
      p_severity: severity || 'low',
      p_details: details,
      p_expires_days: expires_days
    });

    if (error) throw error;

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'SYSTEM_ANNOUNCEMENT',
      title: 'Has recibido una advertencia',
      message: reason,
      data: { warning_type, severity }
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Error creating warning:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update warning (deactivate, acknowledge)
export async function PATCH(request: NextRequest) {
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: previous } = await supabase
      .from('user_warnings')
      .select('*')
      .eq('id', id)
      .single();

    let updates: Record<string, unknown> = {};

    if (action === 'deactivate') {
      updates = { is_active: false };
    } else if (action === 'activate') {
      updates = { is_active: true };
    }

    const { data: warning, error } = await supabase
      .from('user_warnings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: action === 'deactivate' ? 'deactivate_warning' : 'activate_warning',
      entity_type: 'warning',
      entity_id: id,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, warning });
  } catch (error) {
    console.error('Error updating warning:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete warning
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: warning } = await supabase
      .from('user_warnings')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('user_warnings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'warning',
      entity_id: id,
      previous_values: warning
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting warning:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
