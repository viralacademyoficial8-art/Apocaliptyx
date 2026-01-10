import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface PostRow {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id?: string;
  tags?: string[];
  status: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    level?: number;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
}

// GET /api/forum/posts - Get forum posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'recent';

    let query = supabase()
      .from('forum_posts')
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
        category:forum_categories(id, name, slug, icon)
      `)
      .eq('status', 'published');

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'comments':
        query = query.order('comments_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: postsRaw, error } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const posts = (postsRaw || []) as PostRow[];

    // Load polls for posts
    let pollsCount = 0;
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);

      const { data: pollsData, error: pollsError } = await supabase()
        .from('forum_polls')
        .select(`
          *,
          options:forum_poll_options(*)
        `)
        .in('post_id', postIds);

      if (pollsError) {
        console.error('Error loading polls:', pollsError);
      }

      if (pollsData && pollsData.length > 0) {
        pollsCount = pollsData.length;
        const pollMap = new Map();
        for (const poll of pollsData) {
          const totalVotes = (poll.options || []).reduce((sum: number, opt: { votes_count?: number }) => sum + (opt.votes_count || 0), 0);
          pollMap.set(poll.post_id, {
            ...poll,
            total_votes: totalVotes,
            has_voted: false,
            user_votes: [],
          });
        }

        // Add polls to posts
        for (const post of posts) {
          const poll = pollMap.get(post.id);
          if (poll) {
            (post as PostRow & { poll?: unknown }).poll = poll;
          }
        }
      }
    }

    return NextResponse.json({ posts, _debug: { pollsLoaded: pollsCount, postsCount: posts.length } });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category_id, tags } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabase()
      .from('forum_posts')
      .insert({
        title: title || '',
        content,
        author_id: session.user.id,
        category_id: category_id || null,
        tags: tags || [],
        status: 'published',
        is_pinned: false,
        is_locked: false,
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level)
      `)
      .single();

    if (error) {
      console.error('Supabase error creating post:', error);
      return NextResponse.json(
        { error: error.message || 'Error al crear post' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
      message: 'Post publicado exitosamente',
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Error al crear post' },
      { status: 500 }
    );
  }
}
