import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ro'],
  defaultLocale: 'en',
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle root path - redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en/kiosk', request.url))
  }

  // Check if the path is an admin route (after locale prefix), but NOT the login page
  const isAdminRoute = pathname.match(/^\/(en|ro)\/admin/) && !pathname.match(/^\/(en|ro)\/admin\/login/)

  if (isAdminRoute) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      // Redirect to admin login if no token
      const locale = pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }

    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key-min-32-characters'
      )
      
      await jwtVerify(token, secret)
    } catch (error) {
      // Token invalid, redirect to login
      const locale = pathname.split('/')[1] || 'en'
      const response = NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request)
}

export const config = {
  // Exclude API routes, Next.js internals, and static files
  // But we need to handle all page routes for i18n
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}

