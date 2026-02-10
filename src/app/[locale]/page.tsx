import { redirect } from 'next/navigation'

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  console.log('[HomePage] Starting render')
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    console.log('[HomePage] Resolved params:', JSON.stringify(resolvedParams))
    const locale = resolvedParams?.locale || 'en'
    console.log('[HomePage] Redirecting to:', `/${locale}/kiosk`)
    redirect(`/${locale}/kiosk`)
  } catch (error) {
    console.error('[HomePage] ERROR:', error)
    redirect('/en/kiosk')
  }
}

