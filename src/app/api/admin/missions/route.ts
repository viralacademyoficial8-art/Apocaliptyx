import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List missions
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
    const category = searchParams.get('category') || '';
    const active = searchParams.get('active');

    let query = supabase
      .from('mission_definitions')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('mission_type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (active !== null && active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    const { data: missions, count, error } = await query
      .order('mission_type')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ missions, total: count });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create mission
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
      name,
      name_es,
      description,
      description_es,
      mission_type,
      category,
      requirements,
      rewards,
      icon,
      difficulty,
      start_date,
      end_date
    } = body;

    if (!name || !name_es || !mission_type || !requirements || !rewards) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: mission, error } = await supabase
      .from('mission_definitions')
      .insert({
        name,
        name_es,
        description,
        description_es,
        mission_type,
        category: category || 'general',
        requirements,
        rewards,
        icon,
        difficulty: difficulty || 'easy',
        start_date,
        end_date,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'mission',
      entity_id: mission.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, mission });
  } catch (error) {
    console.error('Error creating mission:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update mission
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
      .from('mission_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: mission, error } = await supabase
      .from('mission_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'mission',
      entity_id: id,
      entity_name: mission.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, mission });
  } catch (error) {
    console.error('Error updating mission:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete mission
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

    const { data: mission } = await supabase
      .from('mission_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('mission_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'mission',
      entity_id: id,
      entity_name: mission?.name,
      previous_values: mission
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mission:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
