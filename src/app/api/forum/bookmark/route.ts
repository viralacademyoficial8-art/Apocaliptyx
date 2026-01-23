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

    // Count actual bookmarks from the table (more reliable than incrementing)
    const { count: actualCount } = await supabase()
      .from('forum_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const finalCount = actualCount || 0;

    // Update the post's bookmark count to match actual count
    await supabase()
      .from('forum_posts')
      .update({ bookmarks_count: finalCount })
      .eq('id', postId);

    return NextResponse.json({
      success: true,
      bookmarked,
      count: finalCount,
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Error al guardar' },
      { status: 500 }
    );
  }
}
