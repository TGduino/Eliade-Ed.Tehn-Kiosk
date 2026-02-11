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

  // Try direct URL first, fallback to proxy if CSP blocked
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
  const iframeSrc = iframeBlocked ? proxyUrl : url

  return (
    <div className="w-full h-screen">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full border-0"
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
        onLoad={() => setHasTriedIframe(true)}
        onError={() => {
          // If direct URL fails, try proxy
          if (!iframeBlocked && iframeEnabled) {
            setIframeBlocked(true)
          }
        }}
      />
    </div>
  )
}

