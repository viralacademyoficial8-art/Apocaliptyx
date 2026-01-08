import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/stories/[id]/view - Mark story as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user;
    const storyId = params.id;

    // Check if story exists and is not expired
    const { data: storyRaw, error: storyError } = await supabase()
      .from('forum_stories')
      .select('id, user_id, views_count, expires_at')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as { id: string; user_id: string; views_count: number; expires_at: string };

    // Check if expired
    if (new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story expirado' }, { status: 410 });
    }

    // Don't count views on own stories
    if (story.user_id === user.id) {
      return NextResponse.json({ success: true, selfView: true });
    }

    // Check if already viewed
    const { data: existingView } = await supabase()
      .from('forum_story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', user.id)
      .single();

    if (existingView) {
      return NextResponse.json({ success: true, alreadyViewed: true });
    }

    // Record view
    const { error: viewError } = await supabase()
      .from('forum_story_views')
      .insert({
        story_id: storyId,
        viewer_id: user.id,
      } as never);

    if (viewError) throw viewError;

    // Increment view count
    await supabase()
      .from('forum_stories')
      .update({ views_count: story.views_count + 1 } as never)
      .eq('id', storyId);

    return NextResponse.json({ success: true, viewed: true });
  } catch (error) {
    console.error('Error viewing story:', error);
    return NextResponse.json(
      { error: 'Error al ver story' },
      { status: 500 }
    );
  }
}

// GET /api/stories/[id]/view - Get story viewers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user;
    const storyId = params.id;

    // Verify ownership
    const { data: storyRaw } = await supabase()
      .from('forum_stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    const story = storyRaw as { user_id: string } | null;

    if (!story || story.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Solo el autor puede ver quién vio su story' },
        { status: 403 }
      );
    }

    // Get viewers
    const { data: viewersRaw, error } = await supabase()
      .from('forum_story_views')
      .select(`
        viewer_id,
        viewed_at,
        viewer:users(id, username, display_name, avatar_url)
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });

    if (error) throw error;

    interface ViewerRow {
      viewer_id: string;
      viewed_at: string;
      viewer?: {
        id: string;
        username?: string;
        display_name?: string;
        avatar_url?: string;
      } | {
        id: string;
        username?: string;
        display_name?: string;
        avatar_url?: string;
      }[];
    }

    const viewers = (viewersRaw as unknown as ViewerRow[] | null)?.map(v => {
      // Handle both single object and array cases from Supabase
      const viewerData = Array.isArray(v.viewer) ? v.viewer[0] : v.viewer;
      return {
        userId: v.viewer_id,
        username: viewerData?.username,
        displayName: viewerData?.display_name,
        avatarUrl: viewerData?.avatar_url,
        viewedAt: v.viewed_at,
      };
    }) || [];

    return NextResponse.json({ viewers });
  } catch (error) {
    console.error('Error getting story viewers:', error);
    return NextResponse.json(
      { error: 'Error al obtener espectadores' },
      { status: 500 }
    );
  }
}
