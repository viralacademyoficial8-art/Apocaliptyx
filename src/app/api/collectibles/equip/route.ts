import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';


// POST /api/collectibles/equip - Equip a collectible
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { collectibleId, slot } = await request.json();

    if (!collectibleId) {
      return NextResponse.json({ error: 'Collectible ID requerido' }, { status: 400 });
    }

    // Verify user owns this collectible
    const { data: userCollectible, error: verifyError } = await supabase
      .from('user_collectibles')
      .select('*, collectible:collectibles(*)')
      .eq('user_id', user.id)
      .eq('collectible_id', collectibleId)
      .single();

    if (verifyError || !userCollectible) {
      return NextResponse.json(
        { error: 'No tienes este coleccionable' },
        { status: 400 }
      );
    }

    // Determine the slot based on collectible type
    const collectibleData = userCollectible as { collectible?: { type?: string } };
    const collectibleType = collectibleData.collectible?.type;
    let equipSlot: string;

    switch (collectibleType) {
      case 'frame':
        equipSlot = 'equipped_frame';
        break;
      case 'effect':
        equipSlot = 'equipped_effect';
        break;
      case 'background':
        equipSlot = 'equipped_background';
        break;
      default:
        return NextResponse.json(
          { error: 'Este tipo de coleccionable no se puede equipar' },
          { status: 400 }
        );
    }

    // Update user's equipped item
    const updateData: Record<string, string> = { [equipSlot]: collectibleId };
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as never)
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Coleccionable equipado',
      slot: equipSlot,
    });
  } catch (error) {
    console.error('Error equipping collectible:', error);
    return NextResponse.json(
      { error: 'Error al equipar coleccionable' },
      { status: 500 }
    );
  }
}

// DELETE /api/collectibles/equip - Unequip a collectible
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slot } = await request.json();

    const validSlots = ['equipped_frame', 'equipped_effect', 'equipped_background'];
    if (!slot || !validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Slot inválido' }, { status: 400 });
    }

    // Update user's equipped item to null
    const updateData: Record<string, null> = { [slot]: null };
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as never)
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Coleccionable desequipado',
    });
  } catch (error) {
    console.error('Error unequipping collectible:', error);
    return NextResponse.json(
      { error: 'Error al desequipar coleccionable' },
      { status: 500 }
    );
  }
}
