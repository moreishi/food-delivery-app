import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: Request) {
  const { name } = await request.json()
  const { randomUUID } = await import('crypto')

  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 400 })

  const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM categories WHERE tenant_id = ?').get(tenantId) as any

  db.prepare(`
    INSERT INTO categories (id, tenant_id, name, sort_order, is_active)
    VALUES (?, ?, ?, ?, 1)
  `).run(randomUUID(), tenantId, name, (maxSort?.max || 0) + 1)

  return NextResponse.json({ success: true })
}
