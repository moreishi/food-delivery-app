import { createClient } from '@/lib/supabase/server'

const tenantCache = new Map<string, { id: string; slug: string }>()

export async function resolveTenant(slug: string): Promise<{ id: string; slug: string } | null> {
  if (tenantCache.has(slug)) {
    return tenantCache.get(slug)!
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (error || !data) return null

    tenantCache.set(slug, data)
    return data
  } catch {
    return null
  }
}
