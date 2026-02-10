'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ro' : 'en'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {locale === 'en' ? 'RO' : 'EN'}
    </Button>
  )
}

