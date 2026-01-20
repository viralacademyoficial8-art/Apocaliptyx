export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { notificationsService } from '@/services/notifications.service';

// GET - Obtener comentarios de un escenario
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const scenarioId = params.id;

    // Obtener comentarios con información del autor
    const { data: comments, error } = await supabase
      .from('scenario_comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        users!scenario_comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level,
          experience
        )
      `)
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      // Si la tabla no existe, devolver array vacío
      if (error.code === '42P01') {
        return NextResponse.json({ comments: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obtener likes de cada comentario
    const commentIds = comments?.map(c => c.id) || [];

    let likesMap: Record<string, string[]> = {};

    if (commentIds.length > 0) {
      const { data: likes } = await supabase
        .from('scenario_comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

      // Agrupar likes por comentario
      likes?.forEach(like => {
        if (!likesMap[like.comment_id]) {
          likesMap[like.comment_id] = [];
        }
        likesMap[like.comment_id].push(like.user_id);
      });
    }

    // Formatear respuesta
    const formattedComments = comments?.map(comment => {
      const author = comment.users as any;
      const level = author?.level || 1;

      // Calcular prophet level basado en el nivel (usando los niveles definidos en types)
      let prophetLevel = 'monividente';
      if (level >= 40) prophetLevel = 'nostradamus';
      else if (level >= 25) prophetLevel = 'vidente';
      else if (level >= 10) prophetLevel = 'oraculo';

      return {
        id: comment.id,
        scenarioId,
        authorId: comment.author_id,
        authorUsername: author?.username || 'usuario',
        authorDisplayName: author?.display_name || author?.username || 'Usuario',
        authorAvatar: author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || 'default'}`,
        authorLevel: prophetLevel,
        content: comment.content,
        likes: likesMap[comment.id] || [],
        createdAt: comment.created_at,
      };
    }) || [];

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error in GET comments:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nuevo comentario
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
    const scenarioId = params.id;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'El comentario es muy largo (máx 500 caracteres)' }, { status: 400 });
    }

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, level')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el escenario existe y obtener el creador
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, title, creator_id')
      .eq('id', scenarioId)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Escenario no encontrado' }, { status: 404 });
    }

    // Crear comentario
    const { data: comment, error: insertError } = await supabase
      .from('scenario_comments')
      .insert({
        scenario_id: scenarioId,
        author_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 });
    }

    // Calcular prophet level (usando los niveles definidos en types)
    const level = user.level || 1;
    let prophetLevel = 'monividente';
    if (level >= 40) prophetLevel = 'nostradamus';
    else if (level >= 25) prophetLevel = 'vidente';
    else if (level >= 10) prophetLevel = 'oraculo';

    const formattedComment = {
      id: comment.id,
      scenarioId,
      authorId: user.id,
      authorUsername: user.username,
      authorDisplayName: user.display_name || user.username,
      authorAvatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      authorLevel: prophetLevel,
      content: comment.content,
      likes: [],
      createdAt: comment.created_at,
    };

    // NOTIFICACIÓN: Avisar al creador del escenario (si no es el mismo que comenta)
    if (scenario.creator_id && scenario.creator_id !== user.id) {
      try {
        await notificationsService.create({
          userId: scenario.creator_id,
          type: 'comment_received',
          title: 'Nuevo comentario en tu escenario 💬',
          message: `@${user.display_name || user.username} comentó en "${scenario.title}"`,
          linkUrl: `/escenario/${scenarioId}`,
          imageUrl: user.avatar_url || undefined,
        });
      } catch (notifError) {
        // No fallar si la notificación falla
        console.error('Error sending comment notification:', notifError);
      }
    }

    return NextResponse.json({ comment: formattedComment });
  } catch (error) {
    console.error('Error in POST comment:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar comentario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'ID de comentario requerido' }, { status: 400 });
    }

    // Obtener usuario
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el comentario existe y pertenece al usuario (o es admin)
    const { data: comment } = await supabase
      .from('scenario_comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    if (comment.author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este comentario' }, { status: 403 });
    }

    // Eliminar likes del comentario primero
    await supabase
      .from('scenario_comment_likes')
      .delete()
      .eq('comment_id', commentId);

    // Eliminar comentario
    const { error: deleteError } = await supabase
      .from('scenario_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE comment:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
