import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { notificationsService } from '@/services/notifications.service';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/communities/[id]/join - Join a community or request to join
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

    // Check if community exists
    const { data: community, error: communityError } = await supabase()
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      return NextResponse.json({ error: 'Comunidad no encontrada' }, { status: 404 });
    }

    const communityData = community as any;

    // Check if already a member
    const { data: existingMember } = await supabase()
      .from('community_members')
      .select('id, is_banned')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (existingMember) {
      if ((existingMember as any).is_banned) {
        return NextResponse.json(
          { error: 'Has sido baneado de esta comunidad' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Ya eres miembro de esta comunidad' },
        { status: 400 }
      );
    }

    // If community is private, create a join request instead of joining directly
    if (!communityData.is_public) {
      // Check if already has a pending request
      const { data: existingRequest } = await supabase()
        .from('community_join_requests')
        .select('id, status')
        .eq('community_id', communityId)
        .eq('user_id', session.user.id)
        .single();

      if (existingRequest) {
        const requestData = existingRequest as { id: string; status: string };
        if (requestData.status === 'pending') {
          return NextResponse.json(
            { error: 'Ya tienes una solicitud pendiente' },
            { status: 400 }
          );
        }
        if (requestData.status === 'rejected') {
          return NextResponse.json(
            { error: 'Tu solicitud fue rechazada anteriormente' },
            { status: 403 }
          );
        }
      }

      // Get request message from body if provided
      let requestMessage = '';
      try {
        const body = await request.json();
        requestMessage = body.message || '';
      } catch {
        // No body provided, that's fine
      }

      // Create join request
      const { error: requestError } = await supabase()
        .from('community_join_requests')
        .insert({
          community_id: communityId,
          user_id: session.user.id,
          message: requestMessage,
          status: 'pending',
        });

      if (requestError) throw requestError;

      // Get requester info for notification
      const { data: requesterInfo } = await supabase()
        .from('users')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      const requesterData = requesterInfo as { username?: string; avatar_url?: string } | null;

      // Notify community admins/owner about the join request
      const { data: admins } = await supabase()
        .from('community_members')
        .select('user_id')
        .eq('community_id', communityId)
        .in('role', ['owner', 'admin']);

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await notificationsService.notify(
            admin.user_id,
            'community_join_request',
            `${requesterData?.username || 'Un usuario'} quiere unirse a ${communityData.name}`,
            requesterData?.avatar_url,
            `/comunidades/${communityData.slug}/solicitudes`
          );
        }
      }

      return NextResponse.json({
        success: true,
        requestPending: true,
        message: 'Solicitud de admisión enviada',
      });
    }

    // Public community - join directly
    const { error: joinError } = await supabase()
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: session.user.id,
        role: 'member',
      });

    if (joinError) throw joinError;

    // Increment member count
    await supabase()
      .from('communities')
      .update({ members_count: communityData.members_count + 1 })
      .eq('id', communityId);

    // Get new member info
    const { data: memberInfo } = await supabase()
      .from('users')
      .select('username, avatar_url')
      .eq('id', session.user.id)
      .single();

    const memberData = memberInfo as { username?: string; avatar_url?: string } | null;

    // Notify community admins/owner about new member
    const { data: admins } = await supabase()
      .from('community_members')
      .select('user_id')
      .eq('community_id', communityId)
      .in('role', ['owner', 'admin']);

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        if (admin.user_id !== session.user.id) {
          await notificationsService.notifyCommunityNewMember(
            admin.user_id,
            memberData?.username || 'Usuario',
            memberData?.avatar_url,
            communityData.name || 'Comunidad',
            communityId
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Te has unido a la comunidad',
    });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: 'Error al unirse a la comunidad' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/join - Leave a community
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

    // Get membership
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres miembro de esta comunidad' },
        { status: 400 }
      );
    }

    if ((membership as any).role === 'owner') {
      return NextResponse.json(
        { error: 'El dueño no puede abandonar la comunidad' },
        { status: 400 }
      );
    }

    // Leave community
    const { error: leaveError } = await supabase()
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', session.user.id);

    if (leaveError) throw leaveError;

    // Decrement member count
    const { data: community } = await supabase()
      .from('communities')
      .select('members_count')
      .eq('id', communityId)
      .single();

    if (community) {
      await supabase()
        .from('communities')
        .update({ members_count: Math.max(0, (community as any).members_count - 1) })
        .eq('id', communityId);
    }

    return NextResponse.json({
      success: true,
      message: 'Has abandonado la comunidad',
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { error: 'Error al abandonar la comunidad' },
      { status: 500 }
    );
  }
}
