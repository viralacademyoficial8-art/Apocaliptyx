import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/communities/[id]/join - Join a community
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

    // Join community
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
      .update({ members_count: (community as any).members_count + 1 })
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
