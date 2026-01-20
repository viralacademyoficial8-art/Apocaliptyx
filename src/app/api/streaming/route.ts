export const dynamic = 'force-dynamic';

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
  user?: StreamUser & { followers_count?: number };
}

interface FollowerCount {
  following_id: string;
  count: number;
}

// Sidebar stream interface (partial data)
interface SidebarStreamRow {
  id: string;
  title?: string;
  status: string;
  viewers_count?: number;
  peak_viewers?: number;
  category?: string;
  user_id: string;
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
      `);

    if (filter === 'live') {
      query = query.eq('status', 'live').order('viewers_count', { ascending: false });
    } else if (filter === 'following') {
      // User must be logged in to see following streams
      if (!user) {
        return NextResponse.json({
          streams: [],
          stats: { liveNow: 0, totalViewers: 0, peakViewersToday: 0, streamsToday: 0 },
          message: 'not_logged_in'
        });
      }

      // Get followed users from database
      const { data: followingRaw } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const following = followingRaw as UserFollow[] | null;
      const followingIds = following?.map(f => f.following_id) || [];

      if (followingIds.length > 0) {
        // Filter streams by followed users (both live and ended)
        query = query.in('user_id', followingIds);
      } else {
        return NextResponse.json({
          streams: [],
          stats: { liveNow: 0, totalViewers: 0, peakViewersToday: 0, streamsToday: 0 },
          message: 'no_following'
        });
      }
    }
    // For 'all' filter, we don't add status filter - will sort manually

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data: streamsRaw, error } = await query.limit(100);

    if (error) throw error;

    let streams = streamsRaw as StreamRow[] | null;

    // Sort streams: Live first (by viewers), then ended (by most recent)
    if (streams && filter !== 'live') {
      streams = streams.sort((a, b) => {
        // Live streams always come first
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;

        // If both are live, sort by viewers_count descending
        if (a.status === 'live' && b.status === 'live') {
          return (b.viewers_count || 0) - (a.viewers_count || 0);
        }

        // If both are ended, sort by ended_at descending (most recent first)
        const aEnded = a.ended_at ? new Date(a.ended_at).getTime() : 0;
        const bEnded = b.ended_at ? new Date(b.ended_at).getTime() : 0;
        return bEnded - aEnded;
      });
    }

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

    // === SIDEBAR DATA ===

    // Get all live streams for sidebar (with user data)
    const { data: liveStreamsForSidebar } = await supabase
      .from('live_streams')
      .select(`
        id, title, status, viewers_count, category, user_id,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('status', 'live')
      .order('viewers_count', { ascending: false })
      .limit(10);

    // Get recently ended streams for sidebar
    const { data: endedStreamsForSidebar } = await supabase
      .from('live_streams')
      .select(`
        id, title, status, viewers_count, peak_viewers, category, user_id, ended_at,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('status', 'ended')
      .order('ended_at', { ascending: false })
      .limit(5);

    // Get followers count for streamers to calculate "fame"
    const streamerIds = [
      ...(liveStreamsForSidebar?.map(s => s.user_id) || []),
      ...(endedStreamsForSidebar?.map(s => s.user_id) || [])
    ].filter((id, index, self) => self.indexOf(id) === index);

    // Get follower counts for these users
    const followerCounts: Record<string, number> = {};
    if (streamerIds.length > 0) {
      const { data: followersData } = await supabase
        .from('follows')
        .select('following_id')
        .in('following_id', streamerIds);

      if (followersData) {
        followersData.forEach((f: { following_id: string }) => {
          followerCounts[f.following_id] = (followerCounts[f.following_id] || 0) + 1;
        });
      }
    }

    // Calculate fame score and format sidebar data
    const formatSidebarStream = (s: SidebarStreamRow) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      viewersCount: s.viewers_count || 0,
      peakViewers: s.peak_viewers || 0,
      category: s.category,
      userId: s.user_id,
      username: s.user?.username,
      displayName: s.user?.display_name,
      avatarUrl: s.user?.avatar_url,
      followersCount: followerCounts[s.user_id] || 0,
      // Fame score = viewers * 2 + followers (weighted towards live engagement)
      fameScore: ((s.viewers_count || 0) * 2) + (followerCounts[s.user_id] || 0),
      endedAt: s.ended_at,
    });

    // Sort live streams by fame score
    const sidebarLive = ((liveStreamsForSidebar as unknown as SidebarStreamRow[]) || [])
      .map(formatSidebarStream)
      .sort((a, b) => b.fameScore - a.fameScore);

    // Sort ended streams by fame score
    const sidebarEnded = ((endedStreamsForSidebar as unknown as SidebarStreamRow[]) || [])
      .map(formatSidebarStream)
      .sort((a, b) => b.fameScore - a.fameScore);

    // Get categories with counts
    const { data: categoriesData } = await supabase
      .from('live_streams')
      .select('category, status')
      .not('category', 'is', null);

    const categoryStats: Record<string, { total: number; live: number }> = {};
    (categoriesData || []).forEach((s: { category: string | null; status: string }) => {
      if (s.category) {
        if (!categoryStats[s.category]) {
          categoryStats[s.category] = { total: 0, live: 0 };
        }
        categoryStats[s.category].total++;
        if (s.status === 'live') {
          categoryStats[s.category].live++;
        }
      }
    });

    const sidebarCategories = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        totalStreams: stats.total,
        liveStreams: stats.live,
      }))
      .sort((a, b) => b.liveStreams - a.liveStreams || b.totalStreams - a.totalStreams);

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
      },
      sidebar: {
        live: sidebarLive,
        ended: sidebarEnded,
        categories: sidebarCategories,
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

    // Notificar a los seguidores que el usuario está en vivo
    if (stream?.id) {
      try {
        // Obtener información del streamer
        const { data: streamerInfo } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        const streamerData = streamerInfo as { username?: string; avatar_url?: string } | null;

        // Obtener lista de seguidores del streamer
        const { data: followers } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id);

        if (followers && followers.length > 0) {
          const followerIds = followers.map((f: { follower_id: string }) => f.follower_id);

          // Importar el servicio de notificaciones y enviar notificaciones
          const { notificationsService } = await import('@/services/notifications.service');
          await notificationsService.notifyStreamStarted(
            followerIds,
            streamerData?.username || 'Usuario',
            streamerData?.avatar_url,
            title,
            stream.id
          );

          console.log(`Notified ${followerIds.length} followers about stream start`);
        }
      } catch (notifyError) {
        // No fallar si las notificaciones fallan, el stream ya fue creado
        console.error('Error sending stream notifications:', notifyError);
      }
    }

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
