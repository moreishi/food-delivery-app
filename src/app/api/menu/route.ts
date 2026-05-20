import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: Request) {
  // Use x-tenant-id from proxy header when available (staff dashboard)
  const tenantId = request.headers.get('x-tenant-id')
  const userRole = request.headers.get('x-user-role')

  if (tenantId && (userRole === 'staff' || userRole === 'admin')) {
    const items = db.prepare('SELECT * FROM menu_items WHERE tenant_id = ? ORDER BY sort_order').all(tenantId)
    const categories = db.prepare('SELECT * FROM categories WHERE tenant_id = ? ORDER BY sort_order').all(tenantId)
    return NextResponse.json({ items, categories })
  }

  // Public menu pages — return all items (filtered client-side by slug)
  const items = db.prepare('SELECT * FROM menu_items ORDER BY sort_order').all()
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all()
  return NextResponse.json({ items, categories })
}

export async function POST(request: Request) {
  const { name, price, category_id } = await request.json()
  const { randomUUID } = await import('crypto')

  // Use tenant from proxy header
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 400 })

  db.prepare(`
    INSERT INTO menu_items (id, tenant_id, category_id, name, price, is_available, sort_order)
    VALUES (?, ?, ?, ?, ?, 1, 0)
  `).run(randomUUID(), tenantId, category_id || null, name, parseInt(price))

  return NextResponse.json({ success: true })
}
