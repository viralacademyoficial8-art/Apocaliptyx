// src/services/shop.service.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  acquired_at: string;
  expires_at: string | null;
  item?: ShopItemFromDB;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: number;
}

class ShopService {
  /**
   * Obtener todos los items activos de la tienda
   */
  async getItems(): Promise<ShopItemFromDB[]> {
    try {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shop items:", error);
        return [];
      }

      return data as ShopItemFromDB[];
    } catch (error) {
      console.error("Error in getItems:", error);
      return [];
    }
  }

  /**
   * Obtener un item por ID
   */
  async getItemById(itemId: string): Promise<ShopItemFromDB | null> {
    try {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        return null;
      }

      return data as ShopItemFromDB;
    } catch (error) {
      console.error("Error in getItemById:", error);
      return null;
    }
  }

  /**
   * Comprar un item - descuenta AP Coins y añade al inventario
   */
  async purchaseItem(
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<PurchaseResult> {
    try {
      // 1. Obtener el item
      const { data: item, error: itemError } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError || !item) {
        return { success: false, error: "Item no encontrado" };
      }

      // 2. Verificar stock
      if (item.stock !== null && item.stock < quantity) {
        return { success: false, error: "Stock insuficiente" };
      }

      // 3. Calcular precio total (usar discount_price si existe)
      const unitPrice = item.discount_price || item.price;
      const totalPrice = unitPrice * quantity;

      // 4. Obtener usuario y verificar balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("ap_coins")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return { success: false, error: "Usuario no encontrado" };
      }

      if (user.ap_coins < totalPrice) {
        return { success: false, error: "AP Coins insuficientes" };
      }

      // 5. Verificar límite por usuario
      if (item.max_per_user !== null) {
        const { data: existingInventory } = await supabase
          .from("user_inventory")
          .select("quantity")
          .eq("user_id", userId)
          .eq("item_id", itemId)
          .single();

        const currentQuantity = existingInventory?.quantity || 0;
        if (currentQuantity + quantity > item.max_per_user) {
          return {
            success: false,
            error: `Máximo ${item.max_per_user} unidades por usuario`,
          };
        }
      }

      // 6. Descontar AP Coins del usuario
      const newBalance = user.ap_coins - totalPrice;
      const { error: updateError } = await supabase
        .from("users")
        .update({ ap_coins: newBalance, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user balance:", updateError);
        return { success: false, error: "Error al procesar el pago" };
      }

      // 7. Registrar la compra
      const { error: purchaseError } = await supabase
        .from("user_purchases")
        .insert({
          user_id: userId,
          item_id: itemId,
          quantity: quantity,
          price_paid: totalPrice,
        });

      if (purchaseError) {
        console.error("Error recording purchase:", purchaseError);
        // Revertir el balance si falla
        await supabase
          .from("users")
          .update({ ap_coins: user.ap_coins })
          .eq("id", userId);
        return { success: false, error: "Error al registrar la compra" };
      }

      // 8. Añadir al inventario (o actualizar cantidad)
      const { data: existingItem } = await supabase
        .from("user_inventory")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single();

      if (existingItem) {
        // Actualizar cantidad
        await supabase
          .from("user_inventory")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);
      } else {
        // Insertar nuevo
        await supabase.from("user_inventory").insert({
          user_id: userId,
          item_id: itemId,
          quantity: quantity,
        });
      }

      // 9. Actualizar stock del item (si no es ilimitado)
      if (item.stock !== null) {
        await supabase
          .from("shop_items")
          .update({ stock: item.stock - quantity })
          .eq("id", itemId);
      }

      return { success: true, newBalance };
    } catch (error) {
      console.error("Error in purchaseItem:", error);
      return { success: false, error: "Error al procesar la compra" };
    }
  }

  /**
   * Obtener inventario del usuario
   */
  async getUserInventory(userId: string): Promise<UserInventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from("user_inventory")
        .select(`
          *,
          item:shop_items(*)
        `)
        .eq("user_id", userId)
        .gt("quantity", 0)
        .order("acquired_at", { ascending: false });

      if (error) {
        console.error("Error fetching user inventory:", error);
        return [];
      }

      return data as UserInventoryItem[];
    } catch (error) {
      console.error("Error in getUserInventory:", error);
      return [];
    }
  }

  /**
   * Obtener historial de compras del usuario
   */
  async getPurchaseHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("user_purchases")
        .select(`
          *,
          item:shop_items(name, type, rarity, icon)
        `)
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

  /**
   * Usar un item del inventario
   */
  async useItem(userId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: inventoryItem, error } = await supabase
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

      // Reducir cantidad
      const newQuantity = inventoryItem.quantity - 1;
      
      if (newQuantity === 0) {
        // Eliminar del inventario
        await supabase
          .from("user_inventory")
          .delete()
          .eq("id", inventoryItem.id);
      } else {
        // Actualizar cantidad
        await supabase
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

  /**
   * Equipar/desequipar un item cosmético
   */
  async toggleEquip(
    userId: string,
    itemId: string
  ): Promise<{ success: boolean; isEquipped?: boolean; error?: string }> {
    try {
      const { data: inventoryItem, error } = await supabase
        .from("user_inventory")
        .select("id, is_equipped")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single();

      if (error || !inventoryItem) {
        return { success: false, error: "No tienes este item" };
      }

      const newEquipped = !inventoryItem.is_equipped;

      await supabase
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