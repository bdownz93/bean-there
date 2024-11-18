import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    console.log('🔒 Middleware check:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      error: error?.message
    })

    // Let client handle auth redirects
    return response
  } catch (error) {
    console.error('❌ Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-light.svg|logo-dark.svg).*)',
  ],
}