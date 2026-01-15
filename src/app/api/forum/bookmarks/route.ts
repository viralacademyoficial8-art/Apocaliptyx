import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// GET /api/forum/bookmarks - Get user's bookmarked posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get bookmarks with post details
    const { data, error } = await supabase()
      .from('forum_bookmarks')
      .select(`
        id,
        created_at,
        post:forum_posts(
          id,
          title,
          content,
          created_at,
          reactions_count,
          comments_count,
          author:users!forum_posts_author_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            level
          ),
          category:forum_categories(
            id,
            name,
            slug,
            icon
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return NextResponse.json(
        { error: 'Error al obtener los guardados' },
        { status: 500 }
      );
    }

    // Extract posts from bookmarks
    const posts = (data || [])
      .map((bookmark: any) => bookmark.post)
      .filter(Boolean);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error in bookmarks API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
