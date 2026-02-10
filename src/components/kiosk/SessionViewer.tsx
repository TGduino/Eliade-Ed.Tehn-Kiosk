'use client'

import { useEffect, useRef } from 'react'

interface SessionViewerProps {
  url: string
  sessionId: string
  onActivity?: (counts: { mouse: number; keyboard: number }) => void
}

export function SessionViewer({ url, sessionId, onActivity }: SessionViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Activity tracking is handled by ActivityTracker component
    // This component focuses on embedding the session content
  }, [])

  return (
    <div className="w-full h-screen">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  )
}

