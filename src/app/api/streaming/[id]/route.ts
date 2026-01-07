import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface StreamUser {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  followers_count?: number;
}

interface StreamRow {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  stream_url?: string;
  status: string;
  viewers_count: number;
  peak_viewers: number;
  total_views: number;
  likes_count: number;
  category?: string;
  tags?: string[];
  started_at?: string;
  ended_at?: string;
  user?: StreamUser;
}

// GET /api/streaming/[id] - Get stream details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id: streamId } = await params;

    const { data: streamRaw, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url, followers_count)
      `)
      .eq('id', streamId)
      .single();

    if (error || !streamRaw) {
      return NextResponse.json(
        { error: 'Stream no encontrado' },
        { status: 404 }
      );
    }

    const stream = streamRaw as StreamRow;

    // Increment view count if stream is live
    if (stream.status === 'live') {
      await supabase
        .from('live_streams')
        .update({
          viewers_count: stream.viewers_count + 1,
          total_views: stream.total_views + 1,
          peak_viewers: Math.max(stream.peak_viewers, stream.viewers_count + 1)
        } as never)
        .eq('id', streamId);
    }

    return NextResponse.json({
      stream: {
        id: stream.id,
        userId: stream.user_id,
        username: stream.user?.username,
        displayName: stream.user?.display_name,
        avatarUrl: stream.user?.avatar_url,
        followersCount: stream.user?.followers_count,
        title: stream.title,
        description: stream.description,
        thumbnailUrl: stream.thumbnail_url,
        streamUrl: stream.stream_url,
        status: stream.status,
        viewersCount: stream.viewers_count,
        peakViewers: stream.peak_viewers,
        totalViews: stream.total_views,
        likesCount: stream.likes_count,
        category: stream.category,
        tags: stream.tags || [],
        startedAt: stream.started_at,
        endedAt: stream.ended_at,
      },
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { error: 'Error al obtener stream' },
      { status: 500 }
    );
  }
}

// PATCH /api/streaming/[id] - Update stream (title, end stream, etc.)
export async function PATCH(
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
    const body = await request.json();
    const { title, description, action } = body;

    // Verify ownership
    const { data: streamRaw } = await supabase
      .from('live_streams')
      .select('user_id, status')
      .eq('id', streamId)
      .single();

    const stream = streamRaw as { user_id: string; status: string } | null;

    if (!stream || stream.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este stream' },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;

    if (action === 'end') {
      updates.status = 'ended';
      updates.ended_at = new Date().toISOString();
      updates.viewers_count = 0;
    }

    const { error } = await supabase
      .from('live_streams')
      .update(updates as never)
      .eq('id', streamId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json(
      { error: 'Error al actualizar stream' },
      { status: 500 }
    );
  }
}

// DELETE /api/streaming/[id] - Delete stream
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

    // Verify ownership
    const { data: streamRaw2 } = await supabase
      .from('live_streams')
      .select('user_id')
      .eq('id', streamId)
      .single();

    const streamDel = streamRaw2 as { user_id: string } | null;

    if (!streamDel || streamDel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este stream' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('live_streams')
      .delete()
      .eq('id', streamId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json(
      { error: 'Error al eliminar stream' },
      { status: 500 }
    );
  }
}
