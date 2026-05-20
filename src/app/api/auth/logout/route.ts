import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('local-session', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  })
  return response
}