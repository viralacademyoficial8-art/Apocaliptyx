import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List collectibles
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
    const rarity = searchParams.get('rarity') || '';

    let query = supabase
      .from('collectibles')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    const { data: collectibles, count, error } = await query
      .order('type')
      .order('rarity')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ collectibles, total: count });
  } catch (error) {
    console.error('Error fetching collectibles:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create collectible
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
      type,
      rarity,
      asset_url,
      preview_url,
      ap_cost,
      is_tradeable,
      is_limited,
      max_supply,
      unlock_condition,
      season,
      available_from,
      available_until
    } = body;

    if (!name || !name_es || !type || !asset_url) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: collectible, error } = await supabase
      .from('collectibles')
      .insert({
        name,
        name_es,
        description,
        type,
        rarity: rarity || 'common',
        asset_url,
        preview_url,
        ap_cost,
        is_tradeable: is_tradeable !== false,
        is_limited: is_limited || false,
        max_supply,
        current_supply: 0,
        unlock_condition,
        season,
        available_from,
        available_until
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'collectible',
      entity_id: collectible.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, collectible });
  } catch (error) {
    console.error('Error creating collectible:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update collectible or grant to user
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

    // Grant collectible to user
    if (action === 'grant' && userId && id) {
      const { data: collectible } = await supabase
        .from('collectibles')
        .select('*')
        .eq('id', id)
        .single();

      if (!collectible) {
        return NextResponse.json({ error: 'Coleccionable no encontrado' }, { status: 404 });
      }

      // Check if already owned
      const { data: existing } = await supabase
        .from('user_collectibles')
        .select('id')
        .eq('user_id', userId)
        .eq('collectible_id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Usuario ya tiene este coleccionable' }, { status: 400 });
      }

      const serialNumber = collectible.is_limited ? collectible.current_supply + 1 : null;

      await supabase.from('user_collectibles').insert({
        user_id: userId,
        collectible_id: id,
        acquired_method: 'reward',
        serial_number: serialNumber
      });

      if (collectible.is_limited) {
        await supabase
          .from('collectibles')
          .update({ current_supply: collectible.current_supply + 1 })
          .eq('id', id);
      }

      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'grant_collectible',
        entity_type: 'user_collectible',
        entity_id: id,
        entity_name: collectible.name,
        changes: { user_id: userId }
      });

      return NextResponse.json({ success: true, message: 'Coleccionable otorgado' });
    }

    // Update collectible definition
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: previous } = await supabase
      .from('collectibles')
      .select('*')
      .eq('id', id)
      .single();

    const { data: collectible, error } = await supabase
      .from('collectibles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'collectible',
      entity_id: id,
      entity_name: collectible.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, collectible });
  } catch (error) {
    console.error('Error updating collectible:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete collectible
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

    const { data: collectible } = await supabase
      .from('collectibles')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('collectibles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'collectible',
      entity_id: id,
      entity_name: collectible?.name,
      previous_values: collectible
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collectible:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
