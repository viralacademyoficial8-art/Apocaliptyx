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
        category:forum_categories(id, name, slug, icon),
        media:forum_post_media(id, url, media_type, sort_order)
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

    const posts = postsRaw as PostRow[] | null;

    return NextResponse.json({ posts: posts || [] });
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
    const { title, content, category_id, tags, gif_url, gif_width, gif_height, image_urls } = body;

    // Content is optional if there are images or gif
    if (!content && !gif_url && (!image_urls || image_urls.length === 0)) {
      return NextResponse.json(
        { error: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    // Build post data
    const postData: Record<string, unknown> = {
      title: title || '',
      content: content || '',
      author_id: session.user.id,
      category_id: category_id || null,
      tags: tags || [],
      status: 'published',
      is_pinned: false,
      is_locked: false,
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
    };

    // Add GIF if provided
    if (gif_url) {
      postData.gif_url = gif_url;
      postData.gif_width = gif_width || null;
      postData.gif_height = gif_height || null;
    }

    // Add media flags if images
    if (image_urls && image_urls.length > 0) {
      postData.has_media = true;
      postData.media_count = image_urls.length;
    }

    const { data: post, error } = await supabase()
      .from('forum_posts')
      .insert(postData)
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

    // Save image URLs to forum_post_media table
    if (image_urls && image_urls.length > 0 && post) {
      const mediaRecords = image_urls.map((url: string, index: number) => ({
        post_id: (post as any).id,
        media_type: 'image',
        url: url,
        sort_order: index,
      }));

      const { error: mediaError } = await supabase()
        .from('forum_post_media')
        .insert(mediaRecords);

      if (mediaError) {
        console.error('Error saving media records:', mediaError);
        // Don't fail the whole request, just log the error
      }
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
