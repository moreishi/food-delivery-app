import { describe, it, expect } from 'vitest'

describe('Seed script', () => {
  it('should export seed function', async () => {
    const { seed } = await import('@/scripts/seed')
    expect(typeof seed).toBe('function')
  })

  it('should have sample tenant data', async () => {
    const { SAMPLE_TENANTS } = await import('@/scripts/seed')
    expect(Array.isArray(SAMPLE_TENANTS)).toBe(true)
    expect(SAMPLE_TENANTS.length).toBeGreaterThanOrEqual(2)
  })

  it('sample tenants should have required fields', async () => {
    const { SAMPLE_TENANTS } = await import('@/scripts/seed')
    for (const tenant of SAMPLE_TENANTS) {
      expect(tenant.slug).toBeTruthy()
      expect(tenant.name).toBeTruthy()
      expect(tenant.categories).toBeInstanceOf(Array)
      expect(tenant.menuItems).toBeInstanceOf(Array)
    }
  })
})
