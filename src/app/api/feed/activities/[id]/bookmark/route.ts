export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// POST - Toggle bookmark on activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: activityId } = await params;
    const supabase = getSupabaseAdmin();

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('email', session.user.email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('activity_bookmarks')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Remove bookmark
      await supabase
        .from('activity_bookmarks')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ bookmarked: false });
    } else {
      // Add bookmark
      await supabase
        .from('activity_bookmarks')
        .insert({ activity_id: activityId, user_id: user.id });

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Error toggling activity bookmark:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
