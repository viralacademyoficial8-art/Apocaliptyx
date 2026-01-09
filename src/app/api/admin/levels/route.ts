import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List ranks and level configuration
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

    // Get ranks
    const { data: ranks, error: ranksError } = await supabase
      .from('user_ranks')
      .select('*')
      .order('min_level');

    if (ranksError) throw ranksError;

    // Get level-related settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'gamification');

    // Get user distribution by level
    const { data: userLevels } = await supabase
      .from('users')
      .select('level');

    const levelDistribution: Record<string, number> = {};
    userLevels?.forEach(user => {
      const levelBracket = Math.floor(user.level / 10) * 10;
      const key = `${levelBracket}-${levelBracket + 9}`;
      levelDistribution[key] = (levelDistribution[key] || 0) + 1;
    });

    // Get rank distribution
    const rankDistribution: Record<string, number> = {};
    ranks?.forEach(rank => {
      const count = userLevels?.filter(u =>
        u.level >= rank.min_level &&
        (rank.max_level === null || u.level <= rank.max_level)
      ).length || 0;
      rankDistribution[rank.name] = count;
    });

    return NextResponse.json({
      ranks,
      settings,
      levelDistribution,
      rankDistribution,
      totalUsers: userLevels?.length || 0
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create rank
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
      min_level,
      max_level,
      icon,
      color,
      perks
    } = body;

    if (!name || !name_es || min_level === undefined || !icon || !color) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: rank, error } = await supabase
      .from('user_ranks')
      .insert({
        name,
        name_es,
        min_level,
        max_level,
        icon,
        color,
        perks: perks || {}
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'rank',
      entity_id: rank.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, rank });
  } catch (error) {
    console.error('Error creating rank:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update rank
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
      .from('user_ranks')
      .select('*')
      .eq('id', id)
      .single();

    const { data: rank, error } = await supabase
      .from('user_ranks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'rank',
      entity_id: id,
      entity_name: rank.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, rank });
  } catch (error) {
    console.error('Error updating rank:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete rank
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

    const { data: rank } = await supabase
      .from('user_ranks')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('user_ranks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'rank',
      entity_id: id,
      entity_name: rank?.name,
      previous_values: rank
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rank:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
