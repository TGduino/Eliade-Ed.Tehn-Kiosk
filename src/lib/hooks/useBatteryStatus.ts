'use client'

import { useEffect, useState } from 'react'

interface BatteryStatus {
  level: number | null
  charging: boolean | null
  supported: boolean
}

export function useBatteryStatus() {
  const [battery, setBattery] = useState<BatteryStatus>({
    level: null,
    charging: null,
    supported: false,
  })

  useEffect(() => {
    let batteryManager: any = null

    const updateBattery = (battery: any) => {
      setBattery({
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        supported: true,
      })
    }

    // @ts-ignore - Battery API is not in TypeScript definitions
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((bat: any) => {
        batteryManager = bat
        updateBattery(bat)

        bat.addEventListener('levelchange', () => updateBattery(bat))
        bat.addEventListener('chargingchange', () => updateBattery(bat))
      })
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBattery)
        batteryManager.removeEventListener('chargingchange', updateBattery)
      }
    }
  }, [])

  return battery
}

