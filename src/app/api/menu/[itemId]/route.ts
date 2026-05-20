import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 400 })

  const { is_available, name, price } = await request.json()

  // Verify item belongs to staff's tenant
  const item = db.prepare('SELECT tenant_id FROM menu_items WHERE id = ?').get(itemId) as any
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  if (item.tenant_id !== tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updates: string[] = []
  const values: any[] = []

  if (is_available !== undefined) { updates.push('is_available = ?'); values.push(is_available) }
  if (name) { updates.push('name = ?'); values.push(name) }
  if (price) { updates.push('price = ?'); values.push(price) }

  if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  values.push(itemId)
  db.prepare(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`).run(...values)

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params
  const tenantId = _request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 400 })

  const item = db.prepare('SELECT tenant_id FROM menu_items WHERE id = ?').get(itemId) as any
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  if (item.tenant_id !== tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(itemId)
  return NextResponse.json({ success: true })
}
