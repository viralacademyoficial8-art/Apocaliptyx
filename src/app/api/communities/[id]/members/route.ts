import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface MemberUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  level?: number;
}

interface MemberRow {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  is_banned: boolean;
  user?: MemberUser;
}

// GET /api/communities/[id]/members - Get community members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');

    let query = supabase()
      .from('community_members')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url, level)
      `)
      .eq('community_id', communityId)
      .eq('is_banned', false)
      .range((page - 1) * limit, page * limit - 1);

    query = query.order('role').order('joined_at', { ascending: true });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: membersRaw, error } = await query;

    if (error) throw error;

    const members = membersRaw as MemberRow[] | null;

    const rolePriority: Record<string, number> = {
      owner: 1,
      admin: 2,
      moderator: 3,
      member: 4,
    };

    const sortedMembers = (members || []).sort((a, b) => {
      const priorityA = rolePriority[a.role] || 5;
      const priorityB = rolePriority[b.role] || 5;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
    });

    const formattedMembers = sortedMembers.map(member => ({
      id: member.id,
      communityId: member.community_id,
      userId: member.user_id,
      username: member.user?.username,
      displayName: member.user?.display_name,
      avatarUrl: member.user?.avatar_url,
      level: member.user?.level || 1,
      role: member.role,
      joinedAt: member.joined_at,
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error fetching community members:', error);
    return NextResponse.json(
      { error: 'Error al obtener miembros' },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id]/members - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if current user has permission
    const { data: currentMembership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!currentMembership || !['owner', 'admin'].includes((currentMembership as any).role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'userId y newRole son requeridos' }, { status: 400 });
    }

    // Can't change owner role
    const { data: targetMembership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: 'Usuario no es miembro' }, { status: 404 });
    }

    if ((targetMembership as any).role === 'owner') {
      return NextResponse.json({ error: 'No se puede cambiar el rol del propietario' }, { status: 400 });
    }

    // Only owner can promote to admin
    if (newRole === 'admin' && (currentMembership as any).role !== 'owner') {
      return NextResponse.json({ error: 'Solo el propietario puede promover a admin' }, { status: 403 });
    }

    const { error } = await supabase()
      .from('community_members')
      .update({ role: newRole })
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Rol actualizado' });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Error al actualizar rol' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/members - Remove/ban member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if current user has permission
    const { data: currentMembership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!currentMembership || !['owner', 'admin', 'moderator'].includes((currentMembership as any).role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const ban = searchParams.get('ban') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // Get target membership
    const { data: targetMembership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: 'Usuario no es miembro' }, { status: 404 });
    }

    // Can't remove owner
    if ((targetMembership as any).role === 'owner') {
      return NextResponse.json({ error: 'No se puede expulsar al propietario' }, { status: 400 });
    }

    // Only owner/admin can remove admins
    if ((targetMembership as any).role === 'admin' && (currentMembership as any).role !== 'owner') {
      return NextResponse.json({ error: 'No tienes permisos para expulsar admins' }, { status: 403 });
    }

    if (ban) {
      const { error } = await supabase()
        .from('community_members')
        .update({ is_banned: true })
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase()
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    }

    // Decrement member count atomically
    try {
      await supabase().rpc('decrement', {
        row_id: communityId,
        table_name: 'communities',
        column_name: 'members_count'
      });
    } catch (countError) {
      console.error('Error decrementing member count:', countError);
    }

    return NextResponse.json({
      success: true,
      message: ban ? 'Usuario baneado' : 'Usuario expulsado',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Error al expulsar usuario' },
      { status: 500 }
    );
  }
}
