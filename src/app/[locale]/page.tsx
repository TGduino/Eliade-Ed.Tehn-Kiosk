import { redirect } from 'next/navigation'

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  const locale = resolvedParams.locale || 'en'
  redirect(`/${locale}/kiosk`)
}

