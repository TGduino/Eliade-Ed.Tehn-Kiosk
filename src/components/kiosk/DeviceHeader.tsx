'use client'

import { useTranslations } from 'next-intl'
import { Battery, BatteryCharging, Wifi, WifiOff } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useBatteryStatus } from '@/lib/hooks/useBatteryStatus'

interface DeviceHeaderProps {
  deviceName: string
  sessionName?: string
  isOnline: boolean
}

export function DeviceHeader({ deviceName, sessionName, isOnline }: DeviceHeaderProps) {
  const t = useTranslations('kiosk')
  const battery = useBatteryStatus()

  const getBatteryIcon = () => {
    if (!battery.supported || battery.level === null) return null

    if (battery.charging) {
      return <BatteryCharging className="h-5 w-5 text-primary" />
    }

    return <Battery className="h-5 w-5" />
  }

  const getBatteryColor = () => {
    if (!battery.level) return ''
    if (battery.level > 50) return 'text-green-600'
    if (battery.level > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <header className="bg-secondary text-secondary-foreground px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <Logo size={50} />
        <div>
          <p className="text-sm opacity-90">{t('deviceName')}</p>
          <h1 className="text-lg font-semibold">{deviceName}</h1>
        </div>
      </div>

      {sessionName && (
        <div className="text-center">
          <p className="text-sm opacity-90">{t('sessionActive')}</p>
          <p className="text-lg font-semibold">{sessionName}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        {battery.supported && battery.level !== null && (
          <div className={`flex items-center gap-2 ${getBatteryColor()}`}>
            {getBatteryIcon()}
            <span className="text-sm font-medium">{battery.level}%</span>
          </div>
        )}

        {isOnline ? (
          <Wifi className="h-5 w-5 text-green-400" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-400" />
        )}

        <LanguageToggle />
      </div>
    </header>
  )
}

