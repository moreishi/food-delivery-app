import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('local-session')
  let user: { id: string; role: string; tenant_id: string | null } | null = null

  if (sessionCookie?.value && sessionCookie.value.length > 0) {
    try {
      const parsed = JSON.parse(sessionCookie.value)
      if (parsed && parsed.id) {
        user = parsed
      }
    } catch {
      // Invalid or empty session cookie — ignore
    }
  }

  // === DASHBOARD ROUTES ===
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', user.tenant_id || '')
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // === ADMIN ROUTES ===
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  if (user) {
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
