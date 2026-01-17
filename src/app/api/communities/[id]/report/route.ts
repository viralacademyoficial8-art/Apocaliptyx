import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/communities/[id]/report - Report a community
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

    const body = await request.json();
    const { reason, description } = body;

    if (!reason || !['spam', 'inappropriate', 'harassment', 'misinformation', 'other'].includes(reason)) {
      return NextResponse.json({ error: 'Motivo inválido' }, { status: 400 });
    }

    // Check if community exists
    const { data: community, error: communityError } = await supabase()
      .from('communities')
      .select('id')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      return NextResponse.json({ error: 'Comunidad no encontrada' }, { status: 404 });
    }

    // Check if already reported by this user
    const { data: existingReport } = await supabase()
      .from('community_reports')
      .select('id')
      .eq('community_id', communityId)
      .eq('reporter_id', session.user.id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'Ya has reportado esta comunidad' },
        { status: 400 }
      );
    }

    // Create report
    const { error: reportError } = await supabase()
      .from('community_reports')
      .insert({
        community_id: communityId,
        reporter_id: session.user.id,
        reason,
        description: description || null,
        status: 'pending',
      });

    if (reportError) throw reportError;

    return NextResponse.json({
      success: true,
      message: 'Reporte enviado. Gracias por ayudarnos a mantener la comunidad segura.',
    });
  } catch (error) {
    console.error('Error reporting community:', error);
    return NextResponse.json(
      { error: 'Error al enviar reporte' },
      { status: 500 }
    );
  }
}
