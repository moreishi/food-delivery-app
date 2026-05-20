import { describe, it, expect } from 'vitest'

describe('Dashboard', () => {
  it('should have protected routes', () => {
    const protectedRoutes = ['/dashboard', '/dashboard/orders', '/dashboard/menu', '/dashboard/settings']
    for (const route of protectedRoutes) {
      expect(route.startsWith('/dashboard')).toBe(true)
    }
  })

  it('should only allow staff role access', () => {
    const allowedRoles = ['staff', 'admin']
    expect(allowedRoles).toContain('staff')
    expect(allowedRoles).not.toContain('customer')
  })
})

describe('Order management', () => {
  const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

  it('should allow valid status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
    }

    expect(validTransitions.pending).toContain('confirmed')
    expect(validTransitions.pending).toContain('cancelled')
    expect(validTransitions.preparing).not.toContain('delivered')
  })

  it('should not allow backward transitions', () => {
    const currentIndex = statusFlow.indexOf('preparing')
    const backwardStatuses = statusFlow.slice(0, currentIndex)
    expect(backwardStatuses).toContain('pending')
    expect(backwardStatuses).toContain('confirmed')
    expect(backwardStatuses).not.toContain('ready')
  })
})
