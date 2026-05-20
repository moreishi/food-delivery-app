import { describe, it, expect, beforeEach } from 'vitest'
import db from '@/lib/db'
import { migrate } from '@/lib/migrate'
import { createLocalUser, authenticateLocalUser, getLocalUserById } from '@/lib/local-auth'

describe('Local auth', () => {
  beforeEach(() => {
    db.exec('PRAGMA foreign_keys = OFF')
    db.exec('DELETE FROM auth_users')
    db.exec('DELETE FROM profiles')
    db.exec('PRAGMA foreign_keys = ON')
  })

  it('should create a new user', () => {
    const user = createLocalUser('test@test.com', 'password123', 'Test User')
    expect(user.email).toBe('test@test.com')
    expect(user.role).toBe('customer')
    expect(user.id).toBeTruthy()
  })

  it('should authenticate with correct password', () => {
    createLocalUser('test@test.com', 'password123', 'Test User')
    const user = authenticateLocalUser('test@test.com', 'password123')
    expect(user).not.toBeNull()
    expect(user!.email).toBe('test@test.com')
  })

  it('should reject wrong password', () => {
    createLocalUser('test@test.com', 'password123', 'Test User')
    const user = authenticateLocalUser('test@test.com', 'wrongpassword')
    expect(user).toBeNull()
  })

  it('should reject non-existent user', () => {
    const user = authenticateLocalUser('nobody@test.com', 'password')
    expect(user).toBeNull()
  })

  it('should get user by ID', () => {
    const created = createLocalUser('test@test.com', 'password123', 'Test User')
    const fetched = getLocalUserById(created.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.email).toBe('test@test.com')
  })

  it('should return null for non-existent ID', () => {
    const user = getLocalUserById('non-existent-id')
    expect(user).toBeNull()
  })

  it('should create user with staff role and tenant', () => {
    // First get a real tenant ID from the seeded data
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get() as any
    if (!tenant) return // skip if no tenants seeded

    const user = createLocalUser('staff@test.com', 'password', 'Staff', 'staff', tenant.id)
    expect(user.role).toBe('staff')
    expect(user.tenant_id).toBe(tenant.id)
  })
})
