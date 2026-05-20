import { NextResponse } from 'next/server'
import { getCurrentUser, getProfileById } from '@/lib/local-data'
import { updateLocalUser } from '@/lib/local-auth'

const VALID_ROLES = ['customer', 'staff', 'admin']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = getProfileById(userId)
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const data = await request.json()
  const updates: { role?: string; tenant_id?: string | null } = {}

  if (data.role !== undefined) {
    if (!VALID_ROLES.includes(data.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    updates.role = data.role
  }

  if (data.tenant_id !== undefined) {
    updates.tenant_id = data.tenant_id || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const updated = updateLocalUser(userId, updates)
  return NextResponse.json(updated)
}
