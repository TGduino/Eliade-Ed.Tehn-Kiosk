'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface AdminPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdminPasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdminPasswordDialogProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const tKiosk = useTranslations('kiosk')
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: tCommon('error'),
          description: t('incorrectPassword'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to authenticate',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('enterAdminPassword')}</DialogTitle>
          <DialogDescription>
            Enter the administrator password to access the dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">{tKiosk('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? tCommon('loading') : t('login')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
