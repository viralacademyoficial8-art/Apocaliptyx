import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-server';
import { auth } from '@/lib/auth';

interface UserFollow {
  following_id: string;
}

interface StreamUser {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
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

// GET /api/streaming - Get live streams
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'live'; // 'live', 'all', 'following'
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const session = await auth();
    const user = session?.user;

    // Get today's date range (UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    let query = supabase
      .from('live_streams')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .order('viewers_count', { ascending: false });

    if (filter === 'live') {
      query = query.eq('status', 'live');
    } else if (filter === 'following' && user) {
      // Get followed users
      const { data: followingRaw } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const following = followingRaw as UserFollow[] | null;
      const followingIds = following?.map(f => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      } else {
        return NextResponse.json({ streams: [], stats: { liveNow: 0, totalViewers: 0, peakViewersToday: 0, streamsToday: 0 } });
      }
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data: streamsRaw, error } = await query.limit(50);

    if (error) throw error;

    const streams = streamsRaw as StreamRow[] | null;

    // Calculate real-time stats from database
    // Get live streams count and viewers
    const { data: liveStreamsData } = await supabase
      .from('live_streams')
      .select('viewers_count')
      .eq('status', 'live');

    const liveNow = liveStreamsData?.length || 0;
    const totalViewers = liveStreamsData?.reduce((sum, s) => sum + (s.viewers_count || 0), 0) || 0;

    // Get today's streams stats
    const { data: todayStreamsData } = await supabase
      .from('live_streams')
      .select('peak_viewers, started_at')
      .gte('started_at', todayISO);

    const streamsToday = todayStreamsData?.length || 0;
    const peakViewersToday = todayStreamsData?.reduce((max, s) => Math.max(max, s.peak_viewers || 0), 0) || 0;

    const formattedStreams = streams?.map(stream => ({
      id: stream.id,
      userId: stream.user_id,
      username: stream.user?.username,
      displayName: stream.user?.display_name,
      avatarUrl: stream.user?.avatar_url,
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
    })) || [];

    return NextResponse.json({
      streams: formattedStreams,
      stats: {
        liveNow,
        totalViewers,
        peakViewersToday,
        streamsToday,
      }
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json(
      { error: 'Error al obtener streams' },
      { status: 500 }
    );
  }
}

// POST /api/streaming - Start a new stream
export async function POST(request: NextRequest) {
  try {
    // Use admin client to bypass RLS (we validate user via NextAuth)
    const supabase = getSupabaseAdmin();

    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    // Check if user already has an active stream
    const { data: existingStream } = await supabase
      .from('live_streams')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'live')
      .single();

    if (existingStream) {
      return NextResponse.json(
        { error: 'Ya tienes un stream activo' },
        { status: 400 }
      );
    }

    // Generate stream key
    const streamKey = `sk_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: streamRaw, error } = await supabase
      .from('live_streams')
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        tags: tags || [],
        stream_key: streamKey,
        status: 'live',
        started_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Error de base de datos: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    const stream = streamRaw as { id: string; title?: string } | null;

    return NextResponse.json({
      success: true,
      stream: {
        id: stream?.id,
        streamKey,
        title: stream?.title,
      },
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Error al iniciar stream', details: errorMessage },
      { status: 500 }
    );
  }
}
