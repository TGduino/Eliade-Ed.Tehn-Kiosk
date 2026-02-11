'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, ZoomIn, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import { format } from 'date-fns'

interface Screenshot {
  id: string
  screenshot_url: string
  created_at: string
  device_id: string
  session_id: string | null
  devices?: { device_name: string }
  sessions?: { name: string }
}

export function ScreenshotGallery() {
  const t = useTranslations('admin')
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchScreenshots()
    const interval = setInterval(fetchScreenshots, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchScreenshots = async () => {
    try {
      let query = supabase
        .from('device_activity')
        .select('id, screenshot_url, created_at, device_id, session_id, devices(device_name), sessions(name)')
        .not('screenshot_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter !== 'all') {
        query = query.eq('session_id', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setScreenshots((data as Screenshot[]) || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch screenshots:', error)
      setLoading(false)
    }
  }

  const handleDownload = (url: string, deviceName: string, date: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `screenshot-${deviceName}-${date}.png`
    link.click()
  }

  if (loading) {
    return <div className="text-center py-8">Loading screenshots...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('screenshots') || 'Screenshots'}</h2>
        <div className="text-sm text-muted-foreground">
          {screenshots.length} {t('screenshots') || 'screenshots'}
        </div>
      </div>

      {screenshots.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t('noScreenshots') || 'No screenshots available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {screenshots.map((screenshot) => (
            <Card
              key={screenshot.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(screenshot.screenshot_url)}
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={screenshot.screenshot_url}
                  alt="Screenshot"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium truncate">
                  {(screenshot.devices as any)?.device_name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(screenshot.created_at), 'MMM dd, HH:mm')}
                </p>
                {(screenshot.sessions as any)?.name && (
                  <p className="text-xs text-primary mt-1 truncate">
                    {(screenshot.sessions as any).name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full-screen image viewer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0">
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/90"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={selectedImage}
                  alt="Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const screenshot = screenshots.find(s => s.screenshot_url === selectedImage)
                    if (screenshot) {
                      handleDownload(
                        selectedImage,
                        (screenshot.devices as any)?.device_name || 'device',
                        format(new Date(screenshot.created_at), 'yyyy-MM-dd-HHmm')
                      )
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

