'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, ArrowLeft, ShoppingCart } from 'lucide-react'

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
  tenants: { name: string; slug: string }
}

export function ItemDetail({
  item,
  tenantSlug,
}: {
  item: MenuItem
  tenantSlug: string
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const options = (item.options || []) as MenuItemOption[]

  // Initialize defaults for required options
  useState(() => {
    const defaults: Record<string, string> = {}
    for (const opt of options) {
      if (opt.required && opt.choices.length > 0) {
        defaults[opt.name] = opt.choices[0].name
      }
    }
    setSelectedOptions(defaults)
  })

  // Calculate total with modifiers
  const modifiersTotal = options.reduce((total, opt) => {
    const selected = selectedOptions[opt.name]
    const choice = opt.choices.find(c => c.name === selected)
    return total + (choice?.priceModifier || 0)
  }, 0)

  const itemTotal = (item.price + modifiersTotal) * quantity

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/menu/${tenantSlug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </Link>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{item.name}</h1>
                <p className="text-muted-foreground mt-1">{item.description}</p>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {formatPrice(item.price)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Options */}
          {options.map((opt) => (
            <div key={opt.name}>
              <h3 className="font-medium mb-3">
                {opt.name}
                {opt.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <div className="space-y-2">
                {opt.choices.map((choice) => (
                  <label
                    key={choice.name}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedOptions[opt.name] === choice.name
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={opt.name}
                        value={choice.name}
                        checked={selectedOptions[opt.name] === choice.name}
                        onChange={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [opt.name]: choice.name,
                          }))
                        }
                        className="text-primary"
                      />
                      <span className="text-sm">{choice.name}</span>
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

          <Separator />

          {/* Quantity + Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatPrice(itemTotal)}</p>
            </div>
          </div>

          <Button className="w-full gap-2" size="lg">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart — {formatPrice(itemTotal)}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
