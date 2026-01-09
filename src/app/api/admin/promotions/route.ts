import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List promo codes
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
      .from('promo_codes')
      .select('*, creator:users!promo_codes_created_by_fkey(username, display_name)', { count: 'exact' });

    if (active !== null && active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    if (type) {
      query = query.eq('discount_type', type);
    }

    const { data: codes, count, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ codes, total: count });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create promo code
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
      code,
      name,
      description,
      discount_type,
      discount_value,
      item_reward_id,
      max_uses,
      max_uses_per_user,
      min_purchase_amount,
      applicable_items,
      requires_premium,
      starts_at,
      expires_at
    } = body;

    if (!code || !name || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .ilike('code', code)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'El código ya existe' }, { status: 400 });
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase(),
        name,
        description,
        discount_type,
        discount_value,
        item_reward_id,
        max_uses,
        max_uses_per_user: max_uses_per_user || 1,
        min_purchase_amount: min_purchase_amount || 0,
        applicable_items: applicable_items || [],
        requires_premium: requires_premium || false,
        starts_at: starts_at || new Date().toISOString(),
        expires_at,
        created_by: adminUser.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'promo_code',
      entity_id: promoCode.id,
      entity_name: code,
      changes: body
    });

    return NextResponse.json({ success: true, code: promoCode });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update promo code
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
      .from('promo_codes')
      .select('*')
      .eq('id', id)
      .single();

    updates.updated_at = new Date().toISOString();

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'promo_code',
      entity_id: id,
      entity_name: promoCode.code,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, code: promoCode });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete promo code
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

    const { data: promoCode } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'promo_code',
      entity_id: id,
      entity_name: promoCode?.code,
      previous_values: promoCode
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
