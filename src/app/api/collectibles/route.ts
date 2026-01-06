import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';


// GET /api/collectibles - Get collectibles store or inventory
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'store' or 'inventory'
    const category = searchParams.get('category'); // 'frame', 'effect', 'background', etc.

    const { data: { user } } = await supabase.auth.getUser();

    if (type === 'inventory' && !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (type === 'inventory') {
      // Get user's collectibles
      const { data: userCollectibles, error } = await supabase
        .from('user_collectibles')
        .select(`
          *,
          collectible:collectibles(*)
        `)
        .eq('user_id', user!.id)
        .order('acquired_at', { ascending: false });

      if (error) throw error;

      // Get user's equipped items
      const { data: userDataRaw } = await supabase
        .from('users')
        .select('equipped_frame, equipped_effect, equipped_background')
        .eq('id', user!.id)
        .single();

      const userData = userDataRaw as { equipped_frame?: string; equipped_effect?: string; equipped_background?: string } | null;

      interface UserCollectibleWithJoin {
        acquired_at: string;
        serial_number?: number;
        collectible?: {
          id: string;
          name: string;
          name_es: string;
          description?: string;
          type: string;
          rarity: string;
          asset_url: string;
          preview_url?: string;
          is_tradeable: boolean;
          is_limited: boolean;
          current_supply: number;
        };
      }

      const inventory = (userCollectibles as UserCollectibleWithJoin[] | null)?.map(uc => ({
        id: uc.collectible?.id,
        name: uc.collectible?.name,
        nameEs: uc.collectible?.name_es,
        description: uc.collectible?.description,
        type: uc.collectible?.type,
        rarity: uc.collectible?.rarity,
        assetUrl: uc.collectible?.asset_url,
        previewUrl: uc.collectible?.preview_url,
        isTradeable: uc.collectible?.is_tradeable,
        isLimited: uc.collectible?.is_limited,
        currentSupply: uc.collectible?.current_supply,
        acquiredAt: uc.acquired_at,
        serialNumber: uc.serial_number,
        isOwned: true,
        isEquipped:
          userData?.equipped_frame === uc.collectible?.id ||
          userData?.equipped_effect === uc.collectible?.id ||
          userData?.equipped_background === uc.collectible?.id,
      })) || [];

      return NextResponse.json({ inventory, equipped: userData });
    } else {
      // Get store collectibles
      let query = supabase
        .from('collectibles')
        .select('*')
        .not('ap_cost', 'is', null)
        .order('rarity')
        .order('ap_cost');

      if (category && category !== 'all') {
        query = query.eq('type', category);
      }

      const { data: collectiblesRaw, error } = await query;

      if (error) throw error;

      interface CollectibleRow {
        id: string;
        name: string;
        name_es: string;
        description?: string;
        type: string;
        rarity: string;
        asset_url: string;
        preview_url?: string;
        ap_cost?: number;
        is_tradeable: boolean;
        is_limited: boolean;
        max_supply?: number;
        current_supply: number;
      }

      const collectibles = collectiblesRaw as CollectibleRow[] | null;

      // Get user's owned collectibles if logged in
      let ownedIds: string[] = [];
      if (user) {
        const { data: userCollectibles } = await supabase
          .from('user_collectibles')
          .select('collectible_id')
          .eq('user_id', user.id);

        ownedIds = (userCollectibles as { collectible_id: string }[] | null)?.map(uc => uc.collectible_id) || [];
      }

      const store = collectibles?.map(c => ({
        id: c.id,
        name: c.name,
        nameEs: c.name_es,
        description: c.description,
        type: c.type,
        rarity: c.rarity,
        assetUrl: c.asset_url,
        previewUrl: c.preview_url,
        apCost: c.ap_cost,
        isTradeable: c.is_tradeable,
        isLimited: c.is_limited,
        maxSupply: c.max_supply,
        currentSupply: c.current_supply,
        isOwned: ownedIds.includes(c.id),
      })) || [];

      return NextResponse.json({ store });
    }
  } catch (error) {
    console.error('Error fetching collectibles:', error);
    return NextResponse.json(
      { error: 'Error al obtener coleccionables' },
      { status: 500 }
    );
  }
}
