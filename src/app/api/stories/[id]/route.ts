import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface StoryRow {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  background_color?: string;
  text_color?: string;
  font_style?: string;
  views_count: number;
  expires_at: string;
  created_at: string;
  is_highlight: boolean;
  highlight_name?: string;
  user?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

// GET /api/stories/[id] - Get single story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const storyId = params.id;

    const { data: storyRaw, error } = await supabase
      .from('forum_stories')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('id', storyId)
      .single();

    if (error || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as StoryRow;

    // Check if expired (unless it's a highlight)
    if (!story.is_highlight && new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story expirado' }, { status: 410 });
    }

    // Get reactions count
    const { count: reactionsCount } = await supabase
      .from('forum_story_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId);

    return NextResponse.json({
      story: {
        id: story.id,
        userId: story.user_id,
        username: story.user?.username,
        displayName: story.user?.display_name,
        avatarUrl: story.user?.avatar_url,
        content: story.content,
        mediaUrl: story.media_url,
        mediaType: story.media_type,
        backgroundColor: story.background_color,
        textColor: story.text_color,
        fontStyle: story.font_style,
        viewsCount: story.views_count,
        reactionsCount: reactionsCount || 0,
        expiresAt: story.expires_at,
        createdAt: story.created_at,
        isHighlight: story.is_highlight,
        highlightName: story.highlight_name,
      },
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Error al obtener story' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id] - Delete story
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

    const storyId = params.id;

    // Verify ownership
    const { data: storyRaw } = await supabase
      .from('forum_stories')
      .select('user_id, media_url')
      .eq('id', storyId)
      .single();

    const story = storyRaw as { user_id: string; media_url?: string } | null;

    if (!story || story.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este story' },
        { status: 403 }
      );
    }

    // Delete from storage if there's media
    if (story.media_url && story.media_url.includes('stories/')) {
      const path = story.media_url.split('stories/')[1];
      if (path) {
        await supabase.storage.from('stories').remove([path]);
      }
    }

    // Delete story (cascades to views and reactions)
    const { error } = await supabase
      .from('forum_stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Story eliminado',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Error al eliminar story' },
      { status: 500 }
    );
  }
}
