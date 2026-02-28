import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// TYPES
// ============================================

export type CartAddon = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartItem = {
  id: string; // unique cart item id
  mealId: string;
  mealName: string;
  mealSlug: string;
  mealImageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  basePrice: number;
  variantPriceModifier: number;
  addons: CartAddon[];
  quantity: number;
  note: string;
  isAvailable: boolean;
};

export type CartRestaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type CartLocation = {
  id: string;
  name: string;
  city: string;
  address: string;
  deliveryFee: number;
  minOrderValue: number;
  deliveryRadius: number;
};

export type CartState = {
  items: CartItem[];
  restaurant: CartRestaurant | null;
  location: CartLocation | null;
  discountCode: string | null;
  discountPercent: number;
  isDrawerOpen: boolean;
  // Computed
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  meetsMinOrder: boolean;
};

export type CartActions = {
  addItem: (
    restaurant: CartRestaurant,
    location: CartLocation,
    item: Omit<CartItem, "id">,
  ) => "added" | "confirm-clear";
  confirmClearAndAdd: (
    restaurant: CartRestaurant,
    location: CartLocation,
    item: Omit<CartItem, "id">,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  setLocation: (location: CartLocation) => void;
  applyDiscountCode: (code: string, percent: number) => void;
  removeDiscountCode: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  _pendingItem: {
    restaurant: CartRestaurant;
    location: CartLocation;
    item: Omit<CartItem, "id">;
  } | null;
};

// ============================================
// HELPERS
// ============================================

function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function calculateItemPrice(item: CartItem): number {
  const addonTotal = item.addons.reduce(
    (sum, addon) => sum + addon.price * addon.quantity,
    0,
  );
  return (
    (item.basePrice + item.variantPriceModifier + addonTotal) * item.quantity
  );
}

function computeDerivedState(
  items: CartItem[],
  location: CartLocation | null,
  discountPercent: number,
) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemPrice(item),
    0,
  );
  const deliveryFee = location ? location.deliveryFee : 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const meetsMinOrder = location ? subtotal >= location.minOrderValue : true;

  return { itemCount, subtotal, deliveryFee, total, meetsMinOrder };
}

// ============================================
// STORE
// ============================================

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      restaurant: null,
      location: null,
      discountCode: null,
      discountPercent: 0,
      isDrawerOpen: false,
      _pendingItem: null,

      // Computed (initially empty)
      itemCount: 0,
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      meetsMinOrder: true,

      addItem: (restaurant, location, item) => {
        const state = get();

        // If cart has items from a different restaurant
        if (
          state.restaurant &&
          state.restaurant.id !== restaurant.id &&
          state.items.length > 0
        ) {
          set({ _pendingItem: { restaurant, location, item } });
          return "confirm-clear";
        }

        const newItem: CartItem = {
          ...item,
          id: generateCartItemId(),
        };

        const newItems = [...state.items, newItem];
        const derived = computeDerivedState(
          newItems,
          location,
          state.discountPercent,
        );

        set({
          items: newItems,
          restaurant,
          location,
          ...derived,
        });

        return "added";
      },

      confirmClearAndAdd: (restaurant, location, item) => {
        const state = get();
        const newItem: CartItem = {
          ...item,
          id: generateCartItemId(),
        };
        const newItems = [newItem];
        const derived = computeDerivedState(newItems, location, 0);

        set({
          items: newItems,
          restaurant,
          location,
          discountCode: null,
          discountPercent: 0,
          _pendingItem: null,
          ...derived,
        });
      },

      removeItem: (itemId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.id !== itemId);
        const derived = computeDerivedState(
          newItems,
          state.location,
          state.discountPercent,
        );

        set({
          items: newItems,
          ...(newItems.length === 0
            ? {
                restaurant: null,
                location: null,
                discountCode: null,
                discountPercent: 0,
              }
            : {}),
          ...derived,
        });
      },

      updateQuantity: (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const newItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        );
        const derived = computeDerivedState(
          newItems,
          state.location,
          state.discountPercent,
        );

        set({ items: newItems, ...derived });
      },

      updateNote: (itemId, note) => {
        const state = get();
        const newItems = state.items.map((item) =>
          item.id === itemId ? { ...item, note } : item,
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({
          items: [],
          restaurant: null,
          location: null,
          discountCode: null,
          discountPercent: 0,
          _pendingItem: null,
          itemCount: 0,
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
          meetsMinOrder: true,
        });
      },

      setLocation: (location) => {
        const state = get();
        const derived = computeDerivedState(
          state.items,
          location,
          state.discountPercent,
        );
        set({ location, ...derived });
      },

      applyDiscountCode: (code, percent) => {
        const state = get();
        const derived = computeDerivedState(
          state.items,
          state.location,
          percent,
        );
        set({ discountCode: code, discountPercent: percent, ...derived });
      },

      removeDiscountCode: () => {
        const state = get();
        const derived = computeDerivedState(state.items, state.location, 0);
        set({ discountCode: null, discountPercent: 0, ...derived });
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () =>
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
    }),
    {
      name: "dishly-cart",
      // Only persist relevant state, not computed values
      partialize: (state) => ({
        items: state.items,
        restaurant: state.restaurant,
        location: state.location,
        discountCode: state.discountCode,
        discountPercent: state.discountPercent,
      }),
      // Rehydrate computed values on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = computeDerivedState(
            state.items,
            state.location,
            state.discountPercent,
          );
          state.itemCount = derived.itemCount;
          state.subtotal = derived.subtotal;
          state.deliveryFee = derived.deliveryFee;
          state.total = derived.total;
          state.meetsMinOrder = derived.meetsMinOrder;
        }
      },
    },
  ),
);
