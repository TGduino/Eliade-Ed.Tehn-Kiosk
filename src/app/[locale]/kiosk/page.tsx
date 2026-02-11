'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Settings } from 'lucide-react'
import { DeviceHeader } from '@/components/kiosk/DeviceHeader'
import { StudentNameInput } from '@/components/kiosk/StudentNameInput'
import { ActivityTracker } from '@/components/kiosk/ActivityTracker'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDevice } from '@/lib/hooks/useDevice'
import { useSession } from '@/lib/hooks/useSession'

export default function KioskPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const t = useTranslations('kiosk')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { device, deviceId, loading: deviceLoading } = useDevice()
  const { activeSession, sessionType, loading: sessionLoading } = useSession()
  const [students, setStudents] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update device students when students array changes
  useEffect(() => {
    if (!device?.id) return

    const updateStudents = async () => {
      await fetch('/api/device-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: device.id,
          student_names: students,
          session_id: activeSession?.id || null,
        }),
      })
    }

    updateStudents()
  }, [students, device?.id, activeSession?.id])

  // Redirect to session page when active session exists
  useEffect(() => {
    if (activeSession && sessionType) {
      router.push(`/${locale}/kiosk/session/${activeSession.id}`)
    }
  }, [activeSession, sessionType, locale, router])

  if (deviceLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size={120} className="mb-4" />
          <p className="text-lg text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <DeviceHeader
        deviceName={device?.device_name || 'Unknown Device'}
        isOnline={isOnline}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <Logo size={140} className="mb-6 mx-auto" />
          <h1 className="text-5xl font-bold text-secondary mb-3">
            {t('welcome')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('welcomeSubtitle') || 'Enter your name and wait for your teacher to start a session'}
          </p>
        </div>

        <div className="space-y-8">
          <StudentNameInput students={students} onStudentsChange={setStudents} />

          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
                  <div className="animate-pulse flex space-x-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-secondary">
                  {t('waitingForSession')}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('waitingForSessionDescription') || 'Your teacher will start a session soon. Make sure your name is entered above.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/kiosk/settings`)}
              className="gap-2 border-2 hover:bg-secondary hover:text-secondary-foreground transition-colors"
              size="lg"
            >
              <Settings className="h-5 w-5" />
              {t('settings')}
            </Button>
          </div>
        </div>
      </main>

      <ActivityTracker
        deviceId={deviceId || ''}
        sessionId={null}
        enabled={!!deviceId}
      />
    </div>
  )
}
