import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  menuItemId: string
  tenantId: string
  tenantSlug: string
  name: string
  price: number
  quantity: number
  modifiers: { name: string; choice: string; priceModifier: number }[]
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'subtotal'>) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
}

function getItemKey(item: { menuItemId: string; modifiers: { name: string; choice: string; priceModifier: number }[] }): string {
  return `${item.menuItemId}-${JSON.stringify(item.modifiers)}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = [...get().items]
        const key = getItemKey(item)
        const existingIndex = items.findIndex(
          (i) => getItemKey(i) === key
        )

        if (existingIndex >= 0) {
          items[existingIndex].quantity += item.quantity
        } else {
          items.push({ ...item })
        }

        set({ items })
      },

      removeItem: (menuItemId) => {
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) })
      },

      updateQuantity: (menuItemId, quantity) => {
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'food-delivery-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Helper functions that read from store
export function getCartTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => {
    const modifiersTotal = i.modifiers.reduce((m, mod) => m + mod.priceModifier, 0)
    return sum + (i.price + modifiersTotal) * i.quantity
  }, 0)
  return { totalItems, totalPrice }
}
