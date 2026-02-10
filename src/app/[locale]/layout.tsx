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
  params: { locale: string }
}) {
  const { locale } = params
  const validLocale = locale === 'en' || locale === 'ro' ? locale : 'en'
  
  // Safely load messages with fallback
  let messages
  try {
    messages = await getMessages({ locale: validLocale })
  } catch (error) {
    console.error(`Could not load messages for locale ${validLocale}:`, error)
    // Fallback to default locale messages
    try {
      messages = (await import(`../../../messages/${validLocale}.json`)).default
    } catch {
      messages = (await import(`../../../messages/en.json`)).default
    }
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

