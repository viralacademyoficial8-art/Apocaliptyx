'use client';

import { notFound } from 'next/navigation';
import { useShopStore } from '@/stores/shopStore';
import { ShopItemDetail, PurchaseModal } from '@/components/tienda';

export default function ItemDetailPage({ params }: { params: { itemId: string } }) {
  const item = useShopStore.getState().getItemById(params.itemId);

  if (!item) return notFound();

  return (
    <>
      <ShopItemDetail item={item} />
      <PurchaseModal />
    </>
  );
}
