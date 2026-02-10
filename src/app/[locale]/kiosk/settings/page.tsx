'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDevice } from '@/lib/hooks/useDevice'
import { resetDevice } from '@/lib/utils/deviceFingerprint'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('kiosk')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { device, deviceId, updateDeviceName } = useDevice()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newDeviceName, setNewDeviceName] = useState(device?.device_name || '')
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handlePasswordSubmit = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    
    // In production, this should be handled securely via API
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setShowPasswordDialog(false)
    } else {
      toast({
        title: tCommon('error'),
        description: t('incorrectPassword', { ns: 'admin' }),
        variant: 'destructive',
      })
    }
  }

  const handleUpdateName = async () => {
    if (newDeviceName.trim()) {
      await updateDeviceName(newDeviceName)
      toast({
        title: tCommon('success'),
        description: 'Device name updated successfully',
      })
    }
  }

  const handleReset = () => {
    resetDevice()
    router.push(`/${locale}/kiosk`)
    router.refresh()
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('enterPassword')}</DialogTitle>
            <DialogDescription>
              Enter the admin password to access device settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.back()}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handlePasswordSubmit}>
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deviceId">{t('deviceId')}</Label>
              <Input
                id="deviceId"
                value={deviceId || ''}
                readOnly
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">{t('deviceNameLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  id="deviceName"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                />
                <Button onClick={handleUpdateName}>
                  {tCommon('save')}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowResetDialog(true)}
              >
                {t('resetDevice')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('resetDevice')}</DialogTitle>
            <DialogDescription>{t('resetConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

