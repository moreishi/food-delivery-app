import { randomUUID } from 'crypto'
import db from './db'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  const salt = randomUUID().slice(0, 16)
  const hash = createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const computed = createHash('sha256').update(salt + password).digest('hex')
  return hash === computed
}

export interface LocalUser {
  id: string
  email: string
  name: string
  role: string
  tenant_id: string | null
}

export function createLocalUser(email: string, password: string, name: string, role: string = 'customer', tenantId: string | null = null): LocalUser {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO profiles (id, role, name, tenant_id)
    VALUES (?, ?, ?, ?)
  `).run(id, role, name, tenantId)

  db.prepare(`
    INSERT INTO auth_users (id, email, password_hash)
    VALUES (?, ?, ?)
  `).run(id, email, hashPassword(password))

  return { id, email, name, role, tenant_id: tenantId }
}

export function authenticateLocalUser(email: string, password: string): LocalUser | null {
  const row = db.prepare(`
    SELECT u.id, u.email, p.name, p.role, p.tenant_id, u.password_hash
    FROM auth_users u
    JOIN profiles p ON p.id = u.id
    WHERE u.email = ?
  `).get(email) as any

  if (!row) return null
  if (!verifyPassword(password, row.password_hash)) return null

  return { id: row.id, email: row.email, name: row.name, role: row.role, tenant_id: row.tenant_id }
}

export function getLocalUserById(id: string): LocalUser | null {
  const row = db.prepare(`
    SELECT u.id, u.email, p.name, p.role, p.tenant_id
    FROM auth_users u
    JOIN profiles p ON p.id = u.id
    WHERE u.id = ?
  `).get(id) as any

  if (!row) return null
  return { id: row.id, email: row.email, name: row.name, role: row.role, tenant_id: row.tenant_id }
}

export function updateLocalUser(userId: string, updates: { role?: string; tenant_id?: string | null }): LocalUser | null {
  if (updates.role !== undefined) {
    db.prepare('UPDATE profiles SET role = ? WHERE id = ?').run(updates.role, userId)
  }
  if (updates.tenant_id !== undefined) {
    db.prepare('UPDATE profiles SET tenant_id = ? WHERE id = ?').run(updates.tenant_id, userId)
  }
  return getLocalUserById(userId)
}
