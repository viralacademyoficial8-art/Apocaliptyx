import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { notificationsService } from '@/services/notifications.service';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// GET /api/communities/[id]/requests - Get pending join requests (for admins)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin/owner
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes((membership as any).role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    // Get pending requests with user info
    const { data: requests, error } = await supabase()
      .from('community_join_requests')
      .select(`
        id,
        user_id,
        message,
        status,
        created_at,
        users:user_id (
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .eq('community_id', communityId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id]/requests - Approve or reject a request
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

    const body = await request.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Check if user is admin/owner
    const { data: membership } = await supabase()
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes((membership as any).role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    // Get the request
    const { data: joinRequest, error: requestError } = await supabase()
      .from('community_join_requests')
      .select('*')
      .eq('id', requestId)
      .eq('community_id', communityId)
      .single();

    if (requestError || !joinRequest) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    const requestData = joinRequest as any;

    if (requestData.status !== 'pending') {
      return NextResponse.json({ error: 'Esta solicitud ya fue procesada' }, { status: 400 });
    }

    // Get community info for notification
    const { data: community } = await supabase()
      .from('communities')
      .select('name, slug, members_count')
      .eq('id', communityId)
      .single();

    const communityInfo = community as any;

    if (action === 'approve') {
      // Add user as member
      const { error: memberError } = await supabase()
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: requestData.user_id,
          role: 'member',
        });

      if (memberError) throw memberError;

      // Increment member count
      await supabase()
        .from('communities')
        .update({ members_count: (communityInfo?.members_count || 0) + 1 })
        .eq('id', communityId);

      // Update request status
      await supabase()
        .from('community_join_requests')
        .update({
          status: 'approved',
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      // Notify user their request was approved
      await notificationsService.notify(
        requestData.user_id,
        'community_request_approved',
        `Tu solicitud para unirte a ${communityInfo?.name || 'la comunidad'} fue aprobada`,
        undefined,
        `/foro/comunidad/${communityInfo?.slug || communityId}`
      );

      return NextResponse.json({
        success: true,
        message: 'Solicitud aprobada',
      });
    } else {
      // Reject request
      await supabase()
        .from('community_join_requests')
        .update({
          status: 'rejected',
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      // Notify user their request was rejected
      await notificationsService.notify(
        requestData.user_id,
        'community_request_rejected',
        `Tu solicitud para unirte a ${communityInfo?.name || 'la comunidad'} fue rechazada`,
        undefined,
        `/comunidades`
      );

      return NextResponse.json({
        success: true,
        message: 'Solicitud rechazada',
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
