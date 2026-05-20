import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: Request) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json(null)

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId) as any
  return NextResponse.json(tenant || null)
}

export async function PUT(request: Request) {
  const { name, description, phone } = await request.json()
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 400 })

  db.prepare('UPDATE tenants SET name = ?, description = ?, phone = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(name, description, phone, tenantId)

  return NextResponse.json({ success: true })
}
