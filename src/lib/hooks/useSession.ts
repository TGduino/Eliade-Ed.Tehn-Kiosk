'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Session, SessionType } from '@/types'

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchActiveSession() {
      try {
        // Get the most recent active session
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*, session_types(*)')
          .eq('status', 'active')
          .order('started_at', { ascending: false })
          .limit(1)

        if (!mounted) return

        if (sessions && sessions.length > 0) {
          const session = sessions[0]
          setActiveSession(session)
          // @ts-ignore - session_types is populated
          setSessionType(session.session_types || null)
        }
      } catch (error) {
        console.error('Failed to fetch active session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveSession()

    // Subscribe to session changes
    const channel = supabase
      .channel('sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const session = payload.new as Session
            
            if (session.status === 'active') {
              // Fetch session type
              const { data: type } = await supabase
                .from('session_types')
                .select('*')
                .eq('id', session.session_type_id)
                .single()

              setActiveSession(session)
              setSessionType(type)
            } else if (session.status === 'completed' || session.status === 'paused') {
              // Clear active session if it's completed or paused
              if (activeSession?.id === session.id) {
                setActiveSession(null)
                setSessionType(null)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      channel.unsubscribe()
    }
  }, [activeSession?.id])

  return {
    activeSession,
    sessionType,
    loading,
  }
}

