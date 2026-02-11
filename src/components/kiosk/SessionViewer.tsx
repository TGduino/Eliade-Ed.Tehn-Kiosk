'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SessionViewerProps {
  url: string
  sessionId: string
  iframeEnabled?: boolean
  onActivity?: (counts: { mouse: number; keyboard: number }) => void
}

export function SessionViewer({ url, sessionId, iframeEnabled = true, onActivity }: SessionViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [embedStrategy, setEmbedStrategy] = useState<'direct' | 'edge-proxy' | 'popup'>('direct')
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const [hasTriedIframe, setHasTriedIframe] = useState(false)
  const [popupWindow, setPopupWindow] = useState<Window | null>(null)
  const t = useTranslations('kiosk')

  useEffect(() => {
    if (!iframeEnabled) {
      setEmbedStrategy('popup')
      return
    }

    let blocked = false
    let edgeProxyAttempted = embedStrategy === 'edge-proxy'

    // Listen for CSP violations
    const handleSecurityError = (event: SecurityPolicyViolationEvent) => {
      if (event.violatedDirective.includes('frame-ancestors') || 
          event.violatedDirective.includes('frame-src') ||
          event.violatedDirective.includes('frame')) {
        blocked = true
        setIframeBlocked(true)
        
        // Escalate strategy
        if (embedStrategy === 'direct') {
          console.log('Direct iframe blocked by CSP, trying Edge proxy...')
          setEmbedStrategy('edge-proxy')
        } else if (embedStrategy === 'edge-proxy') {
          console.log('Edge proxy blocked, falling back to popup...')
          setEmbedStrategy('popup')
        }
      }
    }

    // Listen for window errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message || ''
      if (message.includes('frame-ancestors') || 
          message.includes('refused to connect') ||
          message.includes('Content Security Policy') ||
          message.includes('X-Frame-Options')) {
        blocked = true
        setIframeBlocked(true)
        
        if (embedStrategy === 'direct') {
          setEmbedStrategy('edge-proxy')
        } else if (embedStrategy === 'edge-proxy') {
          setEmbedStrategy('popup')
        }
      }
    }

    document.addEventListener('securitypolicyviolation', handleSecurityError)
    window.addEventListener('error', handleError)

    // Check iframe after it loads
    const checkIframe = () => {
      if (iframeRef.current && !blocked) {
        setTimeout(() => {
          if (!blocked && iframeRef.current) {
            try {
              const iframe = iframeRef.current
              const href = iframe.contentWindow?.location.href
              if (href === 'about:blank' && hasTriedIframe) {
                blocked = true
                if (embedStrategy === 'direct') {
                  setEmbedStrategy('edge-proxy')
                } else if (embedStrategy === 'edge-proxy') {
                  setEmbedStrategy('popup')
                }
              }
            } catch (e) {
              // Cross-origin error means content loaded but we can't access it
              // This is actually okay - the iframe is working
            }
          }
        }, 3000)
      }
    }

    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setHasTriedIframe(true)
        checkIframe()
      }
      
      iframeRef.current.onerror = () => {
        if (embedStrategy === 'direct') {
          setEmbedStrategy('edge-proxy')
        } else if (embedStrategy === 'edge-proxy') {
          setEmbedStrategy('popup')
        }
      }
    }

    const timeout = setTimeout(() => {
      if (!blocked && hasTriedIframe && iframeRef.current) {
        checkIframe()
      }
    }, 5000)

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityError)
      window.removeEventListener('error', handleError)
      clearTimeout(timeout)
    }
  }, [url, iframeEnabled, hasTriedIframe, embedStrategy])

  // Open popup window
  const handleOpenPopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.focus()
      return
    }

    const width = 1280
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    // Use edge proxy for popup to inject activity tracking
    const popupUrl = `/api/proxy-edge?url=${encodeURIComponent(url)}`
    const popup = window.open(
      popupUrl,
      `session_${sessionId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
    
    if (popup) {
      setPopupWindow(popup)
      
      // Monitor popup close
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup)
          setPopupWindow(null)
        }
      }, 1000)
    }
  }

  // Clean up popup on unmount
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close()
      }
    }
  }, [popupWindow])

  // Determine iframe source based on strategy
  let iframeSrc = url
  if (embedStrategy === 'edge-proxy') {
    iframeSrc = `/api/proxy-edge?url=${encodeURIComponent(url)}`
  }

  // Render based on embed strategy
  if (embedStrategy === 'popup') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
        <Card className="max-w-lg shadow-xl">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <ExternalLink className="h-16 w-16 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Session Running</h2>
              <p className="text-muted-foreground mb-4">
                This session is running in a separate window.
              </p>
              {popupWindow && !popupWindow.closed ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    <span className="font-medium">Window is open</span>
                  </div>
                  <Button onClick={() => popupWindow.focus()} className="w-full">
                    Focus Window
                  </Button>
                </div>
              ) : (
                <Button onClick={handleOpenPopup} className="w-full" size="lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open Session Window
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative">
      {embedStrategy === 'edge-proxy' && (
        <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Enhanced Mode
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full border-0"
        allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-downloads"
        onLoad={() => setHasTriedIframe(true)}
      />
    </div>
  )
}

