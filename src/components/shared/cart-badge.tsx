'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CartBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function update() {
      try {
        const raw = localStorage.getItem('food-delivery-cart')
        if (raw) {
          const state = JSON.parse(raw)
          const items = state?.state?.items || []
          setCount(items.reduce((s: number, i: any) => s + (i.quantity || 0), 0))
        } else {
          setCount(0)
        }
      } catch {
        setCount(0)
      }
    }

    update()
    window.addEventListener('storage', update)
    window.addEventListener('cart-updated', update)

    // Poll for changes since zustand persist doesn't emit events
    const interval = setInterval(update, 1000)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', update)
      window.removeEventListener('cart-updated', update)
    }
  }, [])

  return (
    <Link href="/checkout">
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingCart className="w-3.5 h-3.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
    </Link>
  )
}
