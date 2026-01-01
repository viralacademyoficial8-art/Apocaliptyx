"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { shopService, UserInventoryItem } from "@/services/shop.service";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Package,
  Loader2,
  ShoppingBag,
  Shield,
  Zap,
  Eye,
  Sparkles,
  Gift,
  Box,
  ArrowLeft,
  Check,
} from "lucide-react";
import Link from "next/link";

// Iconos por tipo de item
const typeIcons: Record<string, React.ElementType> = {
  PROTECTION: Shield,
  BOOST: Zap,
  POWER: Eye,
  COSMETIC: Sparkles,
  SPECIAL: Gift,
  BUNDLE: Box,
};

// Colores por rareza
const rarityColors: Record<string, string> = {
  COMMON: "border-gray-500 bg-gray-500/10",
  RARE: "border-blue-500 bg-blue-500/10",
  EPIC: "border-purple-500 bg-purple-500/10",
  LEGENDARY: "border-yellow-500 bg-yellow-500/10",
};

const rarityTextColors: Record<string, string> = {
  COMMON: "text-gray-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-yellow-400",
};

export default function InventarioPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [usingItem, setUsingItem] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const loadInventory = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await shopService.getUserInventory(user.id);
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    loadInventory();
  }, [hydrated, user?.id, router, loadInventory]);

  const handleUseItem = async (itemId: string) => {
    if (!user?.id) return;

    setUsingItem(itemId);
    try {
      const result = await shopService.useItem(user.id, itemId);
      if (result.success) {
        // Recargar inventario
        await loadInventory();
      } else {
        alert(result.error || "Error al usar el item");
      }
    } catch (error) {
      console.error("Error using item:", error);
    } finally {
      setUsingItem(null);
    }
  };

  const handleToggleEquip = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const result = await shopService.toggleEquip(user.id, itemId);
      if (result.success) {
        setInventory((prev) =>
          prev.map((inv) =>
            inv.item_id === itemId
              ? { ...inv, is_equipped: result.isEquipped || false }
              : inv
          )
        );
      }
    } catch (error) {
      console.error("Error toggling equip:", error);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Cargando inventario...</span>
        </div>
      </div>
    );
  }

  // Agrupar por tipo
  const groupedInventory = inventory.reduce((acc, inv) => {
    const type = inv.item?.type || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(inv);
    return acc;
  }, {} as Record<string, UserInventoryItem[]>);

  const typeLabels: Record<string, string> = {
    PROTECTION: "Protección",
    BOOST: "Potenciadores",
    POWER: "Poderes",
    COSMETIC: "Cosméticos",
    SPECIAL: "Especiales",
    BUNDLE: "Packs",
    OTHER: "Otros",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-500" />
                Mi Inventario
              </h1>
              <p className="text-gray-400 text-sm">
                {inventory.length} items en tu inventario
              </p>
            </div>
          </div>

          <Link
            href="/tienda"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Ir a la Tienda
          </Link>
        </div>

        {/* Inventario vacío */}
        {inventory.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Tu inventario está vacío</h2>
            <p className="text-gray-400 mb-6">
              Compra items en la tienda para verlos aquí
            </p>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Explorar Tienda
            </Link>
          </div>
        ) : (
          /* Lista de items agrupados por tipo */
          <div className="space-y-8">
            {Object.entries(groupedInventory).map(([type, items]) => {
              const Icon = typeIcons[type] || Package;
              return (
                <div key={type}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-purple-400" />
                    {typeLabels[type] || type}
                    <span className="text-gray-500 text-sm font-normal">
                      ({items.length})
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((inv) => {
                      const item = inv.item;
                      if (!item) return null;

                      const rarity = item.rarity || "COMMON";
                      const isCosmetic = item.type === "COSMETIC";

                      return (
                        <div
                          key={inv.id}
                          className={`relative border-2 rounded-xl p-4 ${rarityColors[rarity]} transition-all hover:scale-[1.02]`}
                        >
                          {/* Badge cantidad */}
                          {inv.quantity > 1 && (
                            <span className="absolute -top-2 -right-2 w-7 h-7 bg-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                              x{inv.quantity}
                            </span>
                          )}

                          {/* Equipado badge */}
                          {inv.is_equipped && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Equipado
                            </span>
                          )}

                          {/* Icono */}
                          <div className="flex justify-center mb-3 mt-2">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
                              {item.icon || "📦"}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="text-center">
                            <h3 className="font-bold text-white mb-1">
                              {item.name}
                            </h3>
                            <p
                              className={`text-xs font-medium mb-2 ${rarityTextColors[rarity]}`}
                            >
                              {rarity}
                            </p>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Botones */}
                          <div className="mt-4 flex gap-2">
                            {isCosmetic ? (
                              <button
                                onClick={() => handleToggleEquip(inv.item_id)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  inv.is_equipped
                                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                    : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                }`}
                              >
                                {inv.is_equipped ? "Desequipar" : "Equipar"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUseItem(inv.item_id)}
                                disabled={usingItem === inv.item_id}
                                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {usingItem === inv.item_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    Usar
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Historial de compras link */}
        <div className="mt-12 text-center">
          <Link
            href="/historial-compras"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Ver historial de compras →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}