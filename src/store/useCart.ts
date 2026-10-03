import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isBugActive } from '@/utils/bugHunt';

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({ items: [...state.items, { ...item, id }] }));
      },
      removeItem: (id) => {
        set((state) => {
          // Bug Hunt `cart-remove-wrong`: removes the first line instead of the clicked one.
          const target = isBugActive('cart-remove-wrong') ? state.items[0]?.id : id;
          return { items: state.items.filter((i) => i.id !== target) };
        });
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        // Bug Hunt `cart-subtotal-qty`: the last line counts its price once, ignoring quantity.
        const buggy = isBugActive('cart-subtotal-qty');
        return items.reduce(
          (acc, item, i) => acc + item.price * (buggy && i === items.length - 1 ? 1 : item.quantity),
          0
        );
      }
    }),
    { name: 'qa-cart' }
  )
);
