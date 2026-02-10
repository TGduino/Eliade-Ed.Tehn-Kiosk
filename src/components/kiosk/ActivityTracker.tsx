'use client'

import { useEffect, useRef } from 'react'
import { activityMonitor } from '@/lib/utils/activityMonitor'
import { captureScreenshot, uploadScreenshot } from '@/lib/utils/screenshotCapture'

interface ActivityTrackerProps {
  deviceId: string
  sessionId: string | null
  enabled: boolean
}

export function ActivityTracker({ deviceId, sessionId, enabled }: ActivityTrackerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !deviceId) return

    // Start activity monitoring
    activityMonitor.start()

    // Record activity every 5 minutes
    intervalRef.current = setInterval(async () => {
      const counts = activityMonitor.getCounts()

      // Record activity
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          session_id: sessionId,
          mouse_activity_count: counts.mouse,
          keyboard_activity_count: counts.keyboard,
        }),
      })

      // Reset counts
      activityMonitor.reset()

      // Capture and upload screenshot every other interval (10 minutes)
      if (sessionId) {
        const screenshot = await captureScreenshot()
        if (screenshot) {
          const url = await uploadScreenshot(screenshot, deviceId, sessionId)
          if (url) {
            // Update activity with screenshot URL
            await fetch('/api/activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                device_id: deviceId,
                session_id: sessionId,
                screenshot_url: url,
                mouse_activity_count: 0,
                keyboard_activity_count: 0,
              }),
            })
          }
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      activityMonitor.stop()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [deviceId, sessionId, enabled])

  return null // This is a headless component
}

