'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [tenantId, setTenantId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Fetch active orders
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('tenant_id', profile.tenant_id)
        .not('status', 'in', '("delivered","cancelled","refunded")')
        .order('created_at', { ascending: false })

      if (data) setOrders(data)

      // Realtime subscription
      const channel = supabase
        .channel(`dashboard-${profile.tenant_id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev =>
              prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
            )
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [supabase])

  async function updateStatus(orderId: string, newStatus: string) {
    await supabase
      .from('orders')
      .update({
        status: newStatus,
        ...(newStatus === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
        ...(newStatus === 'ready' ? { ready_at: new Date().toISOString() } : {}),
        ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
      })
      .eq('id', orderId)
  }

  // Group orders by status
  const groupedOrders = STATUS_FLOW.reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Orders</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">{orders.length} active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_FLOW.map((status) => {
          const statusOrders = groupedOrders[status] || []
          return (
            <Card key={status} className={statusOrders.length > 0 ? 'border-primary/50' : ''}>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{ORDER_STATUS_LABELS[status]}</span>
                  <Badge variant="secondary" className="ml-2">{statusOrders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {statusOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No orders</p>
                ) : (
                  statusOrders.map((order: any) => (
                    <div key={order.id} className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{order.id.slice(0, 6)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-bold">{formatPrice(order.total)}</p>
                      {order.order_items?.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {order.order_items.map((i: any) => i.name).join(', ')}
                        </p>
                      )}
                      {NEXT_STATUS[order.status] && (
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                        >
                          {status === 'pending' ? 'Accept' : `Mark ${ORDER_STATUS_LABELS[NEXT_STATUS[order.status]]}`}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
