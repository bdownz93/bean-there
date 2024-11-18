import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (!code) {
      console.error('❌ No code in callback')
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    // Create a Supabase client for this request
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Debug: Log initial state
    console.log('🔄 Auth Callback - Initial State:', {
      code: code.slice(0, 8) + '...',
      cookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value ? 'exists' : 'missing' }))
    })

    // Exchange the code for a session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !session) {
      console.error('❌ Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url))
    }

    // Debug: Log successful exchange
    console.log('✅ Auth Callback - Session Created:', {
      hasSession: !!session,
      userId: session.user.id,
      accessToken: session.access_token ? 'exists' : 'missing',
      refreshToken: session.refresh_token ? 'exists' : 'missing'
    })

    // Create response with redirect
    const response = NextResponse.redirect(new URL(next, request.url))

    // Set auth cookies with explicit attributes
    response.cookies.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      domain: 'localhost'
    })

    response.cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      domain: 'localhost'
    })

    // Debug: Log final response
    console.log('🔒 Auth Callback - Final Response:', {
      redirectTo: next,
      cookies: response.cookies.getAll().map(c => ({ name: c.name, value: c.value ? 'exists' : 'missing' }))
    })

    return response
  } catch (error) {
    console.error('❌ Auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}