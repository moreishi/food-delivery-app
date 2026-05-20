import { NextResponse } from 'next/server'
import { getCurrentUser, getTenants, createTenant, isSlugAvailable } from '@/lib/local-data'
import { validateSlug } from '@/lib/slug-utils'

export async function GET() {
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tenants = getTenants()
  return NextResponse.json(tenants)
}

export async function POST(request: Request) {
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, slug, description, phone, email } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 })
  }

  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const validation = validateSlug(slug.trim())
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  if (!isSlugAvailable(slug.trim())) {
    return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 })
  }

  const tenant = createTenant({
    slug: slug.trim(),
    name: name.trim(),
    description: description?.trim() || null,
    phone: phone?.trim() || null,
    email: email?.trim() || null,
  })

  return NextResponse.json(tenant)
}
