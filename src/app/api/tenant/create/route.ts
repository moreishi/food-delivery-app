import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser, createTenant, isSlugAvailable } from '@/lib/local-data'
import { updateLocalUser } from '@/lib/local-auth'
import { generateSlug, validateSlug } from '@/lib/slug-utils'

export async function POST(request: Request) {
  const session = await getCurrentUser()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  if (session.user.role !== 'staff') {
    return NextResponse.json({ error: 'Only staff can create tenants' }, { status: 403 })
  }
  if (session.user.tenant_id) {
    return NextResponse.json({ error: 'Already has a tenant' }, { status: 400 })
  }

  const { name, slug, description, phone } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 })
  }

  const finalSlug = slug || generateSlug(name)
  const validation = validateSlug(finalSlug)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  if (!isSlugAvailable(finalSlug)) {
    return NextResponse.json({ error: 'That URL slug is already taken. Try a different name.' }, { status: 409 })
  }

  const tenant = createTenant({
    slug: finalSlug,
    name: name.trim(),
    description: description?.trim() || null,
    phone: phone?.trim() || null,
    owner_id: session.user.id,
    owner_name: session.user.name,
  })

  updateLocalUser(session.user.id, { tenant_id: tenant!.id as string })

  const cookieStore = await cookies()
  cookieStore.set('local-session', JSON.stringify({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    tenant_id: tenant!.id,
    name: session.user.name,
  }), { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })

  return NextResponse.json({
    tenant,
    redirectTo: '/dashboard',
  })
}
