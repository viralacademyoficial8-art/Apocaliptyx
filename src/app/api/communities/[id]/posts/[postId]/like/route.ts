import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/communities/[id]/posts/[postId]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('community_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Ya has dado like a esta publicación' }, { status: 400 });
    }

    // Add like
    const { error } = await supabase
      .from('community_post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      } as never);

    if (error) throw error;

    // Increment likes count
    try {
      await supabase.rpc('increment_post_likes' as never, { p_post_id: postId } as never);
    } catch {
      // Fallback: manually increment
      const { data: post } = await supabase
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      if (post) {
        await supabase
          .from('community_posts')
          .update({ likes_count: ((post as any).likes_count || 0) + 1 } as never)
          .eq('id', postId);
      }
    }

    return NextResponse.json({ success: true, message: 'Like agregado' });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/posts/[postId]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Remove like
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrement likes count
    try {
      await supabase.rpc('decrement_post_likes' as never, { p_post_id: postId } as never);
    } catch {
      // Fallback: manually decrement
      const { data: post } = await supabase
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      if (post) {
        await supabase
          .from('community_posts')
          .update({ likes_count: Math.max(0, ((post as any).likes_count || 0) - 1) } as never)
          .eq('id', postId);
      }
    }

    return NextResponse.json({ success: true, message: 'Like removido' });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: 'Error al quitar like' },
      { status: 500 }
    );
  }
}
