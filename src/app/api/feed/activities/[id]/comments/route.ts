export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET - Get comments for an activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: comments, error } = await supabase
      .from('activity_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level
        )
      `)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching activity comments:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST - Add comment to activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: activityId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Comentario muy largo (max 500 caracteres)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, level')
      .ilike('email', session.user.email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('activity_comments')
      .insert({
        activity_id: activityId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 });
    }

    return NextResponse.json({
      comment: {
        ...comment,
        users: user,
      },
    });
  } catch (error) {
    console.error('Error creating activity comment:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
