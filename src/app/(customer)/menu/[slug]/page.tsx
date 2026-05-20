import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTenantBySlug, getCategoriesByTenantId, getMenuItemsByTenantId } from '@/lib/local-data'
import { MenuCard } from '@/components/customer/menu-card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Star, Phone, ArrowLeft } from 'lucide-react'

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('pizza')) return '🍕'
  if (lower.includes('burger')) return '🍔'
  if (lower.includes('sushi')) return '🍣'
  if (lower.includes('taco')) return '🌮'
  if (lower.includes('coffee') || lower.includes('cafe')) return '☕'
  if (lower.includes('dessert') || lower.includes('ice cream')) return '🍨'
  if (lower.includes('chicken') || lower.includes('wings')) return '🍗'
  if (lower.includes('salad')) return '🥗'
  if (lower.includes('pasta')) return '🍝'
  return '🍽️'
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = getTenantBySlug(slug)
  if (!tenant) notFound()

  const categories = getCategoriesByTenantId(tenant.id)
  const menuItems = getMenuItemsByTenantId(tenant.id)

  const itemsByCategory = new Map<string, typeof menuItems>()
  for (const item of menuItems || []) {
    const catName = categories?.find(c => c.id === item.category_id)?.name || 'Other'
    const existing = itemsByCategory.get(catName) || []
    existing.push(item)
    itemsByCategory.set(catName, existing)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Restaurant Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to restaurants
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                {getCategoryEmoji(tenant.name)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{tenant.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-md">{tenant.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Open Now
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span>(200+ reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>25-35 min</span>
                  </div>
                  {tenant.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories?.map((category) => {
            const items = itemsByCategory.get(category.name) || []
            if (items.length === 0) return null
            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="whitespace-nowrap px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow border"
              >
                {category.name}
              </a>
            )
          })}
        </div>

        {/* Menu Sections */}
        <div className="space-y-12">
          {categories?.map((category) => {
            const items = itemsByCategory.get(category.name) || []
            if (items.length === 0) return null

            return (
              <section key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">{items.length} items</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MenuCard key={item.id as string} item={item as any} tenantSlug={slug} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}