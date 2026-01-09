import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List achievements
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

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'STAFF'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const rarity = searchParams.get('rarity') || '';

    let query = supabase
      .from('achievement_definitions')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    const { data: achievements, count, error } = await query
      .order('category')
      .order('points', { ascending: false });

    if (error) throw error;

    // Get unlock counts for each achievement
    const achievementIds = achievements?.map(a => a.id) || [];
    const { data: unlockCounts } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .in('achievement_id', achievementIds)
      .eq('is_unlocked', true);

    const countsMap: Record<string, number> = {};
    unlockCounts?.forEach(u => {
      countsMap[u.achievement_id] = (countsMap[u.achievement_id] || 0) + 1;
    });

    const achievementsWithCounts = achievements?.map(a => ({
      ...a,
      unlock_count: countsMap[a.id] || 0
    }));

    return NextResponse.json({ achievements: achievementsWithCounts, total: count });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create achievement
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
      category,
      icon,
      icon_locked,
      color,
      points,
      rarity,
      requirements,
      rewards,
      is_secret
    } = body;

    if (!name || !name_es || !category || !icon || !requirements) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const { data: achievement, error } = await supabase
      .from('achievement_definitions')
      .insert({
        name,
        name_es,
        description,
        description_es,
        category,
        icon,
        icon_locked: icon_locked || '🔒',
        color: color || '#6366F1',
        points: points || 10,
        rarity: rarity || 'common',
        requirements,
        rewards: rewards || {},
        is_secret: is_secret || false
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'create',
      entity_type: 'achievement',
      entity_id: achievement.id,
      entity_name: name,
      changes: body
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update achievement or award to user
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

    // Award achievement to user
    if (action === 'award' && userId && id) {
      const { data: achievement } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('id', id)
        .single();

      if (!achievement) {
        return NextResponse.json({ error: 'Logro no encontrado' }, { status: 404 });
      }

      // Check if already awarded
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Usuario ya tiene este logro' }, { status: 400 });
      }

      // Award achievement
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: id,
        progress: 100,
        progress_max: 100,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
        is_claimed: true,
        claimed_at: new Date().toISOString()
      });

      // Give rewards if any
      if (achievement.rewards?.ap_coins) {
        await supabase.rpc('log_ap_transaction', {
          p_user_id: userId,
          p_amount: achievement.rewards.ap_coins,
          p_type: 'achievement',
          p_description: `Logro: ${achievement.name}`,
          p_reference_id: id
        });
      }

      // Update user achievement points
      await supabase
        .from('users')
        .update({ achievement_points: supabase.raw(`achievement_points + ${achievement.points}`) })
        .eq('id', userId);

      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'award_achievement',
        entity_type: 'user_achievement',
        entity_id: id,
        entity_name: achievement.name,
        changes: { user_id: userId }
      });

      return NextResponse.json({ success: true, message: 'Logro otorgado' });
    }

    // Update achievement definition
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data: previous } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: achievement, error } = await supabase
      .from('achievement_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'update',
      entity_type: 'achievement',
      entity_id: id,
      entity_name: achievement.name,
      changes: updates,
      previous_values: previous
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete achievement
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

    const { data: achievement } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('achievement_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete',
      entity_type: 'achievement',
      entity_id: id,
      entity_name: achievement?.name,
      previous_values: achievement
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
