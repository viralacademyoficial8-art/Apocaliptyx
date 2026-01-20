export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// POST - Toggle bookmark en un reel
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const reelId = params.id;

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el reel existe
    const { data: reel, error: reelError } = await supabase
      .from('user_reels')
      .select('id')
      .eq('id', reelId)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: 'Reel no encontrado' }, { status: 404 });
    }

    // Verificar si ya tiene bookmark
    const { data: existingBookmark } = await supabase
      .from('reel_bookmarks')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', user.id)
      .single();

    if (existingBookmark) {
      // Ya tiene bookmark, quitarlo
      await supabase
        .from('reel_bookmarks')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', user.id);

      return NextResponse.json({ bookmarked: false });
    } else {
      // No tiene bookmark, agregarlo
      const { error: insertError } = await supabase
        .from('reel_bookmarks')
        .insert({
          reel_id: reelId,
          user_id: user.id,
        });

      if (insertError) {
        // Si la tabla no existe, devolver error informativo
        if (insertError.code === '42P01') {
          return NextResponse.json({
            error: 'La tabla reel_bookmarks no existe. Ejecuta el SQL para crearla.',
            bookmarked: false
          });
        }
        throw insertError;
      }

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Error in reel bookmark:', error);
    return NextResponse.json({ error: 'Error interno', bookmarked: false }, { status: 500 });
  }
}

// GET - Verificar si un reel está guardado
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ bookmarked: false });
    }

    const supabase = getSupabaseAdmin();
    const reelId = params.id;

    // Obtener usuario
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ bookmarked: false });
    }

    // Verificar bookmark
    const { data: bookmark } = await supabase
      .from('reel_bookmarks')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json({ bookmarked: false });
  }
}
