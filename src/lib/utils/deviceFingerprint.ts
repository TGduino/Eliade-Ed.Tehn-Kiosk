/**
 * Generate a device fingerprint based on browser characteristics
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = []

  // Screen resolution
  components.push(`${screen.width}x${screen.height}`)
  components.push(`${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0))

  // User agent
  components.push(navigator.userAgent)

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#F4C542'
      ctx.fillRect(0, 0, 200, 50)
      ctx.fillStyle = '#2C5F2D'
      ctx.fillText('Mircea Eliade Kiosk', 10, 10)
      components.push(canvas.toDataURL())
    }
  } catch (e) {
    // Canvas fingerprinting may be blocked
    components.push('canvas-blocked')
  }

  // Create hash from components
  const fingerprint = await hashString(components.join('|||'))
  return fingerprint
}

/**
 * Hash a string using Web Crypto API
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Get or create device ID
 * First checks localStorage, then generates fingerprint
 */
export async function getOrCreateDeviceId(): Promise<string> {
  // Check localStorage first
  const storedId = localStorage.getItem('device_id')
  if (storedId) {
    return storedId
  }

  // Generate fingerprint-based ID
  const fingerprint = await generateDeviceFingerprint()
  
  // Store in localStorage
  localStorage.setItem('device_id', fingerprint)
  
  return fingerprint
}

/**
 * Get device name from localStorage
 */
export function getDeviceName(): string {
  return localStorage.getItem('device_name') || 'Unnamed Device'
}

/**
 * Set device name in localStorage
 */
export function setDeviceName(name: string): void {
  localStorage.setItem('device_name', name)
}

/**
 * Reset device registration
 */
export function resetDevice(): void {
  localStorage.removeItem('device_id')
  localStorage.removeItem('device_name')
}

