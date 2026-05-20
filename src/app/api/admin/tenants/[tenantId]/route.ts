import { NextResponse } from 'next/server'
import { getCurrentUser, getTenantById, updateTenant, deleteTenant, isSlugAvailable } from '@/lib/local-data'
import { validateSlug } from '@/lib/slug-utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tenant = getTenantById(tenantId)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }
  return NextResponse.json(tenant)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenant = getTenantById(tenantId)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const data = await request.json()
  const updates: Record<string, unknown> = {}

  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.description !== undefined) updates.description = data.description?.trim() || null
  if (data.phone !== undefined) updates.phone = data.phone?.trim() || null
  if (data.email !== undefined) updates.email = data.email?.trim() || null
  if (data.is_active !== undefined) updates.is_active = data.is_active ? 1 : 0

  if (data.slug !== undefined) {
    const newSlug = data.slug.trim()
    if (newSlug !== (tenant as any).slug) {
      const validation = validateSlug(newSlug)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
      if (!isSlugAvailable(newSlug, tenantId)) {
        return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 })
      }
    }
    updates.slug = newSlug
  }

  const updated = updateTenant(tenantId, updates)
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenant = getTenantById(tenantId)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  deleteTenant(tenantId)
  return NextResponse.json({ success: true })
}
