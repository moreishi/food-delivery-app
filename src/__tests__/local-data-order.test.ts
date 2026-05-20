import { describe, it, expect, beforeEach } from 'vitest'
import db from '@/lib/db'
import { getOrders, getOrderById, getOrderByIdWithItems, getActiveOrders, createOrder, updateOrderStatus, getOrderCount } from '@/lib/local-data'
import { createLocalUser } from '@/lib/local-auth'

describe('Order queries (tenant scoped)', () => {
  let pizzaHubTenantId: string
  let burgerBrosTenantId: string
  let customerId: string
  let testMenuItemId: string

  beforeEach(() => {
    db.exec('PRAGMA foreign_keys = OFF')
    db.exec("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE notes = 'test-order')")
    db.exec("DELETE FROM orders WHERE notes = 'test-order'")
    db.exec("DELETE FROM deliveries WHERE notes = 'test-order'")
    db.exec('PRAGMA foreign_keys = ON')

    const tenants = db.prepare('SELECT id, slug FROM tenants').all() as any[]
    pizzaHubTenantId = tenants.find((t: any) => t.slug === 'pizzahub')!.id
    burgerBrosTenantId = tenants.find((t: any) => t.slug === 'burger-bros')!.id

    // Use an actual menu item so FK constraint passes
    const menuItem = db.prepare('SELECT id, name FROM menu_items WHERE tenant_id = ? LIMIT 1').get(pizzaHubTenantId) as any
    testMenuItemId = menuItem.id

    // Create a test customer
    const user = createLocalUser(`order-test-${Date.now()}@test.com`, 'password', 'Order Test Customer', 'customer', null)
    customerId = user.id
  })

  it('should create an order for a specific tenant', () => {
    const order = createOrder({
      tenant_id: pizzaHubTenantId,
      customer_id: customerId,
      delivery_address: '{"street":"123 Test","city":"Test City"}',
      subtotal: 1000, delivery_fee: 500, tax: 120, total: 1620,
      items: [{ menu_item_id: testMenuItemId, name: 'Test Item', quantity: 1, unit_price: 1000, modifiers: [], subtotal: 1000 }],
    })
    expect(order).not.toBeNull()
    expect((order as any).tenant_id).toBe(pizzaHubTenantId)
    expect((order as any).status).toBe('pending')
  })

  it('should return orders filtered by tenant', () => {
    createOrder({
      tenant_id: pizzaHubTenantId, customer_id: customerId,
      delivery_address: '{}', subtotal: 500, delivery_fee: 300, tax: 60, total: 860,
      items: [{ menu_item_id: testMenuItemId, name: 'A', quantity: 1, unit_price: 500, modifiers: [], subtotal: 500 }],
    })
    createOrder({
      tenant_id: burgerBrosTenantId, customer_id: customerId,
      delivery_address: '{}', subtotal: 700, delivery_fee: 300, tax: 84, total: 1084,
      items: [{ menu_item_id: testMenuItemId, name: 'B', quantity: 1, unit_price: 700, modifiers: [], subtotal: 700 }],
    })

    const pizzaOrders = getOrders({ tenantId: pizzaHubTenantId })
    const burgerOrders = getOrders({ tenantId: burgerBrosTenantId })

    for (const o of pizzaOrders) expect((o as any).tenant_id).toBe(pizzaHubTenantId)
    for (const o of burgerOrders) expect((o as any).tenant_id).toBe(burgerBrosTenantId)
  })

  it('should get active orders excluding delivered/cancelled', () => {
    createOrder({
      tenant_id: pizzaHubTenantId, customer_id: customerId,
      delivery_address: '{}', subtotal: 500, delivery_fee: 300, tax: 60, total: 860,
      items: [{ menu_item_id: testMenuItemId, name: 'C', quantity: 1, unit_price: 500, modifiers: [], subtotal: 500 }],
    })

    const active = getActiveOrders(pizzaHubTenantId)
    expect(active.length).toBeGreaterThan(0)
    for (const o of active) {
      expect(['delivered', 'cancelled', 'refunded']).not.toContain((o as any).status)
    }
  })

  it('should update order status and set timestamps', () => {
    const order = createOrder({
      tenant_id: pizzaHubTenantId, customer_id: customerId,
      delivery_address: '{}', subtotal: 500, delivery_fee: 300, tax: 60, total: 860,
      items: [{ menu_item_id: testMenuItemId, name: 'D', quantity: 1, unit_price: 500, modifiers: [], subtotal: 500 }],
    })

    updateOrderStatus((order as any).id, 'confirmed')
    const updated = getOrderById((order as any).id) as any
    expect(updated.status).toBe('confirmed')
    expect(updated.confirmed_at).toBeTruthy()
  })

  it('should get order with items', () => {
    const order = createOrder({
      tenant_id: pizzaHubTenantId, customer_id: customerId,
      delivery_address: '{}', subtotal: 1500, delivery_fee: 500, tax: 180, total: 2180,
      items: [
        { menu_item_id: testMenuItemId, name: 'Item 1', quantity: 2, unit_price: 500, modifiers: [], subtotal: 1000 },
        { menu_item_id: testMenuItemId, name: 'Item 2', quantity: 1, unit_price: 500, modifiers: [], subtotal: 500 },
      ],
    })

    const withItems = getOrderByIdWithItems((order as any).id) as any
    expect(withItems.order_items).toHaveLength(2)
    expect(withItems.order_items[0].name).toBe('Item 1')
  })

  it('should parse delivery_address JSON on read', () => {
    const order = createOrder({
      tenant_id: pizzaHubTenantId, customer_id: customerId,
      delivery_address: { street: '456 Oak', city: 'Cebu City', notes: 'Ring bell' },
      subtotal: 500, delivery_fee: 300, tax: 60, total: 860,
      items: [{ menu_item_id: testMenuItemId, name: 'F', quantity: 1, unit_price: 500, modifiers: [], subtotal: 500 }],
    })

    const fetched = getOrderById((order as any).id) as any
    expect(typeof fetched.delivery_address).toBe('object')
    expect(fetched.delivery_address.street).toBe('456 Oak')
    expect(fetched.delivery_address.notes).toBe('Ring bell')
  })
})
