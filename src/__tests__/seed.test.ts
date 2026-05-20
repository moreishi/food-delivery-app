import { describe, it, expect } from 'vitest'
import { SAMPLE_TENANTS } from '@/scripts/seed'

describe('Seed script with SQLite', () => {
  it('should export SAMPLE_TENANTS with data', () => {
    expect(Array.isArray(SAMPLE_TENANTS)).toBe(true)
    expect(SAMPLE_TENANTS.length).toBeGreaterThanOrEqual(2)
    expect(SAMPLE_TENANTS[0].slug).toBe('pizzahub')
    expect(SAMPLE_TENANTS[1].slug).toBe('burger-bros')
  })

  it('sample tenants should have required fields', () => {
    for (const tenant of SAMPLE_TENANTS) {
      expect(tenant.slug).toBeTruthy()
      expect(tenant.name).toBeTruthy()
      expect(tenant.categories).toBeInstanceOf(Array)
      expect(tenant.menuItems).toBeInstanceOf(Array)
    }
  })

  it('should have menu items with prices in cents', () => {
    for (const tenant of SAMPLE_TENANTS) {
      for (const item of tenant.menuItems) {
        expect(Number.isInteger(item.price)).toBe(true)
        expect(item.price).toBeGreaterThan(0)
      }
    }
  })
})
