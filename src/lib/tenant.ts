import db from './db'

const tenantCache = new Map<string, { id: string; slug: string }>()

export async function resolveTenant(slug: string): Promise<{ id: string; slug: string } | null> {
  if (tenantCache.has(slug)) {
    return tenantCache.get(slug)!
  }

  try {
    const row = db.prepare('SELECT id, slug FROM tenants WHERE slug = ?').get(slug) as { id: string; slug: string } | undefined
    if (!row) return null
    tenantCache.set(slug, row)
    return row
  } catch {
    return null
  }
}
