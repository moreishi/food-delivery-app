'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { Package, ShoppingBag, Clock, RefreshCw, Loader2, ChevronRight } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven&apos;t placed any orders yet. Start by browsing our restaurants!
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const itemCount = Array.isArray(order.order_items)
            ? order.order_items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0)
            : 0
          const firstItem = Array.isArray(order.order_items) ? order.order_items[0] : null

          return (
            <Link key={order.id} href={`/order/${order.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border hover:border-orange-200 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center text-xl">
                        {firstItem ? getEmoji(firstItem.name) : '🍽️'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${ORDER_STATUS_COLORS[order.status] || ''} shrink-0`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      {order.status === 'pending' && (
                        <>
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          <span>Awaiting confirmation</span>
                        </>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <>
                          <span>·</span>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span className="text-orange-600 font-medium">On its way!</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">{formatPrice(order.total)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function getEmoji(name: string): string {
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
