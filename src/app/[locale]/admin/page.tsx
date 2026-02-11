'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogOut, Monitor, Activity, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Logo } from '@/components/shared/Logo'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { StatsDashboard } from '@/components/admin/StatsDashboard'
import { DeviceMonitor } from '@/components/admin/DeviceMonitor'
import { SessionControl } from '@/components/admin/SessionControl'
import { SessionTypeManager } from '@/components/admin/SessionTypeManager'
import { useRealtimeDevices } from '@/lib/hooks/useRealtimeDevices'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import type { Device, Session, SessionType } from '@/types'

export default function AdminDashboardPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { toast } = useToast()
  const { devices, loading: devicesLoading } = useRealtimeDevices()

  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [renameDevice, setRenameDevice] = useState<Device | null>(null)
  const [newDeviceName, setNewDeviceName] = useState('')

  useEffect(() => {
    fetchSessions()
    fetchSessionTypes()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const fetchSessionTypes = async () => {
    try {
      const response = await fetch('/api/session-types')
      const data = await response.json()
      setSessionTypes(data)
    } catch (error) {
      console.error('Failed to fetch session types:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/admin/login`)
  }

  const handleRenameDevice = async () => {
    if (!renameDevice || !newDeviceName.trim()) return

    try {
      const response = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: renameDevice.id,
          device_name: newDeviceName,
        }),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: 'Device renamed successfully',
        })
        setRenameDevice(null)
        setNewDeviceName('')
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to rename device',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveDevice = async (device: Device) => {
    if (!confirm(`Remove ${device.device_name}?`)) return

    try {
      const response = await fetch('/api/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: device.id }),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: 'Device removed successfully',
        })
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to remove device',
        variant: 'destructive',
      })
    }
  }

  const handleOpenRename = (device: Device) => {
    setRenameDevice(device)
    setNewDeviceName(device.device_name)
  }

  // Calculate stats
  const totalDevices = devices.length
  const activeSessions = sessions.filter((s) => s.status === 'active').length
  const studentsOnline = devices.reduce((sum, device) => {
    const latestStudents = device.students?.[0]
    return sum + (latestStudents?.student_names.length || 0)
  }, 0)
  const avgUptime = devices.length > 0
    ? devices.reduce((sum, d) => sum + d.uptime_seconds, 0) / devices.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg border-b-4 border-primary">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size={55} />
              <div>
                <h1 className="text-3xl font-bold">{t('welcome')}</h1>
                <p className="text-sm opacity-90 mt-0.5">Mircea Eliade School - Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white shadow-md border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4 mr-2" />
              {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Monitor className="h-4 w-4 mr-2" />
              {t('devices')}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t('sessions')}
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4 mr-2" />
              {t('config')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsDashboard
              totalDevices={totalDevices}
              activeSessions={activeSessions}
              studentsOnline={studentsOnline}
              avgUptime={avgUptime}
            />

            <div>
              <h2 className="text-2xl font-bold mb-4">{t('deviceMonitor')}</h2>
              <DeviceMonitor
                devices={devices.slice(0, 6)}
                onRename={handleOpenRename}
                onRemove={handleRemoveDevice}
              />
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <DeviceMonitor
              devices={devices}
              onRename={handleOpenRename}
              onRemove={handleRemoveDevice}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionControl
              sessions={sessions}
              sessionTypes={sessionTypes}
              onRefresh={fetchSessions}
            />
          </TabsContent>

          <TabsContent value="config">
            <SessionTypeManager
              sessionTypes={sessionTypes}
              onRefresh={fetchSessionTypes}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Rename Device Dialog */}
      <Dialog open={!!renameDevice} onOpenChange={() => setRenameDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rename')} Device</DialogTitle>
            <DialogDescription>
              Change the display name for this device
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="device-name">{t('deviceName')}</Label>
              <Input
                id="device-name"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameDevice()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDevice(null)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleRenameDevice}>{tCommon('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

