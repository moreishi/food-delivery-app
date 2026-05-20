import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL('/', request.url)
  const response = NextResponse.redirect(url)
  response.cookies.set('local-session', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  })
  return response
}
