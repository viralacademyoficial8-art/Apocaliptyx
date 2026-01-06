import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/stories/[id]/react - React to a story
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

    const storyId = params.id;
    const body = await request.json();
    const { reaction } = body;

    if (!reaction) {
      return NextResponse.json(
        { error: 'Se requiere una reacción' },
        { status: 400 }
      );
    }

    // Check if story exists
    const { data: storyRaw, error: storyError } = await supabase
      .from('forum_stories')
      .select('id, user_id, expires_at')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as { id: string; user_id: string; expires_at: string };

    // Check if expired
    if (new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story expirado' }, { status: 410 });
    }

    // Remove existing reaction if any
    await supabase
      .from('forum_story_reactions')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', user.id);

    // Add new reaction
    const { error: reactError } = await supabase
      .from('forum_story_reactions')
      .insert({
        story_id: storyId,
        user_id: user.id,
        reaction,
      } as never);

    if (reactError) throw reactError;

    // Notify story owner (if not self)
    if (story.user_id !== user.id) {
      // Get reactor info
      const { data: reactorData } = await supabase
        .from('users')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      const reactor = reactorData as { username?: string; display_name?: string } | null;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: story.user_id,
          type: 'story_reaction',
          title: 'Nueva reacción',
          message: `${reactor?.display_name || reactor?.username || 'Alguien'} reaccionó ${reaction} a tu story`,
          reference_type: 'story',
          reference_id: storyId,
          actor_id: user.id,
        } as never);
    }

    return NextResponse.json({
      success: true,
      reaction,
      message: 'Reacción enviada',
    });
  } catch (error) {
    console.error('Error reacting to story:', error);
    return NextResponse.json(
      { error: 'Error al reaccionar' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id]/react - Remove reaction
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

    const { error } = await supabase
      .from('forum_story_reactions')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, removed: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Error al quitar reacción' },
      { status: 500 }
    );
  }
}
