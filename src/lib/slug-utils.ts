export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (slug.length < 2) return { valid: false, error: 'Slug must be at least 2 characters' }
  if (slug.length > 60) return { valid: false, error: 'Slug must be at most 60 characters' }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { valid: false, error: 'Use only lowercase letters, numbers, and hyphens' }
  }
  return { valid: true }
}
