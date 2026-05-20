import { describe, it, expect } from 'vitest'
import db from '@/lib/db'
import { getProfiles, getProfileById, getProfileCount } from '@/lib/local-data'
import { createLocalUser } from '@/lib/local-auth'

describe('Profile queries', () => {
  it('should return profiles', () => {
    const profiles = getProfiles()
    expect(Array.isArray(profiles)).toBe(true)
    // Should have at least the ones from previous test creations
    expect(profiles.length).toBeGreaterThanOrEqual(1)
  })

  it('should find profile by id', () => {
    const profiles = getProfiles() as any[]
    if (profiles.length === 0) {
      const user = createLocalUser('profile-test@test.com', 'pass', 'Profile Test')
      const found = getProfileById(user.id)
      expect(found).not.toBeNull()
    } else {
      const found = getProfileById(profiles[0].id)
      expect(found).not.toBeNull()
      expect((found as any).name).toBeTruthy()
    }
  })

  it('should return null for non-existent profile', () => {
    const found = getProfileById('non-existent')
    expect(found).toBeNull()
  })

  it('should count profiles', () => {
    const count = getProfileCount()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
