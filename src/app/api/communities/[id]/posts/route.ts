import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface CommunityPostUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  level?: number;
}

interface CommunityPostRow {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  image_url?: string;
  category?: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: CommunityPostUser;
}

interface PostLike {
  post_id: string;
}

// GET /api/communities/[id]/posts - Get community posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'recent';

    // Check if community exists
    const { data: communityRaw } = await supabase()
      .from('communities')
      .select('id, name, is_public')
      .eq('id', communityId)
      .single();

    const community = communityRaw as { id: string; name: string; is_public: boolean } | null;

    if (!community) {
      return NextResponse.json({ error: 'Comunidad no encontrada' }, { status: 404 });
    }

    // Check membership for private communities
    if (!community.is_public && session?.user?.id) {
      const { data: membership } = await supabase()
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', session.user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'No eres miembro de esta comunidad' }, { status: 403 });
      }
    }

    let query = supabase()
      .from('community_posts')
      .select(`
        *,
        author:users(id, username, display_name, avatar_url, level)
      `)
      .eq('community_id', communityId)
      .range((page - 1) * limit, page * limit - 1);

    // Apply sorting
    if (sort === 'pinned') {
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: postsRaw, error } = await query;

    if (error) throw error;

    const posts = postsRaw as CommunityPostRow[] | null;

    // Get user's likes if logged in
    let likedPostIds: string[] = [];
    if (session?.user?.id && posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likesRaw } = await supabase()
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', session.user.id)
        .in('post_id', postIds);

      const likes = likesRaw as PostLike[] | null;
      likedPostIds = likes?.map(l => l.post_id) || [];
    }

    const formattedPosts = posts?.map(post => ({
      id: post.id,
      communityId: post.community_id,
      authorId: post.author_id,
      author: post.author ? {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.display_name,
        avatarUrl: post.author.avatar_url,
        level: post.author.level,
      } : null,
      content: post.content,
      imageUrl: post.image_url,
      category: post.category || 'general',
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      isPinned: post.is_pinned,
      isLiked: likedPostIds.includes(post.id),
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    })) || [];

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[id]/posts - Create a new post in community
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is member
    const { data: membership } = await supabase()
      .from('community_members')
      .select('id, is_banned')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Debes ser miembro para publicar' }, { status: 403 });
    }

    if ((membership as any).is_banned) {
      return NextResponse.json({ error: 'Has sido baneado de esta comunidad' }, { status: 403 });
    }

    const body = await request.json();
    const { content, imageUrl, category } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'El contenido es demasiado largo' }, { status: 400 });
    }

    // Create post
    const { data: post, error } = await supabase()
      .from('community_posts')
      .insert({
        community_id: communityId,
        author_id: session.user.id,
        content: content.trim(),
        image_url: imageUrl || null,
        category: category || 'general',
      })
      .select(`
        *,
        author:users(id, username, display_name, avatar_url, level)
      `)
      .single();

    if (error) throw error;

    // Increment posts count
    const { data: comm } = await supabase()
      .from('communities')
      .select('posts_count')
      .eq('id', communityId)
      .single();

    if (comm) {
      await supabase()
        .from('communities')
        .update({ posts_count: ((comm as any).posts_count || 0) + 1 })
        .eq('id', communityId);
    }

    // Get community name and members for notifications
    const { data: communityInfo } = await supabase()
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    // Get author info
    const { data: authorInfo } = await supabase()
      .from('users')
      .select('username, display_name')
      .eq('id', session.user.id)
      .single();

    // Get all community members except the author
    const { data: members } = await supabase()
      .from('community_members')
      .select('user_id')
      .eq('community_id', communityId)
      .neq('user_id', session.user.id);

    // Create notifications for all members
    if (members && members.length > 0 && communityInfo && authorInfo) {
      const authorName = (authorInfo as any).display_name || (authorInfo as any).username || 'Alguien';
      const communityName = (communityInfo as any).name || 'la comunidad';
      const contentPreview = content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : '');

      const postId = (post as any).id;
      const notifications = members.map((member: any) => ({
        user_id: member.user_id,
        type: 'community_post',
        title: `📝 Nueva publicación en ${communityName}`,
        message: `${authorName} publicó: "${contentPreview}"`,
        link_url: `/foro/comunidad/${communityId}?post=${postId}`,
        is_read: false,
      }));

      // Insert notifications in batches to avoid issues
      if (notifications.length > 0) {
        await supabase()
          .from('notifications')
          .insert(notifications);
      }
    }

    return NextResponse.json({
      success: true,
      post: {
        id: (post as any).id,
        communityId: (post as any).community_id,
        authorId: (post as any).author_id,
        author: (post as any).author ? {
          id: (post as any).author.id,
          username: (post as any).author.username,
          displayName: (post as any).author.display_name,
          avatarUrl: (post as any).author.avatar_url,
          level: (post as any).author.level,
        } : null,
        content: (post as any).content,
        imageUrl: (post as any).image_url,
        category: (post as any).category || 'general',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLiked: false,
        createdAt: (post as any).created_at,
        updatedAt: (post as any).updated_at,
      },
      message: 'Publicación creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Error al crear publicación' },
      { status: 500 }
    );
  }
}
