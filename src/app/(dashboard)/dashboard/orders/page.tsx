'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data || [])
    }
    load()
  }, [])

  const filtered = orders.filter(o =>
    !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.status?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="p-4">
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
