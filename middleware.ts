import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if needed
  const { data: { session }, error } = await supabase.auth.getSession()

  // For development, log session state
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      error: error?.message
    })
  }

  // Handle auth callback
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/beans/new', '/roasters/new']
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      
      // Create a response with the redirect
      const redirectRes = NextResponse.redirect(redirectUrl)
      
      // Copy the session cookie to the redirect response
      const sessionCookie = req.cookies.get('supabase-auth-token')
      if (sessionCookie) {
        redirectRes.cookies.set('supabase-auth-token', sessionCookie.value, {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      }
      
      return redirectRes
    }
  }

  // Auth page redirects (prevent authenticated users from accessing login/signup)
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session) {
      const redirectTo = req.nextUrl.searchParams.get('redirect') || '/'
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}