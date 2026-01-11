import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface StoryData {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  background_color?: string;
  expires_at: string;
  link_url?: string;
  link_preview?: {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
  };
  user?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface ConversationData {
  id: string;
  type: string;
  participant_1: string | null;
  participant_2: string | null;
}

// POST /api/stories/[id]/reply - Reply to a story (sends to chat)
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

    // Get story with user info
    const { data: storyRaw, error: storyError } = await supabase()
      .from('forum_stories')
      .select(`
        id, user_id, content, media_url, media_type, background_color, expires_at, link_url, link_preview,
        user:users!forum_stories_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('id', storyId)
      .single();

    if (storyError || !storyRaw) {
      return NextResponse.json({ error: 'Story no encontrado' }, { status: 404 });
    }

    const story = storyRaw as StoryData;

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

    // Get replier info
    const { data: replierData } = await supabase()
      .from('users')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    const replier = replierData as { id: string; username?: string; display_name?: string; avatar_url?: string } | null;

    // ========================================
    // CHAT INTEGRATION - Find or create conversation
    // ========================================

    // Look for existing direct conversation
    const { data: existingConvs } = await supabase()
      .from('conversations')
      .select('*')
      .eq('type', 'direct')
      .or(`participant_1.eq.${user.id},participant_1.eq.${story.user_id}`)
      .or(`participant_2.eq.${user.id},participant_2.eq.${story.user_id}`);

    let conversation: ConversationData | null = null;

    if (existingConvs) {
      conversation = existingConvs.find((conv: ConversationData) =>
        (conv.participant_1 === user.id && conv.participant_2 === story.user_id) ||
        (conv.participant_1 === story.user_id && conv.participant_2 === user.id)
      ) || null;
    }

    // Create new conversation if doesn't exist
    if (!conversation) {
      const { data: newConv, error: convError } = await supabase()
        .from('conversations')
        .insert({
          type: 'direct',
          participant_1: user.id,
          participant_2: story.user_id,
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json(
          { error: 'Error al crear conversación' },
          { status: 500 }
        );
      }

      conversation = newConv as ConversationData;
    }

    // Create story preview for the message
    const storyPreview = {
      storyId: story.id,
      storyOwnerId: story.user_id,
      storyOwnerUsername: story.user?.username,
      storyOwnerDisplayName: story.user?.display_name,
      storyOwnerAvatarUrl: story.user?.avatar_url,
      content: story.content,
      mediaUrl: story.media_url,
      mediaType: story.media_type,
      backgroundColor: story.background_color,
      linkUrl: story.link_url,
      linkPreview: story.link_preview,
      expiresAt: story.expires_at,
    };

    // Send message with story reference
    const { data: chatMessage, error: msgError } = await supabase()
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: message.trim(),
        is_read: false,
        story_id: storyId,
        story_preview: storyPreview,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .single();

    if (msgError) {
      console.error('Error sending chat message:', msgError);
      return NextResponse.json(
        { error: 'Error al enviar mensaje' },
        { status: 500 }
      );
    }

    // Update conversation's last_message_at
    await supabase()
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    // Create notification for story owner
    await supabase()
      .from('notifications')
      .insert({
        user_id: story.user_id,
        type: 'story_reply',
        title: 'Respuesta a tu story',
        message: `${replier?.display_name || replier?.username || 'Alguien'} respondió a tu story`,
        reference_type: 'conversation',
        reference_id: conversation.id,
        actor_id: user.id,
      } as never);

    return NextResponse.json({
      success: true,
      message: 'Respuesta enviada',
      chatMessage,
      conversationId: conversation.id,
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

    // Get replies from messages table (chat integration)
    const { data: messagesRaw, error: messagesError } = await supabase()
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        story_preview,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error getting story replies:', messagesError);
      return NextResponse.json({ replies: [] });
    }

    const replies = (messagesRaw || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      message: r.content,
      createdAt: r.created_at,
      userId: r.sender_id,
      user: r.sender,
      storyPreview: r.story_preview,
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
