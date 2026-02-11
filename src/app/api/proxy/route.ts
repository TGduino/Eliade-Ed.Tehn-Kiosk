import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetUrl = searchParams.get('url')

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let url: URL
    try {
      url = new URL(targetUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    // Fetch the content
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'text/html'
    const content = await response.text()

    // If it's HTML, rewrite URLs to go through our proxy
    let processedContent = content
    if (contentType.includes('text/html')) {
      // Rewrite absolute URLs
      processedContent = content
        .replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
          return `href="/api/proxy?url=${encodeURIComponent(url)}"`
        })
        .replace(/src="(https?:\/\/[^"]+)"/g, (match, url) => {
          return `src="/api/proxy?url=${encodeURIComponent(url)}"`
        })
        .replace(/action="(https?:\/\/[^"]+)"/g, (match, url) => {
          return `action="/api/proxy?url=${encodeURIComponent(url)}"`
        })
        // Remove CSP headers from meta tags
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
    }

    // Return with proper headers
    return new NextResponse(processedContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

