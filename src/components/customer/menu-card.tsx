import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, Star, Plus } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  is_available: boolean
  options: unknown[]
}

export function MenuCard({
  item,
  tenantSlug,
}: {
  item: MenuItem
  tenantSlug: string
}) {
  const hasOptions = Array.isArray(item.options) && item.options.length > 0

  return (
    <Link href={`/menu/${tenantSlug}/item/${item.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md cursor-pointer bg-white">
        {/* Image Placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center overflow-hidden">
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {getEmojiForItem(item.name)}
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-foreground shadow-sm backdrop-blur-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
              4.8
            </Badge>
          </div>
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-white bg-black/70">Unavailable</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-lg leading-tight group-hover:text-orange-600 transition-colors">
              {item.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 bg-orange-50 text-orange-700 hover:bg-orange-100">
              {formatPrice(item.price)}
            </Badge>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>15-25 min</span>
            </div>
            <div className="flex items-center gap-2">
              {hasOptions && (
                <span className="text-xs text-muted-foreground">Customizable</span>
              )}
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
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
