// src/app/api/profile/inventory/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: items, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        quantity,
        expires_at,
        is_active,
        purchased_at,
        shop_items (
          id,
          name,
          description,
          image_url,
          type,
          effect
        )
      `)
      .eq('user_id', currentUser.id)
      .gt('quantity', 0);

    if (error) throw error;

    const inventory = (items || []).map((item: any) => ({
      id: item.id,
      itemId: item.shop_items?.id,
      name: item.shop_items?.name || 'Unknown Item',
      description: item.shop_items?.description || '',
      type: item.shop_items?.type || 'SPECIAL',
      rarity: getRarityFromEffect(item.shop_items?.effect),
      quantity: item.quantity,
      isEquipped: item.is_active,
      purchasedAt: item.purchased_at,
      expiresAt: item.expires_at,
    }));

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Equip/Unequip/Use item
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { itemId, action } = await request.json();

    if (!itemId || !['equip', 'unequip', 'use'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify ownership
    const { data: item } = await supabase
      .from('inventory_items')
      .select('id, quantity')
      .eq('id', itemId)
      .eq('user_id', currentUser.id)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (action === 'use') {
      if (item.quantity <= 1) {
        await supabase.from('inventory_items').delete().eq('id', itemId);
      } else {
        await supabase
          .from('inventory_items')
          .update({ quantity: item.quantity - 1 })
          .eq('id', itemId);
      }
    } else {
      await supabase
        .from('inventory_items')
        .update({ is_active: action === 'equip' })
        .eq('id', itemId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRarityFromEffect(effect: any): 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' {
  if (!effect) return 'COMMON';
  if (effect.value >= 3) return 'LEGENDARY';
  if (effect.value >= 2) return 'EPIC';
  if (effect.value >= 1.5) return 'RARE';
  return 'COMMON';
}
