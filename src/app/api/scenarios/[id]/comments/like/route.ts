export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

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

    // Obtener usuario
    const { data: user } = await supabase
      .from('users')
      .select('id')
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

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error in comment like:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
