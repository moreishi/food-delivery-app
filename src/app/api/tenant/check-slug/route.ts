import { NextResponse } from 'next/server'
import { isSlugAvailable } from '@/lib/local-data'
import { validateSlug } from '@/lib/slug-utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const excludeId = searchParams.get('excludeId')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  const validation = validateSlug(slug)
  if (!validation.valid) {
    return NextResponse.json({ slug, available: false, error: validation.error })
  }

  const available = isSlugAvailable(slug, excludeId || undefined)
  return NextResponse.json({ slug, available })
}
