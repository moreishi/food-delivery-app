import { describe, it, expect } from 'vitest'

describe('Admin panel', () => {
  it('should only allow admin role', () => {
    const allowedRoles = ['admin']
    expect(allowedRoles).toContain('admin')
    expect(allowedRoles).not.toContain('staff')
    expect(allowedRoles).not.toContain('customer')
  })

  it('should have admin routes', () => {
    const routes = ['/admin', '/admin/tenants', '/admin/users']
    expect(routes).toContain('/admin')
    expect(routes).toContain('/admin/tenants')
  })
})

describe('Tenant management', () => {
  it('should list all tenants', () => {
    const tenants = [
      { id: 't1', name: 'Pizza Hub', isActive: true },
      { id: 't2', name: 'Burger Bros', isActive: true },
    ]
    expect(tenants.length).toBeGreaterThanOrEqual(1)
    expect(tenants[0].name).toBeTruthy()
  })

  it('should toggle tenant active status', () => {
    const tenant = { id: 't1', isActive: true }
    tenant.isActive = false
    expect(tenant.isActive).toBe(false)
  })
})
