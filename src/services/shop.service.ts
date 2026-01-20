// src/services/shop.service.ts

import { getSupabaseBrowser } from "@/lib/supabase-client";

// Roles con AP Coins infinitas
const INFINITE_COINS_ROLES = ['SUPER_ADMIN', 'STAFF', 'MODERATOR'];

export interface ShopItemFromDB {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  type: string;
  rarity: string;
  price: number;
  discount_price: number | null;
  stock: number | null;
  max_per_user: number | null;
  is_active: boolean;
  effects: any[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  purchased_at: string;
  item?: ShopItemFromDB;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  wasFree?: boolean; // Indica si fue gratis por ser admin/staff
}

class ShopService {
  async getItems(): Promise<ShopItemFromDB[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shop items:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getItems:", error);
      return [];
    }
  }

  async getItemById(itemId: string): Promise<ShopItemFromDB | null> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getItemById:", error);
      return null;
    }
  }

  async purchaseItem(
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<PurchaseResult> {
    try {
      // 1. Obtener el item
      const { data: item, error: itemError } = await getSupabaseBrowser()
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError || !item) {
        return { success: false, error: "Item no encontrado" };
      }

      // 2. Verificar stock (aplica para todos)
      if (item.stock !== null && item.stock < quantity) {
        return { success: false, error: "Stock insuficiente" };
      }

      // 3. Obtener usuario con su rol
      const { data: user, error: userError } = await getSupabaseBrowser()
        .from("users")
        .select("ap_coins, role")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return { success: false, error: "Usuario no encontrado" };
      }

      // 4. Verificar si tiene AP Coins infinitas
      const hasInfiniteCoins = INFINITE_COINS_ROLES.includes(user.role);
      
      // 5. Calcular precio total
      const unitPrice = item.discount_price || item.price;
      const totalPrice = unitPrice * quantity;

      // 6. Verificar balance (solo si NO tiene coins infinitas)
      if (!hasInfiniteCoins && user.ap_coins < totalPrice) {
        return { success: false, error: "AP Coins insuficientes" };
      }

      // 7. Verificar límite por usuario (aplica para todos)
      if (item.max_per_user !== null) {
        const { data: existing } = await getSupabaseBrowser()
          .from("user_inventory")
          .select("quantity")
          .eq("user_id", userId)
          .eq("item_id", itemId)
          .maybeSingle();

        const currentQuantity = existing?.quantity || 0;
        if (currentQuantity + quantity > item.max_per_user) {
          return {
            success: false,
            error: `Máximo ${item.max_per_user} unidades por usuario`,
          };
        }
      }

      // 8. Descontar AP Coins (solo si NO tiene coins infinitas)
      let newBalance = user.ap_coins;
      
      if (!hasInfiniteCoins) {
        newBalance = user.ap_coins - totalPrice;
        const { error: updateError } = await getSupabaseBrowser()
          .from("users")
          .update({ ap_coins: newBalance, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating user balance:", updateError);
          return { success: false, error: "Error al procesar el pago" };
        }
      }

      // 9. Registrar compra (con precio 0 si es gratis)
      const { error: purchaseError } = await getSupabaseBrowser()
        .from("user_purchases")
        .insert({
          user_id: userId,
          item_id: itemId,
          quantity: quantity,
          price_paid: hasInfiniteCoins ? 0 : totalPrice,
        });

      if (purchaseError) {
        console.error("Error recording purchase:", purchaseError);
        // Revertir el balance si falla (solo si se descontó)
        if (!hasInfiniteCoins) {
          await getSupabaseBrowser()
            .from("users")
            .update({ ap_coins: user.ap_coins })
            .eq("id", userId);
        }
        return { success: false, error: "Error al registrar la compra" };
      }

      // 10. Añadir al inventario
      const { data: existingItem } = await getSupabaseBrowser()
        .from("user_inventory")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .maybeSingle();

      if (existingItem) {
        await getSupabaseBrowser()
          .from("user_inventory")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);
      } else {
        await getSupabaseBrowser().from("user_inventory").insert({
          user_id: userId,
          item_id: itemId,
          quantity: quantity,
        });
      }

      // 11. Actualizar stock (aplica para todos)
      if (item.stock !== null) {
        await getSupabaseBrowser()
          .from("shop_items")
          .update({ stock: item.stock - quantity })
          .eq("id", itemId);
      }

      return { 
        success: true, 
        newBalance,
        wasFree: hasInfiniteCoins 
      };
    } catch (error) {
      console.error("Error in purchaseItem:", error);
      return { success: false, error: "Error al procesar la compra" };
    }
  }

  async getUserInventory(userId: string): Promise<UserInventoryItem[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("user_inventory")
        .select("*, item:shop_items(*)")
        .eq("user_id", userId)
        .gt("quantity", 0)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Error fetching user inventory:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserInventory:", error);
      return [];
    }
  }

  async getPurchaseHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseBrowser()
        .from("user_purchases")
        .select("*, item:shop_items(name, type, rarity, icon)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching purchase history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPurchaseHistory:", error);
      return [];
    }
  }

  async useItem(userId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: inventoryItem, error } = await getSupabaseBrowser()
        .from("user_inventory")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single();

      if (error || !inventoryItem) {
        return { success: false, error: "No tienes este item" };
      }

      if (inventoryItem.quantity <= 0) {
        return { success: false, error: "No te quedan unidades de este item" };
      }

      const newQuantity = inventoryItem.quantity - 1;
      
      if (newQuantity === 0) {
        await getSupabaseBrowser()
          .from("user_inventory")
          .delete()
          .eq("id", inventoryItem.id);
      } else {
        await getSupabaseBrowser()
          .from("user_inventory")
          .update({ quantity: newQuantity })
          .eq("id", inventoryItem.id);
      }

      return { success: true };
    } catch (error) {
      console.error("Error in useItem:", error);
      return { success: false, error: "Error al usar el item" };
    }
  }

  async toggleEquip(
    userId: string,
    itemId: string
  ): Promise<{ success: boolean; isEquipped?: boolean; error?: string }> {
    try {
      const { data: inventoryItem, error } = await getSupabaseBrowser()
        .from("user_inventory")
        .select("id, is_equipped")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single();

      if (error || !inventoryItem) {
        return { success: false, error: "No tienes este item" };
      }

      const newEquipped = !inventoryItem.is_equipped;

      await getSupabaseBrowser()
        .from("user_inventory")
        .update({ is_equipped: newEquipped })
        .eq("id", inventoryItem.id);

      return { success: true, isEquipped: newEquipped };
    } catch (error) {
      console.error("Error in toggleEquip:", error);
      return { success: false, error: "Error al equipar el item" };
    }
  }
}

export const shopService = new ShopService();