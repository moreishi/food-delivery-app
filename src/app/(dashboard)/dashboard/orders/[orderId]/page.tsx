'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { ArrowLeft } from 'lucide-react'

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
}

export default function DashboardOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => setOrder(data))
  }, [orderId])

  if (!order) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge className={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {NEXT_STATUS[order.status] && (
        <Button className="w-full">
          Mark as {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]]}
        </Button>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-semibold">Order Items</h2>
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Summary</h2>
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPrice(order.delivery_fee)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(order.tax)}</span></div>
          <Separator />
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-2">Delivery Address</h2>
          <p className="text-sm text-muted-foreground">
            {order.delivery_address?.street}, {order.delivery_address?.city}
          </p>
          {order.delivery_address?.notes && (
            <p className="text-sm text-muted-foreground mt-1">Note: {order.delivery_address.notes}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
