'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Circle, Clock, MapPin, Package, ChefHat, Truck, Home, ArrowLeft, RefreshCw, UtensilsCrossed } from 'lucide-react'

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  ready: Package,
  out_for_delivery: Truck,
  delivered: Home,
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'Your order has been received and is waiting for confirmation',
  confirmed: 'Restaurant has confirmed your order and will start preparing soon',
  preparing: 'Your food is being prepared with care',
  ready: 'Your order is ready and waiting for pickup',
  out_for_delivery: 'Your order is on the way to you!',
  delivered: 'Your order has been delivered. Enjoy your meal!',
}

export function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        if (data && !data.error) {
          setOrder(data)
          setLastUpdated(new Date())
        }
      } catch {
        // ignore polling errors
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  const currentStep = STATUS_ORDER.indexOf(order.status)
  const StatusIcon = STATUS_ICONS[order.status] || Clock

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            My Orders
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Order Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Status</h1>
            <p className="text-sm text-muted-foreground">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <Badge className={`${ORDER_STATUS_COLORS[order.status] || ''} px-3 py-1 text-sm`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>

        {/* Current Status Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">
                  {ORDER_STATUS_LABELS[order.status]}
                </h2>
                <p className="text-white/80 text-sm">
                  {STATUS_DESCRIPTIONS[order.status]}
                </p>
                {order.status === 'out_for_delivery' && (
                  <div className="mt-3 flex items-center gap-2 text-sm bg-white/20 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4" />
                    <span>Your order is on the way! ETA: 10-15 min</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200">
                <div 
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-orange-500 to-red-500 transition-all duration-500"
                  style={{ height: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%` }}
                />
              </div>

              <div className="space-y-0">
                {STATUS_ORDER.map((status, index) => {
                  const isComplete = index <= currentStep
                  const isCurrent = index === currentStep
                  const StepIcon = STATUS_ICONS[status]

                  return (
                    <div key={status} className="relative flex gap-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110' 
                          : isComplete 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isComplete ? <StepIcon className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 ${index !== STATUS_ORDER.length - 1 ? 'pb-4' : ''}`}>
                        <p className={`font-medium transition-colors ${
                          isComplete ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {ORDER_STATUS_LABELS[status]}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {STATUS_DESCRIPTIONS[status]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {/* Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                {order.order_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                        {getEmojiForItem(item.name)}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-orange-600">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing */}
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="pt-4 border-t">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium mb-1">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof order.delivery_address === 'string'
                      ? (() => { try { const a = JSON.parse(order.delivery_address); return `${a.street}, ${a.city}` } catch { return order.delivery_address } })()
                      : `${order.delivery_address?.street}, ${order.delivery_address?.city}`
                    }
                  </p>
                  {(() => {
                    const notes = typeof order.delivery_address === 'string'
                      ? (() => { try { const a = JSON.parse(order.delivery_address); return a.notes } catch { return null } })()
                      : order.delivery_address?.notes
                    return notes ? <p className="text-sm text-muted-foreground mt-1">Note: {notes}</p> : null
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/menu/${order.tenant_slug || 'pizzahub'}`} className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Order More
            </Button>
          </Link>
          {order.status === 'delivered' && (
            <Button className="flex-1 h-12 bg-orange-500 hover:bg-orange-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Rate Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function getEmojiForItem(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('pizza')) return '🍕'
  if (lower.includes('burger') || lower.includes('cheeseburger')) return '🍔'
  if (lower.includes('fries')) return '🍟'
  if (lower.includes('sushi') || lower.includes('roll')) return '🍣'
  if (lower.includes('salad')) return '🥗'
  if (lower.includes('chicken') || lower.includes('wings')) return '🍗'
  if (lower.includes('pasta') || lower.includes('spaghetti')) return '🍝'
  if (lower.includes('taco')) return '🌮'
  if (lower.includes('sandwich') || lower.includes('sub')) return '🥪'
  if (lower.includes('ice cream') || lower.includes('dessert')) return '🍨'
  if (lower.includes('drink') || lower.includes('soda')) return '🥤'
  if (lower.includes('coffee')) return '☕'
  return '🍽️'
}
