import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/forum/repost - Create a repost
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { originalPostId, quoteContent } = body;

    if (!originalPostId) {
      return NextResponse.json(
        { error: 'El ID del post original es requerido' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if user already reposted this post (without quote)
    if (!quoteContent) {
      const { data: existingRepost } = await supabase()
        .from('forum_reposts')
        .select('id')
        .eq('original_post_id', originalPostId)
        .eq('user_id', userId)
        .is('quote_content', null)
        .single();

      if (existingRepost) {
        return NextResponse.json(
          { error: 'Ya compartiste esta publicación' },
          { status: 400 }
        );
      }
    }

    // Create the repost
    const { data: newRepost, error: insertError } = await supabase()
      .from('forum_reposts')
      .insert({
        original_post_id: originalPostId,
        user_id: userId,
        quote_content: quoteContent || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating repost:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    // Update repost counter on original post
    const { data: postData } = await supabase()
      .from('forum_posts')
      .select('reposts_count')
      .eq('id', originalPostId)
      .single();

    const currentCount = (postData as { reposts_count?: number } | null)?.reposts_count || 0;

    await supabase()
      .from('forum_posts')
      .update({ reposts_count: currentCount + 1 })
      .eq('id', originalPostId);

    // Get original post author info for notification
    const { data: originalPost } = await supabase()
      .from('forum_posts')
      .select('author_id, title, content')
      .eq('id', originalPostId)
      .single();

    // Send notification to original author
    if (originalPost && (originalPost as any).author_id !== userId) {
      const { data: reposter } = await supabase()
        .from('users')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      if (reposter) {
        const postTitle = (originalPost as any).title || (originalPost as any).content?.substring(0, 30) + '...';

        await supabase()
          .from('notifications')
          .insert({
            user_id: (originalPost as any).author_id,
            type: 'repost',
            title: '🔁 Compartieron tu Post',
            message: `@${(reposter as any).username} compartió tu publicación "${postTitle}"`,
            link: '/foro',
            image_url: (reposter as any).avatar_url,
            is_read: false,
          });
      }
    }

    return NextResponse.json({
      success: true,
      repost_id: (newRepost as any).id,
    });
  } catch (error) {
    console.error('Error creating repost:', error);
    return NextResponse.json(
      { error: 'Error al compartir' },
      { status: 500 }
    );
  }
}
