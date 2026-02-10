'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getOrCreateDeviceId, getDeviceName } from '@/lib/utils/deviceFingerprint'
import { useBatteryStatus } from './useBatteryStatus'
import type { Device } from '@/types'

export function useDevice() {
  const [device, setDevice] = useState<Device | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const battery = useBatteryStatus()

  useEffect(() => {
    let mounted = true
    let heartbeatInterval: NodeJS.Timeout

    async function initDevice() {
      try {
        // Get or create device ID
        const id = await getOrCreateDeviceId()
        if (!mounted) return

        setDeviceId(id)

        // Check if device exists in database
        const { data: existingDevice } = await supabase
          .from('devices')
          .select('*')
          .eq('device_fingerprint', id)
          .single()

        if (existingDevice) {
          setDevice(existingDevice)
        } else {
          // Register new device
          const deviceName = getDeviceName()
          const { data: newDevice, error } = await supabase
            .from('devices')
            .insert({
              device_fingerprint: id,
              device_name: deviceName,
              is_active: true,
              last_seen: new Date().toISOString(),
            } as any)
            .select()
            .single()

          if (error) {
            console.error('Failed to register device:', error)
          } else if (newDevice) {
            setDevice(newDevice)
          }
        }

        // Start heartbeat
        startHeartbeat(id)
      } catch (error) {
        console.error('Failed to initialize device:', error)
      } finally {
        setLoading(false)
      }
    }

    function startHeartbeat(id: string) {
      // Update device status every 30 seconds
      heartbeatInterval = setInterval(async () => {
        const uptimeSeconds = Math.floor(performance.now() / 1000)

        await supabase
          .from('devices')
          .update({
            last_seen: new Date().toISOString(),
            is_active: true,
            battery_level: battery.level,
            battery_charging: battery.charging,
            uptime_seconds: uptimeSeconds,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('device_fingerprint', id)
      }, 30000)
    }

    initDevice()

    return () => {
      mounted = false
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
    }
  }, [battery.level, battery.charging])

  const updateDeviceName = async (name: string) => {
    if (!deviceId) return

    const { data, error } = await supabase
      .from('devices')
      .update({ device_name: name } as any)
      .eq('device_fingerprint', deviceId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update device name:', error)
    } else if (data) {
      setDevice(data)
      localStorage.setItem('device_name', name)
    }
  }

  return {
    device,
    deviceId,
    loading,
    updateDeviceName,
  }
}

