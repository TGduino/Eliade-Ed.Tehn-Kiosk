'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Device, DeviceStudent, DeviceActivity } from '@/types'

interface DeviceWithDetails extends Device {
  students?: DeviceStudent[]
  latestActivity?: DeviceActivity
}

export function useRealtimeDevices() {
  const [devices, setDevices] = useState<DeviceWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchDevices() {
      try {
        const { data: devicesData } = await supabase
          .from('devices')
          .select(`
            *,
            device_students(*),
            device_activity(*)
          `)
          .order('last_seen', { ascending: false })

        if (!mounted) return

        if (devicesData) {
          // Transform data to include latest activity
          const transformed = devicesData.map((device: any) => ({
            ...device,
            students: device.device_students || [],
            latestActivity: device.device_activity?.[0] || null,
          }))
          setDevices(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()

    // Subscribe to device changes
    const devicesChannel = supabase
      .channel('devices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        () => {
          fetchDevices()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_students',
        },
        () => {
          fetchDevices()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_activity',
        },
        () => {
          fetchDevices()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      devicesChannel.unsubscribe()
    }
  }, [])

  return {
    devices,
    loading,
  }
}

