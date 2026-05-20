import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Helper: get user profile
  async function getProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .single()
    return data
  }

  // === DASHBOARD ROUTES ===
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const profile = await getProfile(user.id)
    if (!profile || profile.role !== 'staff') {
      return NextResponse.redirect(new URL('/403', request.url))
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', profile.tenant_id || '')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // === ADMIN ROUTES ===
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const profile = await getProfile(user.id)
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
