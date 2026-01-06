import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/reels/[id]/like - Like a reel
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const reelId = params.id;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('reel_likes')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Ya diste like' }, { status: 400 });
    }

    // Add like
    const { error: likeError } = await supabase
      .from('reel_likes')
      .insert({
        reel_id: reelId,
        user_id: user.id,
      } as never);

    if (likeError) throw likeError;

    // Increment like count
    const { data: reelRaw } = await supabase
      .from('user_reels')
      .select('likes_count')
      .eq('id', reelId)
      .single();

    const reel = reelRaw as { likes_count?: number } | null;

    await supabase
      .from('user_reels')
      .update({ likes_count: (reel?.likes_count || 0) + 1 } as never)
      .eq('id', reelId);

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error('Error liking reel:', error);
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    );
  }
}

// DELETE /api/reels/[id]/like - Unlike a reel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const reelId = params.id;

    // Remove like
    const { error: unlikeError } = await supabase
      .from('reel_likes')
      .delete()
      .eq('reel_id', reelId)
      .eq('user_id', user.id);

    if (unlikeError) throw unlikeError;

    // Decrement like count
    const { data: reelRaw } = await supabase
      .from('user_reels')
      .select('likes_count')
      .eq('id', reelId)
      .single();

    const reel = reelRaw as { likes_count?: number } | null;

    await supabase
      .from('user_reels')
      .update({ likes_count: Math.max(0, (reel?.likes_count || 1) - 1) } as never)
      .eq('id', reelId);

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error('Error unliking reel:', error);
    return NextResponse.json(
      { error: 'Error al quitar like' },
      { status: 500 }
    );
  }
}
