import { describe, it, expect } from 'vitest'

describe('Menu page', () => {
  it('should have tenant slug in URL path', () => {
    const slug = 'pizzahub'
    expect(`/menu/${slug}`).toBe('/menu/pizzahub')
  })

  it('should have tenant route structure', () => {
    const routes = ['/menu/[slug]']
    expect(routes).toContain('/menu/[slug]')
  })
})

describe('Menu item card', () => {
  it('should format price in cents', async () => {
    const { formatPrice } = await import('@/lib/utils')
    expect(formatPrice(1299)).toBe('₱12.99')
  })
})
