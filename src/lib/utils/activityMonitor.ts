export class ActivityMonitor {
  private mouseCount: number = 0
  private keyboardCount: number = 0
  private lastMouseTime: number = 0
  private isTracking: boolean = false
  private debounceMs: number = 100

  constructor(debounceMs: number = 100) {
    this.debounceMs = debounceMs
  }

  start() {
    if (this.isTracking) return

    this.isTracking = true
    this.mouseCount = 0
    this.keyboardCount = 0

    // Mouse events
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('click', this.handleClick)

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown)
  }

  stop() {
    this.isTracking = false
    
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  private handleMouseMove = () => {
    if (!this.isTracking) return

    const now = Date.now()
    if (now - this.lastMouseTime > this.debounceMs) {
      this.mouseCount++
      this.lastMouseTime = now
    }
  }

  private handleClick = () => {
    if (!this.isTracking) return
    this.mouseCount += 2 // Give more weight to clicks
  }

  private handleKeyDown = () => {
    if (!this.isTracking) return
    this.keyboardCount++
  }

  getCounts() {
    return {
      mouse: this.mouseCount,
      keyboard: this.keyboardCount,
    }
  }

  reset() {
    this.mouseCount = 0
    this.keyboardCount = 0
  }
}

export const activityMonitor = new ActivityMonitor()

