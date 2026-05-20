'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore, getCartTotals } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Trash2, Minus, Plus, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { totalItems, totalPrice } = getCartTotals(items)
  const [address, setAddress] = useState({ street: '', city: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantId = items[0]?.tenantId
  const subtotal = totalPrice
  const deliveryFee = 500
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + deliveryFee + tax

  async function createOrder() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return null
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, items, deliveryAddress: address, subtotal, deliveryFee, tax, total }),
    })

    const order = await res.json()
    if (!res.ok) throw new Error(order.error || 'Failed to create order')
    return order
  }

  async function handlePayPal() {
    if (!address.street || !address.city) {
      setError('Please fill in your delivery address')
      return
    }
    setPaypalLoading(true)
    setError(null)

    try {
      const order = await createOrder()
      if (!order) return

      // Create PayPal order
      const paypalRes = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total }),
      })
      const paypalData = await paypalRes.json()
      if (!paypalRes.ok) throw new Error(paypalData.error)

      // Redirect to PayPal approval
      window.location.href = `https://www.paypal.com/checkoutnow?token=${paypalData.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PayPal failed')
    } finally {
      setPaypalLoading(false)
    }
  }

  async function handleStripe() {
    if (!address.street || !address.city) {
      setError('Please fill in your delivery address')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const order = await createOrder()
      if (!order) return
      router.push(`/order/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add items from a restaurant to get started.</p>
        <Button asChild>
          <a href="/menu/pizzahub">Browse Menu</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="space-y-6">
        {/* Order Items */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold">Order Items ({totalItems})</h2>
            {items.map((item) => (
              <div key={`${item.menuItemId}-${JSON.stringify(item.modifiers)}`} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {item.modifiers.map(m => `${m.choice}`).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => item.quantity > 1 && updateQuantity(item.menuItemId, item.quantity - 1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-medium shrink-0 w-20 text-right">{formatPrice(item.price * item.quantity)}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                  onClick={() => removeItem(item.menuItemId)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold">Delivery Address</h2>
            <Input placeholder="Street address" value={address.street}
              onChange={e => setAddress({ ...address, street: e.target.value })} />
            <Input placeholder="City" value={address.city}
              onChange={e => setAddress({ ...address, city: e.target.value })} />
            <Input placeholder="Delivery notes (optional)" value={address.notes}
              onChange={e => setAddress({ ...address, notes: e.target.value })} />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatPrice(500)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span>{formatPrice(Math.round(totalPrice * 0.12))}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice + 500 + Math.round(totalPrice * 0.12))}</span>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-3">
          <Button className="w-full" size="lg" onClick={handleStripe} disabled={loading}>
            {loading ? 'Processing...' : `Pay with Card — ${formatPrice(total)}`}
          </Button>
          <Button variant="outline" className="w-full" size="lg" onClick={handlePayPal} disabled={paypalLoading}>
            {paypalLoading ? 'Redirecting to PayPal...' : `Pay with PayPal — ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
