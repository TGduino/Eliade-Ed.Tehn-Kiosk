import html2canvas from 'html2canvas'

/**
 * Capture a screenshot of the current viewport
 * Returns a base64 encoded image
 */
export async function captureScreenshot(): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      scale: 0.5, // Reduce quality for smaller file size
      width: 800,
      height: 600,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        0.6 // 60% quality
      )
    })
  } catch (error) {
    console.error('Failed to capture screenshot:', error)
    return null
  }
}

/**
 * Upload screenshot to Supabase Storage
 */
export async function uploadScreenshot(
  blob: Blob,
  deviceId: string,
  sessionId: string | null
): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const fileName = `${deviceId}/${sessionId || 'idle'}/${timestamp}.jpg`

    const formData = new FormData()
    formData.append('file', blob)
    formData.append('fileName', fileName)
    formData.append('deviceId', deviceId)

    const response = await fetch('/api/upload-screenshot', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Failed to upload screenshot:', error)
    return null
  }
}

