export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET - Obtener títulos del usuario (propios y disponibles)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, active_title_id')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener todos los títulos disponibles
    const { data: allTitles, error: titlesError } = await supabase
      .from('title_definitions')
      .select('id, name, description, rarity, icon, is_active')
      .eq('is_active', true)
      .order('rarity', { ascending: false });

    if (titlesError) {
      console.error('Error fetching titles:', titlesError);
      // Si la tabla no existe, devolver array vacío
      return NextResponse.json({ titles: [], activeTitle: null });
    }

    // Obtener títulos que el usuario posee
    const { data: userTitles, error: userTitlesError } = await supabase
      .from('user_titles')
      .select('title_id')
      .eq('user_id', user.id);

    const ownedTitleIds = new Set(userTitles?.map(ut => ut.title_id) || []);

    // Formatear títulos con información de propiedad
    const formattedTitles = allTitles?.map(title => ({
      id: title.id,
      name: title.name,
      description: title.description,
      rarity: title.rarity,
      icon: title.icon,
      isOwned: ownedTitleIds.has(title.id),
    })) || [];

    return NextResponse.json({
      titles: formattedTitles,
      activeTitle: user.active_title_id,
    });
  } catch (error) {
    console.error('Error in GET titles:', error);
    return NextResponse.json({ titles: [], activeTitle: null });
  }
}

// PUT - Actualizar título activo
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { titleId } = await request.json();

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si titleId es null, quitar el título activo
    if (!titleId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ active_title_id: null })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Verificar que el usuario posee el título
    const { data: userTitle, error: ownershipError } = await supabase
      .from('user_titles')
      .select('id')
      .eq('user_id', user.id)
      .eq('title_id', titleId)
      .single();

    if (ownershipError || !userTitle) {
      return NextResponse.json({ error: 'No posees este título' }, { status: 403 });
    }

    // Actualizar título activo
    const { error: updateError } = await supabase
      .from('users')
      .update({ active_title_id: titleId })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT title:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
