export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// POST - Toggle like on activity
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

    // Check if already liked
    const { data: existing } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('activity_likes')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase
        .from('activity_likes')
        .insert({ activity_id: activityId, user_id: user.id });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling activity like:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET - Check if user liked the activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ liked: false });
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
      return NextResponse.json({ liked: false });
    }

    const { data: existing } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ liked: !!existing });
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}
