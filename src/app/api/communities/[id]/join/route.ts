import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';


// POST /api/communities/[id]/join - Join a community
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const communityId = params.id;

    // Check if community exists
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      return NextResponse.json({ error: 'Comunidad no encontrada' }, { status: 404 });
    }

    // Check if already a member
    const { data: existingMemberRaw } = await supabase
      .from('community_members')
      .select('id, is_banned')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    const existingMember = existingMemberRaw as { id: string; is_banned?: boolean } | null;

    if (existingMember) {
      if (existingMember.is_banned) {
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

    // Join community
    const { error: joinError } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
      } as never);

    if (joinError) throw joinError;

    // Increment member count
    const communityData = community as { members_count: number };
    await supabase
      .from('communities')
      .update({ members_count: communityData.members_count + 1 } as never)
      .eq('id', communityId);

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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const communityId = params.id;

    // Get membership
    const { data: membershipRaw } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    const membership = membershipRaw as { role: string } | null;

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres miembro de esta comunidad' },
        { status: 400 }
      );
    }

    if (membership.role === 'owner') {
      return NextResponse.json(
        { error: 'El dueño no puede abandonar la comunidad' },
        { status: 400 }
      );
    }

    // Leave community
    const { error: leaveError } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (leaveError) throw leaveError;

    // Decrement member count
    const { data: communityRaw } = await supabase
      .from('communities')
      .select('members_count')
      .eq('id', communityId)
      .single();

    const community = communityRaw as { members_count: number } | null;

    if (community) {
      await supabase
        .from('communities')
        .update({ members_count: Math.max(0, community.members_count - 1) } as never)
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
