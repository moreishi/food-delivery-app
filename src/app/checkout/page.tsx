'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore, getCartTotals } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Trash2, Minus, Plus, CreditCard, ArrowLeft, MapPin, Shield, Truck, Check } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { totalItems, totalPrice } = getCartTotals(items)
  const [address, setAddress] = useState({ street: '', city: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantId = items[0]?.tenantId
  const tenantSlug = items[0]?.tenantSlug || 'pizzahub'
  const subtotal = totalPrice
  const deliveryFee = 500
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + deliveryFee + tax

  async function getCurrentUserId(): Promise<string | null> {
    try {
      const meRes = await fetch('/api/auth/me')
      const meData = await meRes.json()
      return meData?.user?.id || null
    } catch {
      return null
    }
  }

  async function createOrder() {
    const userId = await getCurrentUserId()
    if (!userId) {
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

      const paypalRes = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total }),
      })
      const paypalData = await paypalRes.json()
      if (!paypalRes.ok) throw new Error(paypalData.error)

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add some delicious items from our restaurants to get started with your order.
          </p>
          <Link href={`/menu/${tenantSlug}`}>
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link href={`/menu/${tenantSlug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Items & Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Order Items ({totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.menuItemId}-${JSON.stringify(item.modifiers)}`} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {getEmojiForItem(item.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.modifiers.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.modifiers.map(m => `${m.choice}`).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 bg-white rounded-lg border">
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => item.quantity > 1 && updateQuantity(item.menuItemId, item.quantity - 1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.menuItemId)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold text-orange-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input 
                      placeholder="123 Main Street" 
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input 
                      placeholder="New York" 
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Notes (Optional)</label>
                  <Input 
                    placeholder="Ring the doorbell, leave at door, etc." 
                    value={address.notes}
                    onChange={e => setAddress({ ...address, notes: e.target.value })}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery Fee
                    </span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (12%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-orange-600">{formatPrice(total)}</span>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button 
                    className="w-full h-14 text-lg gap-2 shadow-lg shadow-orange-200" 
                    size="lg" 
                    onClick={handleStripe} 
                    disabled={loading}
                  >
                    <CreditCard className="w-5 h-5" />
                    {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12" 
                    size="lg" 
                    onClick={handlePayPal} 
                    disabled={paypalLoading}
                  >
                    {paypalLoading ? 'Redirecting...' : 'Pay with PayPal'}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
