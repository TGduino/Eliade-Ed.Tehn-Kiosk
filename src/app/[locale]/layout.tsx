import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Mircea Eliade School Kiosk',
  description: 'School laptop management system',
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  console.log('[Layout] Starting RootLayout render')
  console.log('[Layout] Params type:', params instanceof Promise ? 'Promise' : 'Direct')
  
  try {
    // Handle params - could be Promise in Next.js 15
    console.log('[Layout] Resolving params...')
    const resolvedParams = params instanceof Promise ? await params : params
    console.log('[Layout] Resolved params:', JSON.stringify(resolvedParams))
    
    const locale = resolvedParams?.locale || 'en'
    const validLocale = (locale === 'en' || locale === 'ro') ? locale : 'en'
    console.log('[Layout] Locale:', locale, '-> Valid locale:', validLocale)
    
    // Use getMessages() as next-intl expects - it handles the i18n config properly
    let messages: Record<string, any> = {}
    console.log('[Layout] Loading messages for locale:', validLocale)
    
    // Bypass getMessages() completely - use direct imports for reliability
    try {
      console.log('[Layout] Loading messages via direct import for locale:', validLocale)
      if (validLocale === 'ro') {
        const roMessages = await import(`../../../messages/ro.json`)
        messages = roMessages.default || {}
        console.log('[Layout] Romanian messages loaded, keys:', Object.keys(messages).length)
      } else {
        const enMessages = await import(`../../../messages/en.json`)
        messages = enMessages.default || {}
        console.log('[Layout] English messages loaded, keys:', Object.keys(messages).length)
      }
    } catch (error) {
      console.error('[Layout] Direct import failed:', error)
      console.error('[Layout] Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('[Layout] Error message:', error instanceof Error ? error.message : String(error))
      console.error('[Layout] Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      // Fallback to English
      try {
        console.log('[Layout] Falling back to English...')
        const enMessages = await import(`../../../messages/en.json`)
        messages = enMessages.default || {}
        console.log('[Layout] English fallback loaded, keys:', Object.keys(messages).length)
      } catch (fallbackError) {
        console.error('[Layout] English fallback also failed:', fallbackError)
        // Last resort: minimal fallback
        messages = {
          common: { loading: 'Loading...', error: 'Error', success: 'Success' },
          kiosk: { welcome: 'Welcome', waitingForSession: 'Waiting for session...' },
          admin: { welcome: 'Admin Dashboard' }
        }
        console.log('[Layout] Using minimal fallback messages')
      }
    }

    // Final validation
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error('[Layout] Messages validation failed, using minimal fallback')
      messages = {
        common: { loading: 'Loading...', error: 'Error', success: 'Success' },
        kiosk: { welcome: 'Welcome', waitingForSession: 'Waiting for session...' },
        admin: { welcome: 'Admin Dashboard' }
      }
    }

    console.log('[Layout] Final messages check:', {
      type: typeof messages,
      isObject: typeof messages === 'object',
      keys: Object.keys(messages).length,
      hasCommon: !!messages.common,
      hasKiosk: !!messages.kiosk
    })
    
    // Validate messages one more time before passing to NextIntlClientProvider
    if (!messages || typeof messages !== 'object') {
      console.error('[Layout] Messages validation failed at render time!')
      throw new Error('Messages object is invalid')
    }
    
    // Ensure messages is a plain serializable object
    let plainMessages: Record<string, any>
    try {
      plainMessages = JSON.parse(JSON.stringify(messages))
      console.log('[Layout] Messages serialized successfully')
    } catch (serializeError) {
      console.error('[Layout] Failed to serialize messages:', serializeError)
      // Use minimal fallback if serialization fails
      plainMessages = {
        common: { loading: 'Loading...', error: 'Error', success: 'Success' },
        kiosk: { welcome: 'Welcome', waitingForSession: 'Waiting for session...' },
        admin: { welcome: 'Admin Dashboard' }
      }
    }
    
    console.log('[Layout] About to render NextIntlClientProvider with locale:', validLocale)
    console.log('[Layout] Messages keys count:', Object.keys(plainMessages).length)
    
    // Wrap children in Suspense to catch any async errors
    return (
      <html lang={validLocale}>
        <body className="font-sans">
          <ErrorBoundary>
            <Suspense fallback={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Loading...</p>
              </div>
            }>
              <NextIntlClientProvider locale={validLocale} messages={plainMessages}>
                <Suspense fallback={<div>Loading content...</div>}>
                  {children}
                </Suspense>
                <Toaster />
              </NextIntlClientProvider>
            </Suspense>
          </ErrorBoundary>
        </body>
      </html>
    )
  } catch (error) {
    console.error('[Layout] CRITICAL ERROR in RootLayout:', error)
    console.error('[Layout] Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('[Layout] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Return a minimal error layout
    return (
      <html lang="en">
        <body className="font-sans">
          <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1>Layout Error</h1>
            <p>Check server logs for details.</p>
            <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        </body>
      </html>
    )
  }
}

