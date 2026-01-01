// src/stores/shopStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shopService, ShopItemFromDB } from '@/services/shop.service';
import { notificationsService } from '@/services/notifications.service';

// ============================================
// TYPES
// ============================================

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  imageUrl: string | null;
  type: 'PROTECTION' | 'POWER' | 'BOOST' | 'COSMETIC' | 'SPECIAL' | 'BUNDLE';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  price: number;
  originalPrice?: number;
  stock: number | null;
  maxPerUser: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  saleEndsAt?: string;
  effects?: any[];
  tags: string[];
  purchaseCount: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  item: ShopItem;
  quantity: number;
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  purchasedAt: string;
}

// ============================================
// HELPER: Convert DB item to Store item
// ============================================

function mapDBItemToStoreItem(dbItem: ShopItemFromDB): ShopItem {
  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description,
    longDescription: dbItem.long_description || undefined,
    imageUrl: dbItem.image_url,
    type: dbItem.type as ShopItem['type'],
    rarity: dbItem.rarity as ShopItem['rarity'],
    price: dbItem.price,
    originalPrice: dbItem.original_price || undefined,
    stock: dbItem.stock,
    maxPerUser: dbItem.max_per_user,
    isActive: dbItem.is_active,
    isFeatured: dbItem.is_featured,
    isNew: dbItem.is_new,
    isOnSale: dbItem.is_on_sale,
    saleEndsAt: dbItem.sale_ends_at || undefined,
    effects: dbItem.effects || undefined,
    tags: dbItem.tags || [],
    purchaseCount: dbItem.purchase_count || 0,
    rating: dbItem.rating || 0,
    reviews: dbItem.reviews_count || 0,
  };
}

// ============================================
// STORE INTERFACE
// ============================================

interface ShopStore {
  items: ShopItem[];
  cart: CartItem[];
  purchaseHistory: PurchaseHistory[];
  isLoading: boolean;
  error: string | null;

  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;

  filters: {
    search: string;
    category: string;
    rarity: string;
    sortBy: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
    showOnSale: boolean;
  };

  isCartOpen: boolean;
  isPurchaseModalOpen: boolean;
  selectedItem: ShopItem | null;

  // Data loading
  loadItems: () => Promise<void>;
  setItems: (items: ShopItem[]) => void;
  
  getItemById: (id: string) => ShopItem | undefined;
  getFilteredItems: () => ShopItem[];
  getFeaturedItems: () => ShopItem[];
  getItemsByCategory: (category: string) => ShopItem[];

  addToCart: (item: ShopItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  purchaseCart: () => Promise<{ success: boolean; newBalance?: number; error?: string }>;
  purchaseItem: (item: ShopItem, quantity: number) => Promise<{ success: boolean; newBalance?: number; error?: string }>;

  setFilters: (filters: Partial<ShopStore['filters']>) => void;
  resetFilters: () => void;

  setCartOpen: (open: boolean) => void;
  setPurchaseModalOpen: (open: boolean) => void;
  setSelectedItem: (item: ShopItem | null) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      items: [],
      cart: [],
      purchaseHistory: [],
      isLoading: false,
      error: null,
      currentUserId: null,

      filters: {
        search: '',
        category: 'all',
        rarity: 'all',
        sortBy: 'popular',
        showOnSale: false,
      },

      isCartOpen: false,
      isPurchaseModalOpen: false,
      selectedItem: null,

      setCurrentUserId: (id) => set({ currentUserId: id }),

      // Cargar items desde Supabase
      loadItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const dbItems = await shopService.getItems();
          const items = dbItems.map(mapDBItemToStoreItem);
          set({ items, isLoading: false });
        } catch (error) {
          console.error('Error loading shop items:', error);
          set({ error: 'Error al cargar la tienda', isLoading: false });
        }
      },

      setItems: (items) => set({ items }),

      getItemById: (id) => get().items.find((item) => item.id === id),

      getFilteredItems: () => {
        const { items, filters } = get();
        let filtered = items.filter((item) => item.isActive);

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search) ||
              item.tags.some((tag) => tag.toLowerCase().includes(search))
          );
        }

        if (filters.category !== 'all') {
          filtered = filtered.filter((item) => item.type === filters.category);
        }

        if (filters.rarity !== 'all') {
          filtered = filtered.filter((item) => item.rarity === filters.rarity);
        }

        if (filters.showOnSale) {
          filtered = filtered.filter((item) => item.isOnSale);
        }

        switch (filters.sortBy) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'popular':
          default:
            filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
        }

        return filtered;
      },

      getFeaturedItems: () => get().items.filter((item) => item.isFeatured && item.isActive),

      getItemsByCategory: (category) => get().items.filter((item) => item.type === category && item.isActive),

      addToCart: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.cart.findIndex((ci) => ci.item.id === item.id);

          if (existingIndex >= 0) {
            const newCart = [...state.cart];
            const currentQty = newCart[existingIndex].quantity;
            const newQuantity = currentQty + quantity;

            if (item.maxPerUser && newQuantity > item.maxPerUser) return state;
            if (item.stock !== null && newQuantity > item.stock) return state;

            newCart[existingIndex].quantity = newQuantity;
            return { cart: newCart };
          }

          if (item.maxPerUser && quantity > item.maxPerUser) return state;
          if (item.stock !== null && quantity > item.stock) return state;

          return { cart: [...state.cart, { item, quantity }] };
        });
      },

      removeFromCart: (itemId) => set((state) => ({ cart: state.cart.filter((ci) => ci.item.id !== itemId) })),

      updateCartQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) return { cart: state.cart.filter((ci) => ci.item.id !== itemId) };

          const found = state.cart.find((ci) => ci.item.id === itemId);
          if (!found) return state;

          const item = found.item;
          if (item.maxPerUser && quantity > item.maxPerUser) return state;
          if (item.stock !== null && quantity > item.stock) return state;

          return { cart: state.cart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci)) };
        });
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => get().cart.reduce((total, ci) => total + ci.item.price * ci.quantity, 0),

      getCartItemCount: () => get().cart.reduce((count, ci) => count + ci.quantity, 0),

      // Comprar todo el carrito - REAL con Supabase
      purchaseCart: async () => {
        const { cart, clearCart, currentUserId } = get();
        
        if (!currentUserId) {
          return { success: false, error: 'Debes iniciar sesión para comprar' };
        }

        if (cart.length === 0) {
          return { success: false, error: 'El carrito está vacío' };
        }

        set({ isLoading: true, error: null });

        try {
          let lastNewBalance = 0;
          const purchases: PurchaseHistory[] = [];

          // Procesar cada item del carrito
          for (const cartItem of cart) {
            const result = await shopService.purchaseItem(
              currentUserId,
              cartItem.item.id,
              cartItem.quantity
            );

            if (!result.success) {
              set({ isLoading: false, error: result.error });
              return { success: false, error: result.error };
            }

            lastNewBalance = result.newBalance || 0;

            // Registrar en historial local
            purchases.push({
              id: `${Date.now()}-${cartItem.item.id}`,
              itemId: cartItem.item.id,
              itemName: cartItem.item.name,
              price: cartItem.item.price,
              quantity: cartItem.quantity,
              purchasedAt: new Date().toISOString(),
            });

            // Crear notificación
            const totalPrice = cartItem.item.price * cartItem.quantity;
            const itemText = cartItem.quantity > 1 
              ? `${cartItem.quantity}x ${cartItem.item.name}` 
              : cartItem.item.name;
            
            await notificationsService.notifyPurchase(
              currentUserId,
              itemText,
              totalPrice
            );
          }

          set((state) => ({
            purchaseHistory: [...purchases, ...state.purchaseHistory],
            isLoading: false,
          }));

          clearCart();
          return { success: true, newBalance: lastNewBalance };
        } catch (error) {
          console.error('Error purchasing cart:', error);
          set({ error: 'Error al procesar la compra', isLoading: false });
          return { success: false, error: 'Error al procesar la compra' };
        }
      },

      // Comprar un item directamente - REAL con Supabase
      purchaseItem: async (item, quantity) => {
        const { currentUserId } = get();
        
        if (!currentUserId) {
          return { success: false, error: 'Debes iniciar sesión para comprar' };
        }

        set({ isLoading: true, error: null });

        try {
          const result = await shopService.purchaseItem(currentUserId, item.id, quantity);

          if (!result.success) {
            set({ isLoading: false, error: result.error });
            return { success: false, error: result.error };
          }

          const purchase: PurchaseHistory = {
            id: `${Date.now()}-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            price: item.price,
            quantity,
            purchasedAt: new Date().toISOString(),
          };

          set((state) => ({
            purchaseHistory: [purchase, ...state.purchaseHistory],
            isLoading: false,
            isPurchaseModalOpen: false,
          }));

          // Crear notificación
          const totalPrice = item.price * quantity;
          const itemText = quantity > 1 ? `${quantity}x ${item.name}` : item.name;
          
          await notificationsService.notifyPurchase(
            currentUserId,
            itemText,
            totalPrice
          );

          return { success: true, newBalance: result.newBalance };
        } catch (error) {
          console.error('Error purchasing item:', error);
          set({ error: 'Error al procesar la compra', isLoading: false });
          return { success: false, error: 'Error al procesar la compra' };
        }
      },

      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

      resetFilters: () =>
        set({
          filters: {
            search: '',
            category: 'all',
            rarity: 'all',
            sortBy: 'popular',
            showOnSale: false,
          },
        }),

      setCartOpen: (open) => set({ isCartOpen: open }),
      setPurchaseModalOpen: (open) => set({ isPurchaseModalOpen: open }),
      setSelectedItem: (item) => set({ selectedItem: item }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'apocaliptics-shop',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);