import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List announcements
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
    const active = searchParams.get('active');
    const type = searchParams.get('type') || '';

    let query = supabase
      .from('admin_announcements')
      .select('*, creator:users!admin_announcements_created_by_fkey(username, display_name)', { count: 'exact' });

    if (active !== null && active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: announcements, count, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ announcements, total: count });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create announcement
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
    const {
      title,
      title_es,
      content,
      content_es,
      type,
      priority,
      target_audience,
      target_user_ids,
      image_url,
      action_url,
      action_label,
      is_dismissible,
      is_pinned,
      starts_at,
      ends_at
    } = body;

    if (!title || !title_es || !content || !content_es) {
      return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });
    }

    const { data: announcement, error } = await supabase
      .from('admin_announcements')
      .insert({
        title,
        title_es,
        content,
        content_es,
        type: type || 'info',
        priority: priority || 'normal',
        target_audience: target_audience || 'all',
        target_user_ids: target_user_ids || [],
        image_url,
        action_url,
        action_label,
        is_dismissible: is_dismissible !== false,
        is_pinned: is_pinned || false,
        starts_at: starts_at || new Date().toISOString(),
        ends_at,
        created_by: adminUser.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'announcement',
      entity_id: announcement.id,
      entity_name: title,
      changes: body
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update announcement
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: previous } = await supabase
      .from('admin_announcements')
      .select('*')
      .eq('id', id)
      .single();

    updates.updated_at = new Date().toISOString();

    const { data: announcement, error } = await supabase
      .from('admin_announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'announcement',
      entity_id: id,
      entity_name: announcement.title,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete announcement
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

    const { data: announcement } = await supabase
      .from('admin_announcements')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('admin_announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'announcement',
      entity_id: id,
      entity_name: announcement?.title,
      previous_values: announcement
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
