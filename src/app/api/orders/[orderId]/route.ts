import { NextResponse } from 'next/server'
import { getCurrentUser, getOrderByIdWithItems, updateOrderStatus } from '@/lib/local-data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const session = await getCurrentUser()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = getOrderByIdWithItems(orderId) as Record<string, unknown> | null
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Only allow customer, staff of the tenant, or admin to view
  if (order.customer_id !== session.user.id) {
    const { getProfileById } = await import('@/lib/local-data')
    const profile = getProfileById(session.user.id)

    if (!profile || ((profile.role as string) !== 'staff' && (profile.role as string) !== 'admin') ||
        (profile.tenant_id && profile.tenant_id !== order.tenant_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.json(order)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const session = await getCurrentUser()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only staff of the order's tenant or admin can update
  const order = getOrderByIdWithItems(orderId) as Record<string, unknown> | null
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (session.user.role !== 'admin') {
    const { getProfileById, getOrderById } = await import('@/lib/local-data')
    const profile = getProfileById(session.user.id)
    if (!profile || ((profile.role as string) !== 'staff') ||
        (profile.tenant_id !== order.tenant_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { status } = await request.json()
  updateOrderStatus(orderId, status)

  return NextResponse.json({ success: true })
}
