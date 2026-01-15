import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/communities/[id]/posts/[postId]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: communityId, postId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase()
      .from('community_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Ya has dado like a esta publicación' }, { status: 400 });
    }

    // Get post info for notification
    const { data: postData } = await supabase()
      .from('community_posts')
      .select('author_id, content, community_id')
      .eq('id', postId)
      .single();

    // Get community name
    const { data: community } = await supabase()
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    // Get liker username
    const { data: liker } = await supabase()
      .from('users')
      .select('username, display_name')
      .eq('id', session.user.id)
      .single();

    // Add like
    const { error } = await supabase()
      .from('community_post_likes')
      .insert({
        post_id: postId,
        user_id: session.user.id,
      });

    if (error) throw error;

    // Increment likes count
    try {
      await supabase().rpc('increment_post_likes', { p_post_id: postId });
    } catch {
      // Fallback: manually increment
      const { data: post } = await supabase()
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      if (post) {
        await supabase()
          .from('community_posts')
          .update({ likes_count: ((post as any).likes_count || 0) + 1 })
          .eq('id', postId);
      }
    }

    // Create notification for post author (if not self-like)
    if (postData && (postData as any).author_id !== session.user.id) {
      const likerName = (liker as any)?.display_name || (liker as any)?.username || 'Alguien';
      const communityName = (community as any)?.name || 'la comunidad';
      const contentPreview = (postData as any).content?.substring(0, 50) + ((postData as any).content?.length > 50 ? '...' : '');

      await supabase()
        .from('notifications')
        .insert({
          user_id: (postData as any).author_id,
          type: 'community_like',
          title: '❤️ Nuevo like en tu publicación',
          message: `${likerName} le dio like a tu publicación en ${communityName}: "${contentPreview}"`,
          link_url: `/foro/comunidad/${communityId}?post=${postId}`,
          is_read: false,
        });
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Remove like
    const { error } = await supabase()
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    // Decrement likes count
    try {
      await supabase().rpc('decrement_post_likes', { p_post_id: postId });
    } catch {
      // Fallback: manually decrement
      const { data: post } = await supabase()
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      if (post) {
        await supabase()
          .from('community_posts')
          .update({ likes_count: Math.max(0, ((post as any).likes_count || 0) - 1) })
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
