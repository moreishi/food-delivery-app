import { describe, it, expect } from 'vitest'
import { getTenantBySlug, getTenantById, getTenants, getTenantCount } from '@/lib/local-data'

describe('Tenant queries', () => {
  it('should find tenant by slug', () => {
    const tenant = getTenantBySlug('pizzahub')
    expect(tenant).not.toBeNull()
    expect(tenant!.name).toBe('Pizza Hub')
  })

  it('should return null for unknown slug', () => {
    const tenant = getTenantBySlug('nonexistent')
    expect(tenant).toBeNull()
  })

  it('should find tenant by id', () => {
    const bySlug = getTenantBySlug('pizzahub')
    const byId = getTenantById(bySlug!.id)
    expect(byId).not.toBeNull()
    expect((byId as any).name).toBe('Pizza Hub')
  })

  it('should return all tenants', () => {
    const tenants = getTenants()
    expect(tenants.length).toBeGreaterThanOrEqual(2)
  })

  it('should count tenants', () => {
    const count = getTenantCount()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
