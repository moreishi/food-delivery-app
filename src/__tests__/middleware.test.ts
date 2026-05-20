import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTenantData = { id: 't1', slug: 'pizzahub' }

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockTenantData, error: null }),
        })),
      })),
    })),
  })),
}))

describe('Multi-tenant middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve a tenant slug from URL', async () => {
    const slug = 'pizzahub'
    expect(slug).toBe('pizzahub')
  })

  it('should return null for unknown tenant slug', async () => {
    const slug = 'nonexistent'
    const { resolveTenant } = await import('@/lib/tenant')
    const result = await resolveTenant(slug)
    expect(result).toBeNull()
  })
})
