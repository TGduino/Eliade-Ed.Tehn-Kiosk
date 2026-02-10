'use client'

import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/shared/Logo'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { AdminPasswordDialog } from '@/components/shared/AdminPasswordDialog'

export default function AdminLoginPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const t = useTranslations('admin')
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/${locale}/admin`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary-700 to-secondary-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="text-center">
        <Logo size={120} className="mb-8" />
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('welcome')}
        </h1>
        <p className="text-primary-200 mb-8">
          Mircea Eliade School
        </p>

        <AdminPasswordDialog
          open={true}
          onOpenChange={() => router.push(`/${locale}/kiosk`)}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}

