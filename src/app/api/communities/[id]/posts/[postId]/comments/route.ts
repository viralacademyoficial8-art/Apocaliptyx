import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface CommentUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  level?: number;
}

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  reply_to_username?: string | null;
  replies_count?: number;
  author?: CommentUser;
}

// GET /api/communities/[id]/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data: commentsRaw, error } = await supabase()
      .from('community_post_comments')
      .select(`
        *,
        author:users(id, username, display_name, avatar_url, level)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const comments = commentsRaw as CommentRow[] | null;

    const formattedComments = comments?.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      author: comment.author ? {
        id: comment.author.id,
        username: comment.author.username,
        displayName: comment.author.display_name,
        avatarUrl: comment.author.avatar_url,
        level: comment.author.level,
      } : null,
      content: comment.content,
      createdAt: comment.created_at,
      parentId: comment.parent_id || null,
      replyToUsername: comment.reply_to_username || null,
      repliesCount: comment.replies_count || 0,
    })) || [];

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[id]/posts/[postId]/comments - Add a comment
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

    // Check if user is member of community
    const { data: membership } = await supabase()
      .from('community_members')
      .select('id, is_banned')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Debes ser miembro para comentar' }, { status: 403 });
    }

    if ((membership as any).is_banned) {
      return NextResponse.json({ error: 'Has sido baneado de esta comunidad' }, { status: 403 });
    }

    const body = await request.json();
    const { content, parentId, replyToUsername } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El comentario es requerido' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'El comentario es demasiado largo (máx 500 caracteres)' }, { status: 400 });
    }

    // Get post info for notification
    const { data: postData } = await supabase()
      .from('community_posts')
      .select('author_id, content')
      .eq('id', postId)
      .single();

    // Get community name
    const { data: community } = await supabase()
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    // Get commenter username
    const { data: commenter } = await supabase()
      .from('users')
      .select('username, display_name')
      .eq('id', session.user.id)
      .single();

    // Create comment with optional parent for replies
    const commentData: any = {
      post_id: postId,
      author_id: session.user.id,
      content: content.trim(),
    };

    // If this is a reply to another comment
    if (parentId) {
      commentData.parent_id = parentId;
      if (replyToUsername) {
        commentData.reply_to_username = replyToUsername;
      }
    }

    const { data: comment, error } = await supabase()
      .from('community_post_comments')
      .insert(commentData)
      .select(`
        *,
        author:users(id, username, display_name, avatar_url, level)
      `)
      .single();

    // If this is a reply, increment replies_count on parent comment
    if (parentId && !error) {
      await supabase().rpc('increment_replies_count', { comment_id: parentId });
    }

    if (error) throw error;

    // Increment comments count on post
    const { data: post } = await supabase()
      .from('community_posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase()
        .from('community_posts')
        .update({ comments_count: ((post as any).comments_count || 0) + 1 })
        .eq('id', postId);
    }

    // Create notification for post author (if not self-comment)
    if (postData && (postData as any).author_id !== session.user.id) {
      const commenterName = (commenter as any)?.display_name || (commenter as any)?.username || 'Alguien';
      const communityName = (community as any)?.name || 'la comunidad';
      const commentPreview = content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : '');

      await supabase()
        .from('notifications')
        .insert({
          user_id: (postData as any).author_id,
          type: 'community_comment',
          title: '💬 Nuevo comentario en tu publicación',
          message: `${commenterName} comentó en tu publicación en ${communityName}: "${commentPreview}"`,
          link_url: `/foro/comunidad/${communityId}?post=${postId}`,
          is_read: false,
        });
    }

    // If this is a reply, also notify the person being replied to
    if (replyToUsername && replyToUsername !== (commenter as any)?.username) {
      const { data: replyToUser } = await supabase()
        .from('users')
        .select('id')
        .eq('username', replyToUsername)
        .single();

      if (replyToUser && (replyToUser as any).id !== session.user.id) {
        const commenterName = (commenter as any)?.display_name || (commenter as any)?.username || 'Alguien';
        const communityName = (community as any)?.name || 'la comunidad';
        const commentPreview = content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : '');

        await supabase()
          .from('notifications')
          .insert({
            user_id: (replyToUser as any).id,
            type: 'community_reply',
            title: '↩️ Nueva respuesta a tu comentario',
            message: `${commenterName} te respondió en ${communityName}: "${commentPreview}"`,
            link_url: `/foro/comunidad/${communityId}?post=${postId}`,
            is_read: false,
          });
      }
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: (comment as any).id,
        postId: (comment as any).post_id,
        authorId: (comment as any).author_id,
        author: (comment as any).author ? {
          id: (comment as any).author.id,
          username: (comment as any).author.username,
          displayName: (comment as any).author.display_name,
          avatarUrl: (comment as any).author.avatar_url,
          level: (comment as any).author.level,
        } : null,
        content: (comment as any).content,
        createdAt: (comment as any).created_at,
        parentId: (comment as any).parent_id || null,
        replyToUsername: (comment as any).reply_to_username || null,
        repliesCount: 0,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/posts/[postId]/comments?commentId=xxx - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: communityId, postId } = await params;
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!commentId) {
      return NextResponse.json({ error: 'ID de comentario requerido' }, { status: 400 });
    }

    // Get comment to check ownership
    const { data: comment } = await supabase()
      .from('community_post_comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    // Check if user is comment author or community admin/owner
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    const isAuthor = (comment as any).author_id === session.user.id;
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes((membership as any).role);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este comentario' }, { status: 403 });
    }

    // Delete comment
    const { error } = await supabase()
      .from('community_post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // Decrement comments count on post
    const { data: post } = await supabase()
      .from('community_posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase()
        .from('community_posts')
        .update({ comments_count: Math.max(0, ((post as any).comments_count || 0) - 1) })
        .eq('id', postId);
    }

    return NextResponse.json({ success: true, message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Error al eliminar comentario' },
      { status: 500 }
    );
  }
}
