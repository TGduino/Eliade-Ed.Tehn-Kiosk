'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import type { SessionType } from '@/types'

interface SessionTypeManagerProps {
  sessionTypes: SessionType[]
  onRefresh: () => void
}

export function SessionTypeManager({ sessionTypes, onRefresh }: SessionTypeManagerProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const { toast } = useToast()

  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<SessionType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url_template: '',
    icon_url: '',
    allow_url_preview: false,
    iframe_enabled: true,
  })

  const handleOpenDialog = (type?: SessionType) => {
    if (type) {
      setEditingType(type)
      setFormData({
        name: type.name,
        url_template: type.url_template,
        icon_url: type.icon_url || '',
        allow_url_preview: type.allow_url_preview,
        iframe_enabled: type.iframe_enabled,
      })
    } else {
      setEditingType(null)
      setFormData({
        name: '',
        url_template: '',
        icon_url: '',
        allow_url_preview: false,
        iframe_enabled: true,
      })
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url_template.trim()) {
      toast({
        title: tCommon('error'),
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const method = editingType ? 'PUT' : 'POST'
      const body = editingType
        ? { id: editingType.id, ...formData }
        : formData

      const response = await fetch('/api/session-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: editingType
            ? 'Session type updated successfully'
            : 'Session type created successfully',
        })
        setShowDialog(false)
        onRefresh()
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to save session type',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (type: SessionType) => {
    if (!confirm(`Delete ${type.name}?`)) return

    try {
      const response = await fetch('/api/session-types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: type.id }),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: 'Session type deleted successfully',
        })
        onRefresh()
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to delete session type',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('manageSessionTypes')}</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-md">
          <Plus className="h-4 w-4" />
          {t('addSessionType')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessionTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(type)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground break-all">
                {type.url_template}
              </div>
              <div className="flex gap-2 text-xs">
                {type.iframe_enabled && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    Iframe
                  </span>
                )}
                {type.allow_url_preview && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Preview
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? tCommon('edit') : tCommon('add')} {t('sessionType')}
            </DialogTitle>
            <DialogDescription>
              Configure the session type settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type-name">{t('typeName')}</Label>
              <Input
                id="type-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., SPIKE"
              />
            </div>
            <div>
              <Label htmlFor="url-template">{t('urlTemplate')}</Label>
              <Input
                id="url-template"
                value={formData.url_template}
                onChange={(e) =>
                  setFormData({ ...formData, url_template: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-preview">{t('allowUrlPreview')}</Label>
              <Switch
                id="allow-preview"
                checked={formData.allow_url_preview}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allow_url_preview: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="iframe-enabled">{t('iframeEnabled')}</Label>
              <Switch
                id="iframe-enabled"
                checked={formData.iframe_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, iframe_enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave}>{tCommon('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

