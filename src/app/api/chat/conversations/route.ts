import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST /api/chat/conversations - Create or get existing conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      );
    }

    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes iniciar una conversación contigo mismo' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'direct')
      .or(`participant_1.eq.${currentUserId},participant_1.eq.${userId}`)
      .or(`participant_2.eq.${currentUserId},participant_2.eq.${userId}`);

    const conversation = existing?.find(conv =>
      (conv.participant_1 === currentUserId && conv.participant_2 === userId) ||
      (conv.participant_1 === userId && conv.participant_2 === currentUserId)
    );

    if (conversation) {
      return NextResponse.json({ conversation });
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        participant_1: currentUserId,
        participant_2: userId,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: 'Error al crear conversación' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversation: newConversation });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// GET /api/chat/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const supabase = getSupabaseAdmin();

    // Get direct conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_user:users!conversations_participant_1_fkey(id, username, display_name, avatar_url),
        participant_2_user:users!conversations_participant_2_fkey(id, username, display_name, avatar_url)
      `)
      .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Error al obtener conversaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
