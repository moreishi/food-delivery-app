'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import { Minus, Plus, ArrowLeft, ShoppingCart, Check, Star, Clock, ChevronRight } from 'lucide-react'

interface MenuItemOption {
  name: string
  required: boolean
  choices: { name: string; priceModifier: number }[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  options: MenuItemOption[]
  tenant_id?: string
  tenants: { name: string; slug: string }
}

export function ItemDetail({
  item,
  tenantSlug,
}: {
  item: MenuItem
  tenantSlug: string
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const options = (item.options || []) as MenuItemOption[]

  // Initialize defaults for required options
  useEffect(() => {
    const defaults: Record<string, string> = {}
    for (const opt of options) {
      if (opt.required && opt.choices.length > 0) {
        defaults[opt.name] = opt.choices[0].name
      }
    }
    setSelectedOptions(defaults)
    
    // Get cart count
    const cart = useCartStore.getState()
    setCartCount(cart.items.length)
  }, [options])

  // Calculate total with modifiers
  const modifiersTotal = options.reduce((total, opt) => {
    const selected = selectedOptions[opt.name]
    const choice = opt.choices.find(c => c.name === selected)
    return total + (choice?.priceModifier || 0)
  }, 0)

  const itemTotal = (item.price + modifiersTotal) * quantity

  const selectedModifiers = Object.entries(selectedOptions).map(([name, choice]) => {
    const opt = options.find(o => o.name === name)
    const modChoice = opt?.choices.find(c => c.name === choice)
    return { name, choice, priceModifier: modChoice?.priceModifier || 0 }
  })

  function handleAddToCart() {
    useCartStore.getState().addItem({
      menuItemId: item.id,
      tenantId: item.tenant_id || '',
      tenantSlug: tenantSlug,
      name: item.name,
      price: item.price,
      quantity,
      modifiers: selectedModifiers,
      imageUrl: item.image_url || undefined,
    })
    setAdded(true)
    window.dispatchEvent(new Event('cart-updated'))
    setTimeout(() => setAdded(false), 1500)
  }

  const emoji = getEmojiForItem(item.name)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/menu/${tenantSlug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to menu
          </Link>
          <Link href="/checkout">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Hero Image */}
        <div className="relative h-64 -mx-4 mb-6 bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center overflow-hidden">
          <div className="text-9xl drop-shadow-lg">{emoji}</div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 backdrop-blur-sm shadow-lg">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
              4.9
            </Badge>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Link href={`/menu/${tenantSlug}`} className="text-sm text-orange-600 hover:underline">
                      {item.tenants.name}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-50 text-orange-700">
                    {formatPrice(item.price)}
                  </Badge>
                </div>
              </div>
              {item.description && (
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>15-25 min</span>
                </div>
                <span>•</span>
                <span>Popular item</span>
              </div>
            </div>

            <Separator />

            {/* Options */}
            {options.map((opt) => (
              <div key={opt.name}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold">{opt.name}</h3>
                  {opt.required && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {opt.choices.map((choice) => (
                    <label
                      key={choice.name}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedOptions[opt.name] === choice.name
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOptions[opt.name] === choice.name
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-slate-300'
                        }`}>
                          {selectedOptions[opt.name] === choice.name && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{choice.name}</span>
                      </div>
                      {choice.priceModifier > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +{formatPrice(choice.priceModifier)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {options.length > 0 && <Separator />}

            {/* Quantity + Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-orange-600">{formatPrice(itemTotal)}</p>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              className="w-full gap-2 h-14 text-lg shadow-lg shadow-orange-200" 
              size="lg" 
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </Button>
          </CardContent>
        </Card>
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
