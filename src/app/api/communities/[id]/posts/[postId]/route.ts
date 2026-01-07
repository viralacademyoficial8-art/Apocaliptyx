import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// DELETE /api/communities/[id]/posts/[postId] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: communityId, postId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get post to check ownership
    const { data: post } = await supabase()
      .from('community_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    // Check if user is post author or community admin/owner
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    const isAuthor = (post as any).author_id === session.user.id;
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes((membership as any).role);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar esta publicación' }, { status: 403 });
    }

    // Delete all comments first
    await supabase()
      .from('community_post_comments')
      .delete()
      .eq('post_id', postId);

    // Delete all likes
    await supabase()
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId);

    // Delete post
    const { error } = await supabase()
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    // Decrement posts count on community
    const { data: community } = await supabase()
      .from('communities')
      .select('posts_count')
      .eq('id', communityId)
      .single();

    if (community) {
      await supabase()
        .from('communities')
        .update({ posts_count: Math.max(0, ((community as any).posts_count || 0) - 1) })
        .eq('id', communityId);
    }

    return NextResponse.json({ success: true, message: 'Publicación eliminada' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Error al eliminar publicación' },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id]/posts/[postId] - Update a post (pin/unpin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: communityId, postId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is community admin/owner (only admins can pin)
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership || !['owner', 'admin', 'moderator'].includes((membership as any).role)) {
      return NextResponse.json({ error: 'No tienes permiso para esta acción' }, { status: 403 });
    }

    const body = await request.json();
    const { isPinned } = body;

    if (isPinned !== undefined) {
      const { error } = await supabase()
        .from('community_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: isPinned ? 'Publicación fijada' : 'Publicación desfijada' });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Error al actualizar publicación' },
      { status: 500 }
    );
  }
}
