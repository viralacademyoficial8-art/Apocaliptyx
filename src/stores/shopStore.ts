// src/stores/shopStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  stock: number | null; // null = ilimitado
  maxPerUser: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  saleEndsAt?: string;
  effects?: ItemEffect[];
  tags: string[];
  purchaseCount: number;
  rating: number;
  reviews: number;
}

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number; // en horas
  description: string;
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
// MOCK DATA
// ============================================

const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Escudo de Protección',
    description: 'Protege tu escenario contra robos durante 24 horas.',
    longDescription:
      'El Escudo de Protección crea una barrera impenetrable alrededor de tu escenario más valioso. Durante 24 horas, ningún otro profeta podrá robarte ese escenario, dándote tiempo para asegurar tu inversión.',
    imageUrl: null,
    type: 'PROTECTION',
    rarity: 'COMMON',
    price: 500,
    stock: null,
    maxPerUser: 10,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'protection', value: 1, duration: 24, description: 'Protege 1 escenario por 24h' }],
    tags: ['defensa', 'seguridad', 'escudo'],
    purchaseCount: 15420,
    rating: 4.5,
    reviews: 342,
  },
  {
    id: '2',
    name: 'Escudo Legendario',
    description: 'Protección total durante 72 horas para todos tus escenarios.',
    longDescription:
      'El Escudo Legendario es la defensa definitiva. Protege TODOS tus escenarios activos durante 72 horas completas. Ideal para cuando tienes múltiples inversiones importantes.',
    imageUrl: null,
    type: 'PROTECTION',
    rarity: 'LEGENDARY',
    price: 5000,
    originalPrice: 7500,
    stock: 50,
    maxPerUser: 2,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    saleEndsAt: '2025-01-15T00:00:00Z',
    effects: [{ type: 'protection_all', value: 100, duration: 72, description: 'Protege TODOS tus escenarios por 72h' }],
    tags: ['defensa', 'premium', 'legendario'],
    purchaseCount: 234,
    rating: 4.9,
    reviews: 89,
  },

  {
    id: '3',
    name: 'Multiplicador x2',
    description: 'Duplica las ganancias de tu próxima predicción correcta.',
    longDescription:
      'Activa este multiplicador antes de que se resuelva un escenario. Si aciertas, tus ganancias se duplicarán automáticamente. ¡El riesgo vale la pena!',
    imageUrl: null,
    type: 'BOOST',
    rarity: 'RARE',
    price: 1000,
    stock: null,
    maxPerUser: 5,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'multiplier', value: 2, description: 'x2 ganancias en próxima predicción correcta' }],
    tags: ['boost', 'ganancias', 'multiplicador'],
    purchaseCount: 8932,
    rating: 4.7,
    reviews: 567,
  },
  {
    id: '4',
    name: 'Multiplicador x5',
    description: '¡Quintuplica tus ganancias! Solo para los más arriesgados.',
    longDescription:
      'El multiplicador más potente disponible. Quintuplica las ganancias de tu próxima predicción correcta. Úsalo sabiamente en escenarios donde tengas alta confianza.',
    imageUrl: null,
    type: 'BOOST',
    rarity: 'EPIC',
    price: 3500,
    stock: 100,
    maxPerUser: 2,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false,
    effects: [{ type: 'multiplier', value: 5, description: 'x5 ganancias en próxima predicción correcta' }],
    tags: ['boost', 'premium', 'épico'],
    purchaseCount: 1205,
    rating: 4.8,
    reviews: 156,
  },

  {
    id: '5',
    name: 'Visión del Oráculo',
    description: 'Revela las estadísticas ocultas de cualquier escenario.',
    longDescription:
      'Usa la Visión del Oráculo para ver información privilegiada: quién más está invirtiendo, tendencias de votos en tiempo real, y probabilidades calculadas por nuestro algoritmo.',
    imageUrl: null,
    type: 'POWER',
    rarity: 'RARE',
    price: 750,
    stock: null,
    maxPerUser: 20,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'reveal_stats', value: 1, description: 'Revela estadísticas de 1 escenario' }],
    tags: ['poder', 'información', 'estrategia'],
    purchaseCount: 6543,
    rating: 4.3,
    reviews: 234,
  },
  {
    id: '6',
    name: 'Robo Silencioso',
    description: 'Roba un escenario sin que el dueño reciba notificación.',
    longDescription:
      'El Robo Silencioso te permite tomar un escenario de otro usuario sin que este reciba la notificación habitual. Perfecto para movimientos estratégicos sorpresa.',
    imageUrl: null,
    type: 'POWER',
    rarity: 'EPIC',
    price: 2000,
    stock: 200,
    maxPerUser: 3,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'silent_steal', value: 1, description: 'Robo sin notificación' }],
    tags: ['poder', 'robo', 'sigilo'],
    purchaseCount: 2341,
    rating: 4.6,
    reviews: 178,
  },

  {
    id: '7',
    name: 'Marco Dorado',
    description: 'Un elegante marco dorado para tu avatar de perfil.',
    longDescription:
      'Destaca entre la multitud con este exclusivo marco dorado. Se mostrará alrededor de tu avatar en tu perfil, comentarios, y en el leaderboard.',
    imageUrl: null,
    type: 'COSMETIC',
    rarity: 'RARE',
    price: 2500,
    stock: null,
    maxPerUser: 1,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'avatar_frame', value: 1, description: 'Marco dorado permanente' }],
    tags: ['cosmético', 'avatar', 'prestigio'],
    purchaseCount: 4521,
    rating: 4.4,
    reviews: 289,
  },
  {
    id: '8',
    name: 'Título: Profeta Supremo',
    description: 'Muestra el título exclusivo Profeta Supremo en tu perfil.',
    longDescription:
      'Solo los verdaderos visionarios merecen este título. Aparecerá debajo de tu nombre en todo el sitio, mostrando tu estatus de élite.',
    imageUrl: null,
    type: 'COSMETIC',
    rarity: 'LEGENDARY',
    price: 10000,
    stock: 100,
    maxPerUser: 1,
    isActive: true,
    isFeatured: true,
    isNew: true,
    isOnSale: false,
    effects: [{ type: 'title', value: 1, description: 'Título exclusivo permanente' }],
    tags: ['cosmético', 'título', 'legendario', 'exclusivo'],
    purchaseCount: 47,
    rating: 5.0,
    reviews: 23,
  },
  {
    id: '9',
    name: 'Efecto de Entrada: Llamas',
    description: 'Efecto de llamas cuando entras al chat o foro.',
    longDescription:
      'Haz una entrada dramática. Cada vez que publiques en el foro o entres al chat, tu mensaje aparecerá con un espectacular efecto de llamas.',
    imageUrl: null,
    type: 'COSMETIC',
    rarity: 'EPIC',
    price: 3000,
    stock: null,
    maxPerUser: 1,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'entry_effect', value: 1, description: 'Efecto de llamas en mensajes' }],
    tags: ['cosmético', 'efecto', 'animación'],
    purchaseCount: 1876,
    rating: 4.2,
    reviews: 145,
  },

  {
    id: '10',
    name: 'Cofre Misterioso',
    description: '¿Qué habrá dentro? Puede contener items raros o legendarios.',
    longDescription:
      'Abre el Cofre Misterioso y descubre su contenido. Puede contener desde items comunes hasta legendarios. ¡La suerte está de tu lado!',
    imageUrl: null,
    type: 'SPECIAL',
    rarity: 'RARE',
    price: 1500,
    stock: null,
    maxPerUser: null,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: false,
    effects: [{ type: 'random_item', value: 1, description: 'Item aleatorio (común a legendario)' }],
    tags: ['especial', 'aleatorio', 'sorpresa'],
    purchaseCount: 12453,
    rating: 4.1,
    reviews: 892,
  },

  {
    id: '11',
    name: 'Pack Iniciado',
    description: 'Todo lo que necesitas para empezar: 2 escudos + 2 multiplicadores.',
    longDescription:
      'El pack perfecto para nuevos profetas. Incluye 2 Escudos de Protección y 2 Multiplicadores x2. Ahorra un 20% comprando el pack.',
    imageUrl: null,
    type: 'BUNDLE',
    rarity: 'COMMON',
    price: 2400,
    originalPrice: 3000,
    stock: null,
    maxPerUser: 1,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: true,
    effects: [{ type: 'bundle', value: 4, description: '2x Escudo + 2x Multiplicador x2' }],
    tags: ['bundle', 'pack', 'ahorro', 'principiante'],
    purchaseCount: 3421,
    rating: 4.6,
    reviews: 234,
  },
  {
    id: '12',
    name: 'Pack Apocalipsis',
    description: 'El pack definitivo: Escudo Legendario + x5 Mult + Marco Dorado + más.',
    longDescription:
      'Para los verdaderos coleccionistas. Incluye: 1 Escudo Legendario, 1 Multiplicador x5, 1 Marco Dorado, 3 Visiones del Oráculo, y 5000 AP Coins de bonus.',
    imageUrl: null,
    type: 'BUNDLE',
    rarity: 'LEGENDARY',
    price: 15000,
    originalPrice: 25000,
    stock: 25,
    maxPerUser: 1,
    isActive: true,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    saleEndsAt: '2025-01-01T00:00:00Z',
    effects: [{ type: 'bundle_premium', value: 1, description: 'Pack completo + 5000 AP bonus' }],
    tags: ['bundle', 'premium', 'legendario', 'limitado'],
    purchaseCount: 12,
    rating: 5.0,
    reviews: 8,
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface ShopStore {
  items: ShopItem[];
  cart: CartItem[];
  purchaseHistory: PurchaseHistory[];
  isLoading: boolean;
  error: string | null;

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

  purchaseCart: () => Promise<boolean>;
  purchaseItem: (item: ShopItem, quantity: number) => Promise<boolean>;

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
      items: mockShopItems,
      cart: [],
      purchaseHistory: [],
      isLoading: false,
      error: null,

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

      purchaseCart: async () => {
        const { cart, clearCart } = get();
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 900));

          const purchases: PurchaseHistory[] = cart.map((ci) => ({
            id: `${Date.now()}-${ci.item.id}`,
            itemId: ci.item.id,
            itemName: ci.item.name,
            price: ci.item.price,
            quantity: ci.quantity,
            purchasedAt: new Date().toISOString(),
          }));

          set((state) => ({
            purchaseHistory: [...purchases, ...state.purchaseHistory],
            isLoading: false,
          }));

          clearCart();
          return true;
        } catch {
          set({ error: 'Error al procesar la compra', isLoading: false });
          return false;
        }
      },

      purchaseItem: async (item, quantity) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 700));

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

          return true;
        } catch {
          set({ error: 'Error al procesar la compra', isLoading: false });
          return false;
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
