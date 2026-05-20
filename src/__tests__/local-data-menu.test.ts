import { describe, it, expect } from 'vitest'
import { getTenantBySlug, getCategoriesByTenantId, getMenuItemsByTenantId, getMenuItemById } from '@/lib/local-data'

describe('Menu queries (tenant scoped)', () => {
  it('should return categories for pizzahub', () => {
    const tenant = getTenantBySlug('pizzahub')
    const categories = getCategoriesByTenantId(tenant!.id)
    expect(categories.length).toBeGreaterThanOrEqual(3)
  })

  it('should return 8 menu items for pizzahub', () => {
    const tenant = getTenantBySlug('pizzahub')
    const items = getMenuItemsByTenantId(tenant!.id)
    expect(items.length).toBe(8)
  })

  it('should return 7 menu items for burger-bros', () => {
    const tenant = getTenantBySlug('burger-bros')
    const items = getMenuItemsByTenantId(tenant!.id)
    expect(items.length).toBe(7)
  })

  it('should not include items from other tenants', () => {
    const pizzaHub = getTenantBySlug('pizzahub')!
    const burgerBros = getTenantBySlug('burger-bros')!

    const pizzaItems = getMenuItemsByTenantId(pizzaHub.id) as any[]
    const burgerItems = getMenuItemsByTenantId(burgerBros.id) as any[]

    const pizzaNames = pizzaItems.map(i => i.name)
    const burgerNames = burgerItems.map(i => i.name)
    for (const name of pizzaNames) {
      expect(burgerNames).not.toContain(name)
    }
  })

  it('should return item by id', () => {
    const tenant = getTenantBySlug('pizzahub')!
    const items = getMenuItemsByTenantId(tenant.id) as any[]
    const found = getMenuItemById(items[0].id) as any
    expect(found.name).toBe(items[0].name)
  })

  it('should parse options JSON field as array', () => {
    const tenant = getTenantBySlug('pizzahub')!
    const items = getMenuItemsByTenantId(tenant.id) as any[]
    for (const item of items) {
      expect(Array.isArray(item.options)).toBe(true)
    }
  })
})
