import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, getCartTotals } from '@/lib/cart-store'

describe('Cart store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('should add item to cart', () => {
    useCartStore.getState().addItem({
      menuItemId: 'item-1',
      tenantId: 't1',
      tenantSlug: 'pizzahub',
      name: 'Margherita',
      price: 1299,
      quantity: 1,
      modifiers: [],
    })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].name).toBe('Margherita')
  })

  it('should increase quantity when adding same item without modifiers', () => {
    const { addItem } = useCartStore.getState()

    addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Margherita', price: 1299, quantity: 1, modifiers: [] })
    addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Margherita', price: 1299, quantity: 1, modifiers: [] })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('should remove item from cart', () => {
    useCartStore.getState().addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Margherita', price: 1299, quantity: 1, modifiers: [] })
    useCartStore.getState().addItem({ menuItemId: 'item-2', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Pepperoni', price: 1499, quantity: 1, modifiers: [] })

    useCartStore.getState().removeItem('item-1')
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].name).toBe('Pepperoni')
  })

  it('should update item quantity', () => {
    useCartStore.getState().addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Margherita', price: 1299, quantity: 1, modifiers: [] })
    useCartStore.getState().updateQuantity('item-1', 3)

    const state = useCartStore.getState()
    expect(state.items[0].quantity).toBe(3)
  })

  it('should calculate cart totals', () => {
    useCartStore.getState().addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Item 1', price: 1000, quantity: 2, modifiers: [] })
    useCartStore.getState().addItem({ menuItemId: 'item-2', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Item 2', price: 500, quantity: 1, modifiers: [] })

    const state = useCartStore.getState()
    const { totalItems, totalPrice } = getCartTotals(state.items)
    expect(totalItems).toBe(3)
    expect(totalPrice).toBe(2500)
  })

  it('should clear cart', () => {
    useCartStore.getState().addItem({ menuItemId: 'item-1', tenantId: 't1', tenantSlug: 'pizzahub', name: 'Test', price: 1000, quantity: 1, modifiers: [] })
    useCartStore.getState().clearCart()

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
  })
})
