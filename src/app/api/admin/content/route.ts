import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - List content for moderation (posts, reels, stories, streams)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // post, reel, story, stream, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const results: Record<string, unknown[]> = {};
    let totalCount = 0;

    // Get posts
    if (type === 'all' || type === 'post') {
      const { data: posts, count: postsCount } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:users!forum_posts_user_id_fkey(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results.posts = posts || [];
      totalCount += postsCount || 0;
    }

    // Get reels
    if (type === 'all' || type === 'reel') {
      const { data: reels, count: reelsCount } = await supabase
        .from('user_reels')
        .select(`
          *,
          user:users!user_reels_user_id_fkey(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results.reels = reels || [];
      totalCount += reelsCount || 0;
    }

    // Get stories
    if (type === 'all' || type === 'story') {
      const { data: stories, count: storiesCount } = await supabase
        .from('forum_stories')
        .select(`
          *,
          user:users!forum_stories_user_id_fkey(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results.stories = stories || [];
      totalCount += storiesCount || 0;
    }

    // Get streams
    if (type === 'all' || type === 'stream') {
      const { data: streams, count: streamsCount } = await supabase
        .from('live_streams')
        .select(`
          *,
          user:users!live_streams_user_id_fkey(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results.streams = streams || [];
      totalCount += streamsCount || 0;
    }

    // Get content reports
    const { data: reports, count: reportsCount } = await supabase
      .from('content_reports')
      .select(`
        *,
        reporter:users!content_reports_reporter_id_fkey(id, username, display_name)
      `, { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      content: results,
      reports,
      pendingReports: reportsCount || 0,
      pagination: {
        page,
        limit,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // post, reel, story, stream, comment
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Contenido inapropiado';

    if (!type || !id) {
      return NextResponse.json({ error: 'Tipo e ID requeridos' }, { status: 400 });
    }

    const tableMap: Record<string, string> = {
      post: 'forum_posts',
      reel: 'user_reels',
      story: 'forum_stories',
      stream: 'live_streams',
      comment: 'comments'
    };

    const table = tableMap[type];
    if (!table) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Get content before deletion
    const { data: content } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (!content) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }

    // Delete content
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminUser.id,
      action: 'delete_content',
      entity_type: type,
      entity_id: id,
      reason,
      previous_values: content
    });

    // Notify user
    const userId = content.user_id || content.author_id;
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Contenido eliminado',
        message: `Tu ${type === 'post' ? 'publicación' : type === 'reel' ? 'reel' : type === 'story' ? 'historia' : 'contenido'} fue eliminado: ${reason}`,
        data: { content_type: type, reason }
      });
    }

    // Update related reports as resolved
    await supabase
      .from('content_reports')
      .update({
        status: 'resolved',
        resolved_by: adminUser.id,
        resolved_at: new Date().toISOString(),
        action_taken: 'deleted',
        resolution_note: reason
      })
      .eq('content_type', type)
      .eq('content_id', id);

    return NextResponse.json({ success: true, message: 'Contenido eliminado' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH - Update content status or resolve report
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!adminUser || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reportId, contentType, contentId, status, resolution_note } = body;

    // Resolve content report
    if (action === 'resolve_report' && reportId) {
      const { data: report, error } = await supabase
        .from('content_reports')
        .update({
          status: status || 'resolved',
          resolved_by: adminUser.id,
          resolved_at: new Date().toISOString(),
          resolution_note
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'resolve_report',
        entity_type: 'content_report',
        entity_id: reportId,
        changes: { status, resolution_note }
      });

      return NextResponse.json({ success: true, report });
    }

    // Hide/unhide content
    if (action === 'toggle_visibility' && contentType && contentId) {
      const tableMap: Record<string, string> = {
        post: 'forum_posts',
        reel: 'user_reels',
        story: 'forum_stories'
      };

      const table = tableMap[contentType];
      if (!table) {
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
      }

      const visibilityField = contentType === 'reel' ? 'is_published' : 'is_active';

      const { data: current } = await supabase
        .from(table)
        .select(visibilityField)
        .eq('id', contentId)
        .single();

      const newValue = !current?.[visibilityField];

      const { error } = await supabase
        .from(table)
        .update({ [visibilityField]: newValue })
        .eq('id', contentId);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: newValue ? 'show_content' : 'hide_content',
        entity_type: contentType,
        entity_id: contentId,
        changes: { [visibilityField]: newValue }
      });

      return NextResponse.json({ success: true, visible: newValue });
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
