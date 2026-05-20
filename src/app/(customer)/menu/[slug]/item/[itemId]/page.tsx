import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ItemDetail } from '@/components/customer/item-detail'

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>
}) {
  const { slug, itemId } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('menu_items')
    .select('*, tenants!inner(name, slug)')
    .eq('id', itemId)
    .single()

  if (!item) notFound()

  return <ItemDetail item={item} tenantSlug={slug} />
}
