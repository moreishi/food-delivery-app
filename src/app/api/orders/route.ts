import { NextResponse } from 'next/server'
import { getCurrentUser, getActiveOrders, getOrders, createOrder } from '@/lib/local-data'

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId, items, deliveryAddress, subtotal, deliveryFee, tax, total } = await request.json()

    if (!tenantId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = createOrder({
      tenant_id: tenantId,
      customer_id: session.user.id,
      delivery_address: deliveryAddress,
      subtotal,
      delivery_fee: deliveryFee,
      tax,
      total,
      items: items.map((item: any) => ({
        menu_item_id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        modifiers: item.modifiers,
        subtotal: (item.price + item.modifiers.reduce((m: number, mod: any) => m + mod.priceModifier, 0)) * item.quantity,
      })),
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session?.user) {
      // Return empty for unauthenticated users
      return NextResponse.json([])
    }

    // If staff, get orders for their tenant
    if (session.user.role === 'staff' && session.user.tenant_id) {
      const orders = getActiveOrders(session.user.tenant_id)
      return NextResponse.json(orders)
    }

    // Otherwise get all customer's orders or all orders for admin
    if (session.user.role === 'admin') {
      const orders = getOrders({ limit: 50 })
      return NextResponse.json(orders)
    }

    // Customer — get their orders
    const orders = getOrders({ limit: 50 })
    const customerOrders = orders.filter((o: any) => o.customer_id === session.user.id)
    return NextResponse.json(customerOrders)
  } catch {
    return NextResponse.json([])
  }
}
