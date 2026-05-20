import { NextResponse } from 'next/server'
import { getCurrentUser, upsertDelivery, updateDeliveryLocation } from '@/lib/local-data'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const session = await getCurrentUser()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await _request.json()

  const delivery = upsertDelivery(orderId, session.user.id, status || 'assigned')
  return NextResponse.json(delivery)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const session = await getCurrentUser()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { location } = await request.json()
  updateDeliveryLocation(orderId, location)

  return NextResponse.json({ success: true })
}
