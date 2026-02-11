'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PopupWindowProps {
  url: string
  sessionId: string
  sessionName?: string
  onClose?: () => void
}

export function PopupWindow({ url, sessionId, sessionName, onClose }: PopupWindowProps) {
  const [popupWindow, setPopupWindow] = useState<Window | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openPopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.focus()
      return
    }

    // Calculate centered position
    const width = 1400
    const height = 900
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    // Use edge proxy for auto-login and activity tracking
    const proxyUrl = `/api/proxy-edge?url=${encodeURIComponent(url)}`
    
    const popup = window.open(
      proxyUrl,
      `kiosk_session_${sessionId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes`
    )

    if (popup) {
      setPopupWindow(popup)
      setIsOpen(true)

      // Focus the popup
      popup.focus()

      // Set up activity tracking via postMessage
      const handleMessage = (event: MessageEvent) => {
        // Listen for activity updates from the popup
        if (event.data?.type === 'activity') {
          console.log('Activity from popup:', event.data)
          // Activity is handled by the injected script in the popup
        }
      }

      window.addEventListener('message', handleMessage)

      // Poll to detect when popup is closed
      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval)
          setPopupWindow(null)
          setIsOpen(false)
          window.removeEventListener('message', handleMessage)
        }
      }, 1000)
    } else {
      alert('Please allow popups for this site to start the session.')
    }
  }

  const closePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close()
    }
    setPopupWindow(null)
    setIsOpen(false)
    onClose?.()
  }

  // Auto-open on mount
  useEffect(() => {
    openPopup()
    
    // Cleanup on unmount
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close()
      }
    }
  }, []) // Only run once on mount

  // Monitor window visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && popupWindow && !popupWindow.closed) {
        // When tab becomes visible, check if popup is still open
        try {
          popupWindow.focus()
        } catch (e) {
          // Window might have been closed
          setIsOpen(false)
          setPopupWindow(null)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [popupWindow])

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <Card className="max-w-xl w-full mx-4 shadow-2xl border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <ExternalLink className="h-7 w-7 text-primary" />
            {sessionName || 'Session Active'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            {isOpen && popupWindow && !popupWindow.closed ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 py-3 px-4 rounded-lg">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <div className="absolute inset-0 w-3 h-3 bg-green-600 rounded-full animate-ping" />
                  </div>
                  <span className="font-semibold text-lg">Session Window is Open</span>
                </div>
                
                <p className="text-muted-foreground">
                  Your session is running in a separate window. If you can't see it, click the button below to bring it to focus.
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => popupWindow.focus()} 
                    className="flex-1"
                    size="lg"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Focus Window
                  </Button>
                  <Button 
                    onClick={closePopup}
                    variant="outline"
                    size="lg"
                  >
                    <X className="mr-2 h-5 w-5" />
                    End Session
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-amber-600 bg-amber-50 py-3 px-4 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Session Window Closed</span>
                </div>
                
                <p className="text-muted-foreground">
                  The session window was closed. Click below to reopen it.
                </p>
                
                <Button 
                  onClick={openPopup} 
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Reopen Session Window
                </Button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">📌 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Don't close the session window until you're done</li>
              <li>Your work is being tracked automatically</li>
              <li>Make sure to save your work regularly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

