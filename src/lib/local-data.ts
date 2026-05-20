import db from './db'
import { cookies } from 'next/headers'

// ─── Helpers ───────────────────────────────────────────────

type Row = Record<string, unknown>

const JSON_FIELDS: Record<string, string[]> = {
  menu_items: ['options'],
  tenants: ['address', 'settings'],
  orders: ['delivery_address', 'order_items'],
  order_items: ['modifiers'],
  deliveries: ['location'],
}

function parseRow(row: Row, table?: string): Row {
  if (!table) return row
  const fields = JSON_FIELDS[table]
  if (!fields) return row
  const parsed = { ...row }
  for (const field of fields) {
    const val = parsed[field]
    if (typeof val === 'string') {
      try { parsed[field] = JSON.parse(val) } catch { /* keep as string */ }
    }
  }
  return parsed
}

function parseRows(rows: Row[], table?: string): Row[] {
  return rows.map(r => parseRow(r, table))
}

function queryAll<T = Row>(sql: string, ...params: unknown[]): T[] {
  const table = extractTable(sql)
  return parseRows(db.prepare(sql).all(...params) as Row[], table) as T[]
}

function queryOne<T = Row>(sql: string, ...params: unknown[]): T | null {
  const table = extractTable(sql)
  const row = db.prepare(sql).get(...params) as Row | undefined
  return row ? (parseRow(row, table) as T) : null
}

function execute(sql: string, ...params: unknown[]) {
  return db.prepare(sql).run(...params)
}

// Extract table name from SQL — handles SELECT ... FROM table, INSERT INTO table
function extractTable(sql: string): string | undefined {
  const fromMatch = sql.match(/FROM\s+(\w+)/i)
  if (fromMatch) return fromMatch[1].toLowerCase()
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i)
  return insertMatch?.[1]?.toLowerCase()
}

// ─── Auth ───────────────────────────────────────────────────

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('local-session')
  if (!sessionCookie?.value) return null

  try {
    const parsed = JSON.parse(sessionCookie.value)
    if (!parsed.id) return null

    const profile = queryOne<{
      id: string; email: string; name: string; role: string; tenant_id: string | null
    }>(
      'SELECT u.id, u.email, p.name, p.role, p.tenant_id FROM auth_users u JOIN profiles p ON p.id = u.id WHERE u.id = ?',
      parsed.id
    )
    if (!profile) return null

    return { user: { id: profile.id, email: profile.email, role: profile.role, tenant_id: profile.tenant_id, name: profile.name } }
  } catch {
    return null
  }
}

// ─── Tenants ────────────────────────────────────────────────

export function getTenantBySlug(slug: string) {
  return queryOne<{
    id: string; slug: string; name: string; description: string | null
    logo_url: string | null; is_active: number; phone: string | null
  }>('SELECT * FROM tenants WHERE slug = ?', slug)
}

export function getTenantById(id: string) {
  return queryOne<Record<string, unknown>>('SELECT * FROM tenants WHERE id = ?', id)
}

export function getTenants() {
  return queryAll<Record<string, unknown>>('SELECT * FROM tenants ORDER BY created_at DESC')
}

export function getTenantCount() {
  const row = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tenants')
  return row?.count ?? 0
}

// ─── Profiles ───────────────────────────────────────────────

export function getProfileById(id: string) {
  return queryOne<Record<string, unknown>>('SELECT * FROM profiles WHERE id = ?', id)
}

export function getProfiles() {
  return queryAll<Record<string, unknown>>('SELECT * FROM profiles ORDER BY created_at DESC')
}

export function getProfileCount() {
  const row = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM profiles')
  return row?.count ?? 0
}

// ─── Categories ─────────────────────────────────────────────

export function getCategoriesByTenantId(tenantId: string) {
  return queryAll<{ id: string; name: string; sort_order: number }>(
    'SELECT id, name, sort_order FROM categories WHERE tenant_id = ? AND is_active = 1 ORDER BY sort_order',
    tenantId
  )
}

// ─── Menu Items ─────────────────────────────────────────────

export function getMenuItemsByTenantId(tenantId: string, onlyAvailable = true) {
  const sql = onlyAvailable
    ? 'SELECT * FROM menu_items WHERE tenant_id = ? AND is_available = 1 ORDER BY sort_order'
    : 'SELECT * FROM menu_items WHERE tenant_id = ? ORDER BY sort_order'
  return queryAll<Record<string, unknown>>(sql, tenantId)
}

export function getMenuItemById(id: string) {
  return queryOne<Record<string, unknown>>('SELECT * FROM menu_items WHERE id = ?', id)
}

// ─── Orders ─────────────────────────────────────────────────

export function getOrders(options?: { tenantId?: string; limit?: number }) {
  let sql = 'SELECT * FROM orders WHERE 1=1'
  const params: unknown[] = []
  if (options?.tenantId) { sql += ' AND tenant_id = ?'; params.push(options.tenantId) }
  sql += ' ORDER BY created_at DESC'
  if (options?.limit) { sql += ' LIMIT ?'; params.push(options.limit) }
  return queryAll<Record<string, unknown>>(sql, ...params)
}

export function getOrderById(id: string) {
  return queryOne<Record<string, unknown>>('SELECT * FROM orders WHERE id = ?', id)
}

export function getOrderByIdWithItems(id: string) {
  const order = queryOne<Record<string, unknown>>(
    'SELECT o.*, t.slug as tenant_slug FROM orders o JOIN tenants t ON t.id = o.tenant_id WHERE o.id = ?',
    id
  )
  if (!order) return null
  const items = queryAll<Record<string, unknown>>('SELECT * FROM order_items WHERE order_id = ?', id)
  return { ...order, order_items: items }
}

export function getActiveOrders(tenantId: string) {
  return queryAll<Record<string, unknown>>(
    "SELECT * FROM orders WHERE tenant_id = ? AND status NOT IN ('delivered','cancelled','refunded') ORDER BY created_at DESC",
    tenantId
  )
}

export function getOrderCount() {
  const row = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders')
  return row?.count ?? 0
}

export function createOrder(data: {
  tenant_id: string
  customer_id: string
  delivery_address: string
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  items: Array<{
    menu_item_id: string
    name: string
    quantity: number
    unit_price: number
    modifiers: unknown[]
    subtotal: number
  }>
}) {
  const { randomUUID } = require('crypto')
  const orderId = randomUUID()

  execute(
    `INSERT INTO orders (id, tenant_id, customer_id, status, payment_status, delivery_address, subtotal, delivery_fee, tax, total, created_at, updated_at)
     VALUES (?, ?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    orderId, data.tenant_id, data.customer_id, JSON.stringify(data.delivery_address),
    data.subtotal, data.delivery_fee, data.tax, data.total
  )

  for (const item of data.items) {
    execute(
      `INSERT INTO order_items (id, order_id, menu_item_id, name, quantity, unit_price, modifiers, subtotal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      randomUUID(), orderId, item.menu_item_id, item.name, item.quantity,
      item.unit_price, JSON.stringify(item.modifiers), item.subtotal
    )
  }

  return getOrderById(orderId)
}

export function updateOrderStatus(orderId: string, status: string) {
  const timestamps: Record<string, string> = {
    confirmed: 'confirmed_at',
    ready: 'ready_at',
    delivered: 'delivered_at',
  }
  const tsCol = timestamps[status]
  const sql = tsCol
    ? `UPDATE orders SET status = ?, ${tsCol} = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    : "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
  execute(sql, status, orderId)
}

// ─── Deliveries ─────────────────────────────────────────────

export function upsertDelivery(orderId: string, driverId: string, status: string) {
  const existing = queryOne<{ id: string }>('SELECT id FROM deliveries WHERE order_id = ?', orderId)
  if (existing) {
    execute(
      "UPDATE deliveries SET driver_id = ?, status = ?, updated_at = datetime('now') WHERE order_id = ?",
      driverId, status, orderId
    )
  } else {
    const { randomUUID } = require('crypto')
    execute(
      `INSERT INTO deliveries (id, order_id, driver_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      randomUUID(), orderId, driverId, status
    )
  }
  return queryOne<Record<string, unknown>>('SELECT * FROM deliveries WHERE order_id = ?', orderId)
}

export function updateDeliveryLocation(orderId: string, location: string) {
  execute(
    "UPDATE deliveries SET location = ?, updated_at = datetime('now') WHERE order_id = ?",
    location, orderId
  )
}

// ─── Tenant Mutations ─────────────────────────────────────────

export function createTenant(data: {
  slug: string
  name: string
  description?: string
  phone?: string
  email?: string
  owner_id?: string
  owner_name?: string
}) {
  const { randomUUID } = require('crypto')
  const id = randomUUID()
  execute(
    `INSERT INTO tenants (id, slug, name, description, phone, email, is_active, owner_id, owner_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'), datetime('now'))`,
    id, data.slug, data.name, data.description || null, data.phone || null,
    data.email || null, data.owner_id || null, data.owner_name || null
  )
  return getTenantById(id)
}

export function updateTenant(id: string, data: {
  name?: string
  description?: string
  phone?: string
  email?: string
  slug?: string
  is_active?: number
}) {
  const sets: string[] = []
  const values: unknown[] = []
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sets.push(`${key} = ?`)
      values.push(val)
    }
  }
  if (sets.length === 0) return getTenantById(id)
  sets.push("updated_at = datetime('now')")
  values.push(id)
  execute(`UPDATE tenants SET ${sets.join(', ')} WHERE id = ?`, ...values)
  return getTenantById(id)
}

export function deleteTenant(id: string) {
  execute('DELETE FROM tenants WHERE id = ?', id)
}

export function getActiveTenants() {
  return queryAll<Record<string, unknown>>(
    'SELECT * FROM tenants WHERE is_active = 1 ORDER BY created_at DESC'
  )
}

export function isSlugAvailable(slug: string, excludeId?: string): boolean {
  const row = excludeId
    ? queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tenants WHERE slug = ? AND id != ?', slug, excludeId)
    : queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tenants WHERE slug = ?', slug)
  return (row?.count ?? 0) === 0
}

// ─── Profile Mutations ───────────────────────────────────────

export function getProfilesWithAuth() {
  return queryAll<{
    id: string
    email: string
    name: string
    role: string
    tenant_id: string | null
  }>(
    `SELECT p.id, u.email, p.name, p.role, p.tenant_id
     FROM profiles p JOIN auth_users u ON p.id = u.id
     ORDER BY p.created_at DESC`
  )
}

export function getProfilesByTenantId(tenantId: string) {
  return queryAll<Record<string, unknown>>(
    `SELECT p.*, u.email FROM profiles p JOIN auth_users u ON p.id = u.id
     WHERE p.tenant_id = ? ORDER BY p.created_at DESC`,
    tenantId
  )
}
