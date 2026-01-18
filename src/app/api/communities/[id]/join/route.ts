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
          try {
            await notificationsService.create({
              userId: admin.user_id,
              type: 'community_join_request',
              title: 'Nueva solicitud de admisión',
              message: `${requesterData?.username || 'Un usuario'} quiere unirse a ${communityData.name}`,
              imageUrl: requesterData?.avatar_url,
              linkUrl: `/foro/comunidad/${communityData.slug}`
            });
          } catch (notifError) {
            console.error('Error sending join request notification:', notifError);
          }
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

    // Increment member count atomically
    try {
      await supabase().rpc('increment', {
        row_id: communityId,
        table_name: 'communities',
        column_name: 'members_count'
      });
    } catch (countError) {
      console.error('Error incrementing member count:', countError);
    }

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
          try {
            await notificationsService.notifyCommunityNewMember(
              admin.user_id,
              memberData?.username || 'Usuario',
              memberData?.avatar_url,
              communityData.name || 'Comunidad',
              communityId
            );
          } catch (notifError) {
            console.error('Error sending new member notification:', notifError);
          }
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
    const { searchParams } = new URL(request.url);
    const confirmTransfer = searchParams.get('confirmTransfer') === 'true';

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

    const isOwner = (membership as any).role === 'owner';

    if (isOwner) {
      // Get total member count
      const { data: membersData } = await supabase()
        .from('community_members')
        .select('user_id, role, joined_at')
        .eq('community_id', communityId)
        .eq('is_banned', false)
        .order('joined_at', { ascending: true });

      const members = membersData as { user_id: string; role: string; joined_at: string }[] || [];

      // If owner is the only member, they can't leave (must delete community)
      if (members.length <= 1) {
        return NextResponse.json(
          { error: 'Eres el único miembro. Debes eliminar la comunidad desde la configuración.' },
          { status: 400 }
        );
      }

      // Find the next member (excluding the owner, prioritize admins, then by join date)
      const otherMembers = members.filter(m => m.user_id !== session.user.id);
      const admins = otherMembers.filter(m => m.role === 'admin');
      const nextOwner = admins.length > 0 ? admins[0] : otherMembers[0];

      if (!nextOwner) {
        return NextResponse.json(
          { error: 'No hay otros miembros para transferir la propiedad' },
          { status: 400 }
        );
      }

      // Get next owner info for response
      const { data: nextOwnerInfo } = await supabase()
        .from('users')
        .select('username, display_name')
        .eq('id', nextOwner.user_id)
        .single();

      const nextOwnerData = nextOwnerInfo as { username: string; display_name?: string } | null;
      const nextOwnerName = nextOwnerData?.display_name || nextOwnerData?.username || 'otro miembro';

      // If not confirmed, return info about who will become the new owner
      if (!confirmTransfer) {
        return NextResponse.json({
          requiresConfirmation: true,
          nextOwner: {
            userId: nextOwner.user_id,
            username: nextOwnerData?.username,
            displayName: nextOwnerData?.display_name,
          },
          message: `Si abandonas, ${nextOwnerName} se convertirá en el nuevo propietario.`,
        });
      }

      // Transfer ownership
      await supabase()
        .from('community_members')
        .update({ role: 'owner' })
        .eq('community_id', communityId)
        .eq('user_id', nextOwner.user_id);

      // Get community info for notification
      const { data: communityInfo } = await supabase()
        .from('communities')
        .select('name, slug, creator_id')
        .eq('id', communityId)
        .single();

      const community = communityInfo as { name: string; slug: string; creator_id: string } | null;

      // Update community creator_id
      await supabase()
        .from('communities')
        .update({ creator_id: nextOwner.user_id })
        .eq('id', communityId);

      // Notify the new owner
      await notificationsService.create({
        userId: nextOwner.user_id,
        type: 'community_ownership_transferred',
        title: '¡Ahora eres propietario!',
        message: `Has sido nombrado propietario de la comunidad "${community?.name}"`,
        linkUrl: `/foro/comunidad/${community?.slug}`,
      });

      // Remove the old owner from the community
      await supabase()
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', session.user.id);

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
        ownershipTransferred: true,
        newOwner: nextOwnerName,
        message: `Has abandonado la comunidad. ${nextOwnerName} es el nuevo propietario.`,
      });
    }

    // Non-owner: just leave
    const { error: leaveError } = await supabase()
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', session.user.id);

    if (leaveError) throw leaveError;

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
