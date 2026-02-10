'use client'

import { useTranslations } from 'next-intl'
import { Battery, BatteryCharging, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Device, DeviceStudent, DeviceActivity } from '@/types'
import Image from 'next/image'

interface DeviceWithDetails extends Device {
  students?: DeviceStudent[]
  latestActivity?: DeviceActivity
}

interface DeviceMonitorProps {
  devices: DeviceWithDetails[]
  onRename: (device: Device) => void
  onRemove: (device: Device) => void
}

export function DeviceMonitor({ devices, onRename, onRemove }: DeviceMonitorProps) {
  const t = useTranslations('admin')

  const getDeviceStatus = (device: Device) => {
    const lastSeen = new Date(device.last_seen).getTime()
    const now = Date.now()
    const diff = now - lastSeen

    if (diff < 60000) return 'active' // Less than 1 minute
    if (diff < 300000) return 'idle' // Less than 5 minutes
    return 'offline'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}${t('hours')} ${minutes}${t('minutes')}`
    }
    return `${minutes}${t('minutes')}`
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {t('noDevices')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => {
        const status = getDeviceStatus(device)
        const latestStudents = device.students?.[0]

        return (
          <Card key={device.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
                    {device.device_name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {device.device_fingerprint.substring(0, 12)}...
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRename(device)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(device)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Battery Status */}
              {device.battery_level !== null && (
                <div className="flex items-center gap-2 text-sm">
                  {device.battery_charging ? (
                    <BatteryCharging className="h-4 w-4 text-primary" />
                  ) : (
                    <Battery className="h-4 w-4" />
                  )}
                  <span>{device.battery_level}%</span>
                </div>
              )}

              {/* Students */}
              {latestStudents && latestStudents.student_names.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('students')}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {latestStudents.student_names.map((name, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Uptime */}
              <div className="text-xs text-muted-foreground">
                {t('uptime')}: {formatUptime(device.uptime_seconds)}
              </div>

              {/* Latest Screenshot */}
              {device.latestActivity?.screenshot_url && (
                <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={device.latestActivity.screenshot_url}
                    alt="Device screenshot"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Activity Level */}
              {device.latestActivity && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('activity')}:
                  </p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">
                      🖱️ {device.latestActivity.mouse_activity_count}
                    </Badge>
                    <Badge variant="outline">
                      ⌨️ {device.latestActivity.keyboard_activity_count}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

