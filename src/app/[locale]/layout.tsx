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
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate locale and load messages
  const validLocale = ['en', 'ro'].includes(locale) ? locale : 'en'
  
  let messages
  try {
    messages = (await import(`../../../messages/${validLocale}.json`)).default
  } catch (error) {
    console.error('Failed to load messages:', error)
    messages = {}
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

