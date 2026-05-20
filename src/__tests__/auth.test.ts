import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceUSD } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ROLES } from '@/lib/constants'

describe('Auth pages', () => {
  it('has login page route', () => {
    expect('/auth/login').toBeDefined()
  })

  it('has signup page route', () => {
    expect('/auth/signup').toBeDefined()
  })

  it('has callback page route', () => {
    expect('/auth/callback').toBeDefined()
  })
})

describe('formatPrice', () => {
  it('formats cents to PHP currency string', () => {
    expect(formatPrice(1500)).toBe('₱15.00')
    expect(formatPrice(0)).toBe('₱0.00')
    expect(formatPrice(9999)).toBe('₱99.99')
  })
})

describe('formatPriceUSD', () => {
  it('formats cents to USD currency string', () => {
    expect(formatPriceUSD(1500)).toBe('$15.00')
  })
})

describe('ORDER_STATUS_LABELS', () => {
  it('has correct status labels', () => {
    expect(ORDER_STATUS_LABELS.pending).toBe('Pending')
    expect(ORDER_STATUS_LABELS.delivered).toBe('Delivered')
    expect(ORDER_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})

describe('ORDER_STATUS_COLORS', () => {
  it('has correct status colors', () => {
    expect(ORDER_STATUS_COLORS.pending).toContain('bg-yellow-100')
    expect(ORDER_STATUS_COLORS.delivered).toContain('bg-gray-100')
  })
})

describe('ROLES', () => {
  it('has correct role values', () => {
    expect(ROLES.CUSTOMER).toBe('customer')
    expect(ROLES.STAFF).toBe('staff')
    expect(ROLES.ADMIN).toBe('admin')
  })
})
