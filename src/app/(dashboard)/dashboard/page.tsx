'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  Truck, 
  Home, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Users,
  ArrowRight,
  UtensilsCrossed
} from 'lucide-react'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  ready: Package,
  out_for_delivery: Truck,
  delivered: Home,
}

const STATUS_ACTIONS: Record<string, string> = {
  pending: 'Accept Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Start Delivery',
  out_for_delivery: 'Mark Delivered',
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, revenue: 0, customers: 0 })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLastUpdated(new Date())
    
    // Calculate stats
    const delivered = (Array.isArray(data) ? data : []).filter((o: any) => o.status === 'delivered')
    setStats({
      total: delivered.length,
      revenue: delivered.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      customers: new Set(delivered.map((o: any) => o.customer_id)).size,
    })
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function updateStatus(orderId: string, newStatus: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchOrders()
  }

  // Group orders by status
  const groupedOrders = STATUS_FLOW.reduce((acc, status) => {
    acc[status] = orders.filter((o: any) => o.status === status)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming orders and track their progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Revenue</p>
                <p className="text-3xl font-bold">{formatPrice(stats.revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Customers</p>
                <p className="text-3xl font-bold">{stats.customers}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATUS_FLOW.map((status) => {
          const statusOrders = groupedOrders[status] || []
          const StatusIcon = STATUS_ICONS[status]
          const isActive = statusOrders.length > 0

          return (
            <Card key={status} className={`border-0 shadow-md ${isActive ? 'ring-2 ring-orange-200' : ''}`}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>
                  <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-orange-500' : ''}>
                    {statusOrders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {statusOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <StatusIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs text-muted-foreground">No orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusOrders.map((order: any) => (
                      <div 
                        key={order.id} 
                        className="bg-white border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/dashboard/orders/${order.id}`}
                            className="font-semibold text-sm hover:text-orange-600 transition-colors"
                          >
                            #{order.id.slice(0, 6).toUpperCase()}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
                            {order.order_items?.[0]?.name ? getEmojiForItem(order.order_items[0].name) : '🍽️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-orange-600">{formatPrice(order.total)}</p>
                            {order.order_items?.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {order.order_items.map((i: any) => i.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                        {NEXT_STATUS[order.status] && (
                          <Button
                            size="sm"
                            className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                          >
                            {STATUS_ACTIONS[order.status]}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
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
