"use client";

import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useShopStore } from "@/stores/shopStore";
import { Navbar } from "@/components/Navbar";
import {
  ShopHero,
  CategoryTabs,
  ShopFilters,
  ShopItemGrid,
  FeaturedItems,
  ShopCartSidebar,
  PurchaseModal,
} from "@/components/tienda";

export default function TiendaPage() {
  const { setCartOpen, getCartItemCount, loadItems } = useShopStore();
  const cartItemCount = getCartItemCount();

  // Cargar items de Supabase al montar
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
      >
        <ShoppingCart className="w-5 h-5" />
        Carrito
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShopHero />

        <div className="mt-12">
          <FeaturedItems />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Todos los Items</h2>

          <div className="mb-6">
            <CategoryTabs />
          </div>

          <div className="mb-8">
            <ShopFilters />
          </div>

          <ShopItemGrid />
        </div>
      </div>

      <ShopCartSidebar />
      <PurchaseModal />
    </div>
  );
}