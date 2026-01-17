import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// Helper to verify admin
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const { data: userData } = await supabase()
    .from('users')
    .select('role')
    .eq('email', session.user.email)
    .single();

  if (userData?.role !== 'ADMIN') {
    return null;
  }

  return session;
}

// GET /api/admin/communities - Get all communities for admin
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { data, error } = await supabase()
      .from('communities')
      .select('*, creator:users!communities_creator_id_fkey(username)')
      .order('members_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ communities: data || [] });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Error al obtener comunidades' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/communities - Update community
export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { error } = await supabase()
      .from('communities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Error al actualizar comunidad' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/communities - Delete community
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // First delete related data
    // Delete community members
    await supabase()
      .from('community_members')
      .delete()
      .eq('community_id', id);

    // Delete community join requests
    await supabase()
      .from('community_join_requests')
      .delete()
      .eq('community_id', id);

    // Delete community posts and their comments/likes
    const { data: posts } = await supabase()
      .from('community_posts')
      .select('id')
      .eq('community_id', id);

    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);

      // Delete post comments
      await supabase()
        .from('community_post_comments')
        .delete()
        .in('post_id', postIds);

      // Delete post likes
      await supabase()
        .from('community_post_likes')
        .delete()
        .in('post_id', postIds);

      // Delete posts
      await supabase()
        .from('community_posts')
        .delete()
        .eq('community_id', id);
    }

    // Finally delete the community
    const { error } = await supabase()
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comunidad eliminada' });
  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Error al eliminar comunidad' },
      { status: 500 }
    );
  }
}
