import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';


// POST /api/collectibles/purchase - Purchase a collectible
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { collectibleId } = await request.json();

    if (!collectibleId) {
      return NextResponse.json({ error: 'Collectible ID requerido' }, { status: 400 });
    }

    // Use the purchase_collectible function
    const { data, error } = await supabase.rpc('purchase_collectible' as never, {
      p_user_id: user.id,
      p_collectible_id: collectibleId,
    } as never);

    if (error) throw error;

    const result = data as { success: boolean; error?: string; collectible_name?: string; serial_number?: number; cost?: number } | null;

    if (!result?.success) {
      return NextResponse.json({ error: result?.error || 'Error desconocido' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `¡Has comprado ${result.collectible_name}!`,
      serialNumber: result.serial_number,
      cost: result.cost,
    });
  } catch (error) {
    console.error('Error purchasing collectible:', error);
    return NextResponse.json(
      { error: 'Error al comprar coleccionable' },
      { status: 500 }
    );
  }
}
