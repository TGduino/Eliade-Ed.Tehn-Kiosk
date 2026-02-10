'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('[Error Boundary] Error:', error)
    console.error('[Error Boundary] Error message:', error.message)
    console.error('[Error Boundary] Error stack:', error.stack)
    console.error('[Error Boundary] Error digest:', error.digest)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: '2rem' }}>
        <div>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>Something went wrong!</h1>
          <p style={{ marginBottom: '1rem' }}>An error occurred while rendering this page.</p>
          <details style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Error Details (Click to expand)
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', overflow: 'auto' }}>
              <strong>Message:</strong> {error.message || 'Unknown error'}
              {'\n\n'}
              <strong>Digest:</strong> {error.digest || 'N/A'}
              {'\n\n'}
              <strong>Stack:</strong>
              {'\n'}
              {error.stack || 'No stack trace available'}
            </pre>
          </details>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

