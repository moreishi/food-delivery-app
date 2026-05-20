import { notFound } from 'next/navigation'
import { getMenuItemById, getTenantBySlug } from '@/lib/local-data'
import { ItemDetail } from '@/components/customer/item-detail'

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>
}) {
  const { slug, itemId } = await params
  const tenant = getTenantBySlug(slug)
  if (!tenant) notFound()

  const item = getMenuItemById(itemId)
  if (!item) notFound()

  return <ItemDetail item={{ ...item, tenants: { name: tenant.name, slug: tenant.slug } } as any} tenantSlug={slug} />
}
