import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
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
    
    // Use getMessages() from next-intl/server - it works with our i18n.ts config
    const messages = await getMessages()
    
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
              <NextIntlClientProvider locale={validLocale} messages={messages}>
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

