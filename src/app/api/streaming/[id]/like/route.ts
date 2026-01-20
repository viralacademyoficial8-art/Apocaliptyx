export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notificationsService } from '@/services/notifications.service';

// POST /api/streaming/[id]/like - Like a stream
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id: streamId } = await params;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('stream_likes')
      .select('id')
      .eq('stream_id', streamId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Ya diste like' }, { status: 400 });
    }

    // Add like
    const { error: likeError } = await supabase
      .from('stream_likes')
      .insert({
        stream_id: streamId,
        user_id: user.id,
      } as never);

    if (likeError) throw likeError;

    // Increment like count and get stream owner info
    const { data: streamRaw } = await supabase
      .from('live_streams')
      .select('likes_count, user_id')
      .eq('id', streamId)
      .single();

    const stream = streamRaw as { likes_count?: number; user_id?: string } | null;

    await supabase
      .from('live_streams')
      .update({ likes_count: (stream?.likes_count || 0) + 1 } as never)
      .eq('id', streamId);

    // Send notification to stream owner (if not self-liking)
    if (stream?.user_id && stream.user_id !== user.id) {
      // Get liker's info
      const { data: likerInfo } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const likerData = likerInfo as { username?: string; avatar_url?: string } | null;

      await notificationsService.notifyStreamLike(
        stream.user_id,
        likerData?.username || 'Usuario',
        likerData?.avatar_url,
        streamId
      );
    }

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error('Error liking stream:', error);
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    );
  }
}

// DELETE /api/streaming/[id]/like - Unlike a stream
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id: streamId } = await params;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Remove like
    const { error: unlikeError } = await supabase
      .from('stream_likes')
      .delete()
      .eq('stream_id', streamId)
      .eq('user_id', user.id);

    if (unlikeError) throw unlikeError;

    // Decrement like count
    const { data: streamRaw2 } = await supabase
      .from('live_streams')
      .select('likes_count')
      .eq('id', streamId)
      .single();

    const stream2 = streamRaw2 as { likes_count?: number } | null;

    await supabase
      .from('live_streams')
      .update({ likes_count: Math.max(0, (stream2?.likes_count || 1) - 1) } as never)
      .eq('id', streamId);

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error('Error unliking stream:', error);
    return NextResponse.json(
      { error: 'Error al quitar like' },
      { status: 500 }
    );
  }
}
