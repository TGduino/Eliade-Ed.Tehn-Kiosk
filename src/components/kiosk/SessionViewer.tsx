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
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const [hasTriedIframe, setHasTriedIframe] = useState(false)
  const t = useTranslations('kiosk')

  useEffect(() => {
    if (!iframeEnabled) {
      // If iframe is disabled, show the new window option
      setIframeBlocked(true)
      return
    }

    let blocked = false

    // Listen for CSP violations
    const handleSecurityError = (event: SecurityPolicyViolationEvent) => {
      if (event.violatedDirective.includes('frame-ancestors') || 
          event.violatedDirective.includes('frame-src') ||
          event.violatedDirective.includes('frame')) {
        blocked = true
        setIframeBlocked(true)
      }
    }

    // Listen for window errors that might indicate CSP blocking
    const handleError = (event: ErrorEvent) => {
      const message = event.message || ''
      if (message.includes('frame-ancestors') || 
          message.includes('refused to connect') ||
          message.includes('Content Security Policy') ||
          message.includes('X-Frame-Options')) {
        blocked = true
        setIframeBlocked(true)
      }
    }

    document.addEventListener('securitypolicyviolation', handleSecurityError)
    window.addEventListener('error', handleError)

    // Check iframe after it loads
    const checkIframe = () => {
      if (iframeRef.current && !blocked) {
        const iframe = iframeRef.current
        try {
          // Try to access iframe - will throw if CSP blocked
          const test = iframe.contentWindow
          // Check if content is actually loaded after a delay
          setTimeout(() => {
            if (!blocked && iframeRef.current) {
              try {
                // This will throw if CSP blocked
                const href = iframe.contentWindow?.location.href
                // If still about:blank after loading, might be blocked
                if (href === 'about:blank' && hasTriedIframe) {
                  blocked = true
                  setIframeBlocked(true)
                }
              } catch (e) {
                // CSP blocked - cross-origin or policy violation
                blocked = true
                setIframeBlocked(true)
              }
            }
          }, 2000)
        } catch (e) {
          // CSP blocked
          blocked = true
          setIframeBlocked(true)
        }
      }
    }

    // Set up iframe load handler
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setHasTriedIframe(true)
        checkIframe()
      }
    }

    // Also check after a delay as fallback
    const timeout = setTimeout(() => {
      if (!blocked && hasTriedIframe && iframeRef.current) {
        checkIframe()
      }
    }, 4000)

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityError)
      window.removeEventListener('error', handleError)
      clearTimeout(timeout)
    }
  }, [url, iframeEnabled, hasTriedIframe])

  const handleOpenInNewWindow = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // If iframe is blocked or disabled, show option to open in new window
  if (iframeBlocked || !iframeEnabled) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">
                {t('sessionCannotEmbed') || 'Session Cannot Be Embedded'}
              </h2>
              <p className="text-muted-foreground">
                {t('sessionOpenNewWindow') || 'This website cannot be displayed in an embedded frame. Click the button below to open it in a new window.'}
              </p>
              <Button 
                onClick={handleOpenInNewWindow}
                size="lg"
                className="gap-2 w-full"
              >
                <ExternalLink className="h-5 w-5" />
                {t('openInNewWindow') || 'Open in New Window'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        onLoad={() => setHasTriedIframe(true)}
        onError={() => setIframeBlocked(true)}
      />
    </div>
  )
}

