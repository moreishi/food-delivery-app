import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MenuCard } from '@/components/customer/menu-card'

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, description, logo_url')
    .eq('slug', slug)
    .single()

  if (!tenant) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order')

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_available', true)
    .order('sort_order')

  const itemsByCategory = new Map<string, typeof menuItems>()
  for (const item of menuItems || []) {
    const catName = categories?.find(c => c.id === item.category_id)?.name || 'Other'
    const existing = itemsByCategory.get(catName) || []
    existing.push(item)
    itemsByCategory.set(catName, existing)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tenant Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{tenant.name}</h1>
        <p className="text-muted-foreground mt-1">{tenant.description}</p>
      </div>

      {/* Categories & Menu */}
      {categories?.map((category) => {
        const items = itemsByCategory.get(category.name) || []
        if (items.length === 0) return null

        return (
          <section key={category.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} tenantSlug={slug} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
