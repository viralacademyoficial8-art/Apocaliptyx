import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/forum/bookmark - Toggle bookmark on a post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'El ID del post es requerido' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase()
      .from('forum_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    let bookmarked = false;

    if (existingBookmark) {
      // Remove bookmark
      await supabase()
        .from('forum_bookmarks')
        .delete()
        .eq('id', (existingBookmark as any).id);

      bookmarked = false;
    } else {
      // Add bookmark
      await supabase()
        .from('forum_bookmarks')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      bookmarked = true;
    }

    // Get updated count
    const { data: postData } = await supabase()
      .from('forum_posts')
      .select('bookmarks_count')
      .eq('id', postId)
      .single();

    const count = (postData as { bookmarks_count?: number } | null)?.bookmarks_count || 0;

    // Update count manually if needed
    if (bookmarked) {
      await supabase()
        .from('forum_posts')
        .update({ bookmarks_count: count + 1 })
        .eq('id', postId);
    } else {
      await supabase()
        .from('forum_posts')
        .update({ bookmarks_count: Math.max(0, count - 1) })
        .eq('id', postId);
    }

    // Return the final count
    const { data: finalPost } = await supabase()
      .from('forum_posts')
      .select('bookmarks_count')
      .eq('id', postId)
      .single();

    return NextResponse.json({
      success: true,
      bookmarked,
      count: (finalPost as { bookmarks_count?: number } | null)?.bookmarks_count || 0,
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Error al guardar' },
      { status: 500 }
    );
  }
}
