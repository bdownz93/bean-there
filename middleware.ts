import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get user and refresh session if needed
  const { data: { session }, error } = await supabase.auth.getSession()

  // For development, log session state
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      error: error?.message,
      cookies: req.cookies.getAll().map(c => c.name)
    })
  }

  // Handle auth routes
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  // Protected routes
  if (req.nextUrl.pathname === '/profile') {
    if (!session?.user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redirecting to login: No session or user')
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Auth page redirects
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session?.user) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}