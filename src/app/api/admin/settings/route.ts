import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get all settings or by category
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
    const category = searchParams.get('category') || '';

    let query = supabase
      .from('system_settings')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query.order('category').order('key');

    if (error) throw error;

    // Group by category
    const grouped = settings?.reduce((acc: Record<string, typeof settings>, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update settings
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
    const { settings } = body; // Array of { key, value }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array requerido' }, { status: 400 });
    }

    const results = [];
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    for (const setting of settings) {
      const { key, value } = setting;

      // Get previous value
      const { data: previous } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

      // Update setting
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          value: JSON.stringify(value),
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${key}:`, error);
        continue;
      }

      results.push(data);
      changes[key] = { old: previous?.value, new: value };
    }

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update_settings',
      entity_type: 'system_settings',
      entity_id: 'batch',
      changes
    });

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create new setting (for advanced use)
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

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede crear configuraciones' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, category, label, description, value_type, is_public } = body;

    if (!key || value === undefined || !category || !label || !value_type) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: setting, error } = await supabase
      .from('system_settings')
      .insert({
        key,
        value: JSON.stringify(value),
        category,
        label,
        description,
        value_type,
        is_public: is_public || false,
        updated_by: adminUser.id
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'system_setting',
      entity_id: key,
      entity_name: label,
      changes: body
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
