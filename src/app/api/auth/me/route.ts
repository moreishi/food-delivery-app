import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('local-session')

  if (!session?.value) {
    return NextResponse.json({ user: null })
  }

  try {
    const userData = JSON.parse(session.value)
    const { getLocalUserById } = await import('@/lib/local-auth')
    const user = getLocalUserById(userData.id)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
