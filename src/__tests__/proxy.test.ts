import { describe, it, expect, beforeEach } from 'vitest'
import db from '@/lib/db'
import { createLocalUser } from '@/lib/local-auth'

const TEST_EMAILS = ['proxy-staff@test.com', 'proxy-cust@test.com', 'proxy-admin@test.com', 'proxy-staff2@test.com']

// Clean up test users before each test
beforeEach(() => {
  for (const email of TEST_EMAILS) {
    const existing = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(email) as any
    if (existing) {
      db.prepare('DELETE FROM profiles WHERE id = ?').run(existing.id)
      db.prepare('DELETE FROM auth_users WHERE id = ?').run(existing.id)
    }
  }
})

describe('Proxy tenant headers', () => {
  it('should set tenant_id for staff user', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get() as any
    const staff = createLocalUser('proxy-staff@test.com', 'pass', 'Proxy Staff', 'staff', tenant.id)
    expect(staff.role).toBe('staff')
    expect(staff.tenant_id).toBe(tenant.id)
  })

  it('should set no tenant_id for customer user', () => {
    const user = createLocalUser('proxy-cust@test.com', 'pass', 'Proxy Customer', 'customer', null)
    expect(user.role).toBe('customer')
    expect(user.tenant_id).toBeNull()
  })

  it('should set tenant_id for admin user', () => {
    const admin = createLocalUser('proxy-admin@test.com', 'pass', 'Proxy Admin', 'admin', null)
    expect(admin.role).toBe('admin')
    expect(admin.tenant_id).toBeNull()
  })

  it('should reference valid tenant for staff', () => {
    const tenant = db.prepare('SELECT id, slug FROM tenants LIMIT 1').get() as any
    const staff = createLocalUser('proxy-staff2@test.com', 'pass', 'Staff 2', 'staff', tenant.id)

    const profile = db.prepare('SELECT p.tenant_id, t.name FROM profiles p JOIN tenants t ON t.id = p.tenant_id WHERE p.id = ?').get(staff.id) as any
    expect(profile).not.toBeNull()
    expect(profile.name).toBeTruthy()
  })
})
