import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List titles
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
    const rarity = searchParams.get('rarity') || '';

    let query = supabase
      .from('title_definitions')
      .select('*', { count: 'exact' });

    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    const { data: titles, count, error } = await query
      .order('rarity')
      .order('name');

    if (error) throw error;

    // Get unlock counts
    const titleIds = titles?.map(t => t.id) || [];
    const { data: unlockCounts } = await supabase
      .from('user_titles')
      .select('title_id')
      .in('title_id', titleIds);

    const countsMap: Record<string, number> = {};
    unlockCounts?.forEach(u => {
      countsMap[u.title_id] = (countsMap[u.title_id] || 0) + 1;
    });

    const titlesWithCounts = titles?.map(t => ({
      ...t,
      unlock_count: countsMap[t.id] || 0
    }));

    return NextResponse.json({ titles: titlesWithCounts, total: count });
  } catch (error) {
    console.error('Error fetching titles:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create title
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
      icon,
      color,
      unlock_condition,
      rarity
    } = body;

    if (!name || !name_es || !unlock_condition) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: title, error } = await supabase
      .from('title_definitions')
      .insert({
        name,
        name_es,
        description,
        description_es,
        icon,
        color: color || '#FFFFFF',
        unlock_condition,
        rarity: rarity || 'common'
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'title',
      entity_id: title.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, title });
  } catch (error) {
    console.error('Error creating title:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update title or grant to user
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
    const { action, id, userId, ...updates } = body;

    // Grant title to user
    if (action === 'grant' && userId && id) {
      const { data: title } = await supabase
        .from('title_definitions')
        .select('*')
        .eq('id', id)
        .single();

      if (!title) {
        return NextResponse.json({ error: 'Título no encontrado' }, { status: 404 });
      }

      const { data: existing } = await supabase
        .from('user_titles')
        .select('id')
        .eq('user_id', userId)
        .eq('title_id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Usuario ya tiene este título' }, { status: 400 });
      }

      await supabase.from('user_titles').insert({
        user_id: userId,
        title_id: id
      });

      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'grant_title',
        entity_type: 'user_title',
        entity_id: id,
        entity_name: title.name,
        changes: { user_id: userId }
      });

      return NextResponse.json({ success: true, message: 'Título otorgado' });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: previous } = await supabase
      .from('title_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: title, error } = await supabase
      .from('title_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'title',
      entity_id: id,
      entity_name: title.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, title });
  } catch (error) {
    console.error('Error updating title:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete title
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

    const { data: title } = await supabase
      .from('title_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('title_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'title',
      entity_id: id,
      entity_name: title?.name,
      previous_values: title
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting title:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
