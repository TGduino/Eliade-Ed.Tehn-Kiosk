'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeviceHeader } from '@/components/kiosk/DeviceHeader'
import { SessionViewer } from '@/components/kiosk/SessionViewer'
import { ActivityTracker } from '@/components/kiosk/ActivityTracker'
import { useDevice } from '@/lib/hooks/useDevice'
import { supabase } from '@/lib/supabase/client'
import type { Session, SessionType } from '@/types'

export default function SessionPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string }
}) {
  const router = useRouter()
  const { device, deviceId } = useDevice()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, session_types(*)')
        .eq('id', id)
        .single()

      if (data) {
        setSession(data)
        // @ts-ignore
        setSessionType(data.session_types)

        // Check if session is no longer active
        if (data.status !== 'active') {
          router.push(`/${locale}/kiosk`)
        }
      }
    }

    fetchSession()

    // Subscribe to session changes
    const channel = supabase
      .channel(`session_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as Session
          setSession(updated)

          if (updated.status !== 'active') {
            router.push(`/${locale}/kiosk`)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [id, locale, router])

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

  if (!session || !sessionType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DeviceHeader
        deviceName={device?.device_name || 'Unknown Device'}
        sessionName={session.name}
        isOnline={isOnline}
      />

      <div className="flex-1">
        <SessionViewer url={sessionType.url_template} sessionId={id} />
      </div>

      <ActivityTracker
        deviceId={deviceId || ''}
        sessionId={id}
        enabled={!!deviceId}
      />
    </div>
  )
}

