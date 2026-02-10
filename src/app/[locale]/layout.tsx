import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from '@/components/ui/toaster'
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
  // Handle params - could be Promise in Next.js 15
  const resolvedParams = params instanceof Promise ? await params : params
  const locale = resolvedParams.locale || 'en'
  const validLocale = locale === 'en' || locale === 'ro' ? locale : 'en'
  
  // Direct import - simpler and more reliable
  let messages
  try {
    messages = (await import(`../../../messages/${validLocale}.json`)).default
  } catch {
    // Fallback to English
    messages = (await import(`../../../messages/en.json`)).default
  }

  return (
    <html lang={validLocale}>
      <body className="font-sans">
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

