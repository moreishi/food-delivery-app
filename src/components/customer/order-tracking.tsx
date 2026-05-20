'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Circle, Clock, MapPin } from 'lucide-react'

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

export function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => setOrder(data))

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, supabase])

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    )
  }

  const currentStep = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Status</h1>
          <p className="text-sm text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
        </div>
        <Badge className={ORDER_STATUS_COLORS[order.status] || ''}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-0">
            {STATUS_ORDER.map((status, index) => {
              const isComplete = index <= currentStep
              const isCurrent = index === currentStep

              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    {index < STATUS_ORDER.length - 1 && (
                      <div className={`w-0.5 h-12 ${isComplete && !isCurrent ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                  <div className={`pb-8 ${index === STATUS_ORDER.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`font-medium ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {ORDER_STATUS_LABELS[status]}
                    </p>
                    {isCurrent && order.status === 'out_for_delivery' && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Your order is on the way!
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-semibold">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Delivery Address
            </p>
            <p className="text-sm text-muted-foreground">
              {order.delivery_address.street}, {order.delivery_address.city}
            </p>
            {order.delivery_address.notes && (
              <p className="text-sm text-muted-foreground">Note: {order.delivery_address.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refresh hint */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" /> Updates in real-time
        </p>
      )}
    </div>
  )
}
