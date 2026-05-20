import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId, items, deliveryAddress, subtotal, deliveryFee, tax, total } = await request.json()

    if (!tenantId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        customer_id: user.id,
        delivery_address: deliveryAddress,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      modifiers: item.modifiers,
      subtotal: (item.price + item.modifiers.reduce((m: number, mod: any) => m + mod.priceModifier, 0)) * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
