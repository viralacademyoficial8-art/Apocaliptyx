export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { notificationsService } from '@/services/notifications.service';

// POST - Toggle like en un comentario
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json({ error: 'ID de comentario requerido' }, { status: 400 });
    }

    const scenarioId = params.id;

    // Obtener usuario con info para notificación
    const { data: user } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar si ya dio like
    const { data: existingLike } = await supabase
      .from('scenario_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Ya tiene like, quitarlo
      await supabase
        .from('scenario_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      return NextResponse.json({ liked: false });
    } else {
      // No tiene like, agregarlo
      await supabase
        .from('scenario_comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
        });

      // Obtener info del comentario y su autor para la notificación
      const { data: comment } = await supabase
        .from('scenario_comments')
        .select('author_id, content')
        .eq('id', commentId)
        .single();

      // NOTIFICACIÓN: Avisar al autor del comentario (si no es el mismo que da like)
      if (comment && comment.author_id !== user.id) {
        try {
          const contentPreview = comment.content?.length > 30
            ? comment.content.substring(0, 30) + '...'
            : comment.content;

          await notificationsService.create({
            userId: comment.author_id,
            type: 'like_received',
            title: 'Le gustó tu comentario ❤️',
            message: `A @${user.display_name || user.username} le gustó tu comentario: "${contentPreview}"`,
            linkUrl: `/escenario/${scenarioId}`,
            imageUrl: user.avatar_url || undefined,
          });
        } catch (notifError) {
          // No fallar si la notificación falla
          console.error('Error sending like notification:', notifError);
        }
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error in comment like:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
