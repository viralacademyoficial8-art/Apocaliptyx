import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/stories/[id]/reply - Reply to a story
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
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Se requiere un mensaje' },
        { status: 400 }
      );
    }

    // Check if story exists
    const { data: storyRaw, error: storyError } = await supabase()
      .from('forum_stories')
      .select('id, user_id, expires_at, content')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as { id: string; user_id: string; expires_at: string; content?: string };

    // Check if expired
    if (new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story expirado' }, { status: 410 });
    }

    // Can't reply to own story
    if (story.user_id === user.id) {
      return NextResponse.json(
        { error: 'No puedes responder a tu propio story' },
        { status: 400 }
      );
    }

    // Store the reply in forum_story_replies table
    const { data: reply, error: replyError } = await supabase()
      .from('forum_story_replies')
      .insert({
        story_id: storyId,
        user_id: user.id,
        message: message.trim(),
      } as never)
      .select()
      .single();

    if (replyError) {
      // If table doesn't exist, just send notification
      console.log('Reply table may not exist, sending notification only');
    }

    // Get replier info
    const { data: replierData } = await supabase()
      .from('users')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    const replier = replierData as { username?: string; display_name?: string; avatar_url?: string } | null;

    // Create notification for story owner
    await supabase()
      .from('notifications')
      .insert({
        user_id: story.user_id,
        type: 'story_reply',
        title: 'Nueva respuesta a tu story',
        message: `${replier?.display_name || replier?.username || 'Alguien'}: "${message.trim().substring(0, 100)}${message.trim().length > 100 ? '...' : ''}"`,
        reference_type: 'story',
        reference_id: storyId,
        actor_id: user.id,
      } as never);

    return NextResponse.json({
      success: true,
      message: 'Respuesta enviada',
      reply: reply || { message: message.trim() },
    });
  } catch (error) {
    console.error('Error replying to story:', error);
    return NextResponse.json(
      { error: 'Error al enviar respuesta' },
      { status: 500 }
    );
  }
}

// GET /api/stories/[id]/reply - Get replies for a story (for story owner)
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

    // Check if user owns the story
    const { data: storyRaw, error: storyError } = await supabase()
      .from('forum_stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as { user_id: string };

    if (story.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Get replies
    const { data: repliesRaw, error: repliesError } = await supabase()
      .from('forum_story_replies')
      .select(`
        id,
        message,
        created_at,
        user_id,
        users:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (repliesError) {
      return NextResponse.json({ replies: [] });
    }

    const replies = (repliesRaw || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      message: r.message,
      createdAt: r.created_at,
      userId: r.user_id,
      user: r.users,
    }));

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error getting story replies:', error);
    return NextResponse.json(
      { error: 'Error al obtener respuestas' },
      { status: 500 }
    );
  }
}
