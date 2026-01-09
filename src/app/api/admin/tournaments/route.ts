import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List tournaments with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check admin role
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('prediction_tournaments')
      .select('*, creator:users!prediction_tournaments_creator_id_fkey(username, display_name)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: tournaments, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      tournaments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create tournament
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
      description,
      banner_url,
      tournament_type,
      category_id,
      entry_fee,
      prize_pool,
      max_participants,
      min_predictions,
      start_date,
      end_date,
      rules,
      prizes
    } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Nombre y fechas son requeridos' }, { status: 400 });
    }

    const { data: tournament, error } = await supabase
      .from('prediction_tournaments')
      .insert({
        name,
        description,
        banner_url,
        creator_id: adminUser.id,
        tournament_type: tournament_type || 'open',
        category_id,
        entry_fee: entry_fee || 0,
        prize_pool: prize_pool || 0,
        max_participants,
        min_predictions: min_predictions || 5,
        start_date,
        end_date,
        status: new Date(start_date) > new Date() ? 'upcoming' : 'active',
        rules: rules || {},
        prizes: prizes || []
      })
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'tournament',
      entity_id: tournament.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update tournament
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

    // Get previous values for audit
    const { data: previous } = await supabase
      .from('prediction_tournaments')
      .select('*')
      .eq('id', id)
      .single();

    const { data: tournament, error } = await supabase
      .from('prediction_tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'tournament',
      entity_id: id,
      entity_name: tournament.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete tournament
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

    // Get tournament for audit
    const { data: tournament } = await supabase
      .from('prediction_tournaments')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('prediction_tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'tournament',
      entity_id: id,
      entity_name: tournament?.name,
      previous_values: tournament
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
