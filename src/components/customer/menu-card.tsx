import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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
  return (
    <Link href={`/menu/${tenantSlug}/item/${item.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate">{item.name}</h3>
              <Badge variant="secondary" className="shrink-0">
                {formatPrice(item.price)}
              </Badge>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
