import type { Metadata } from 'next'
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
    
    // Direct import - bypass getMessages() completely for reliability
    let messages = {}
    console.log('[Layout] Loading messages for locale:', validLocale)
    
    try {
      if (validLocale === 'ro') {
        console.log('[Layout] Attempting to load Romanian messages...')
        const roMessages = await import(`../../../messages/ro.json`)
        messages = roMessages.default || {}
        console.log('[Layout] Romanian messages loaded, keys:', Object.keys(messages).length)
      } else {
        console.log('[Layout] Attempting to load English messages...')
        const enMessages = await import(`../../../messages/en.json`)
        messages = enMessages.default || {}
        console.log('[Layout] English messages loaded, keys:', Object.keys(messages).length)
      }
    } catch (error) {
      console.error('[Layout] Failed to load messages for', validLocale, ':', error)
      // Fallback to English if anything fails
      try {
        console.log('[Layout] Falling back to English messages...')
        const enMessages = await import(`../../../messages/en.json`)
        messages = enMessages.default || {}
        console.log('[Layout] Fallback English messages loaded, keys:', Object.keys(messages).length)
      } catch (fallbackError) {
        // If even English fails, use empty object - app will still render
        console.error('[Layout] Failed to load any messages:', fallbackError)
        console.log('[Layout] Using empty messages object')
      }
    }

    console.log('[Layout] Rendering HTML with locale:', validLocale)
    return (
      <html lang={validLocale}>
        <body className="font-sans">
          <ErrorBoundary>
            <NextIntlClientProvider locale={validLocale} messages={messages}>
              {children}
              <Toaster />
            </NextIntlClientProvider>
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

