import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ro'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  // Use await requestLocale as per next-intl 3.22+ API
  const locale = await requestLocale
  
  // Validate locale
  const validLocale = locales.includes(locale as any) ? locale : 'en'
  
  try {
    return {
      locale: validLocale,
      messages: (await import(`../messages/${validLocale}.json`)).default
    }
  } catch (error) {
    // Fallback to English if locale file doesn't exist
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    }
  }
})

