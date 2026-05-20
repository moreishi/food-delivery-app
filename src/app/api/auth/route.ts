import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password, mode, name } = await request.json()

  // Use dynamic import to avoid loading better-sqlite3 in edge runtime
  const { authenticateLocalUser, createLocalUser } = await import('@/lib/local-auth')

  if (mode === 'signup') {
    try {
      const user = createLocalUser(email, password, name || email.split('@')[0])
      if (!user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      const cookieStore = await cookies()
      cookieStore.set('local-session', JSON.stringify({ id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id }), {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return NextResponse.json({ user })
    } catch (err: any) {
      if (err?.message?.includes('UNIQUE')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
  }

  // Login
  const user = authenticateLocalUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('local-session', JSON.stringify({ id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id }), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json({ user })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('local-session')
  return NextResponse.json({ success: true })
}
