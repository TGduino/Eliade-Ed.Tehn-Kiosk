import { NextRequest, NextResponse } from 'next/server'

// Force this route to run on Edge runtime for header manipulation
export const runtime = 'edge'

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

    // Build request headers mimicking Edge browser
    const requestHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    }

    // Forward cookies from the original request
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      requestHeaders['Cookie'] = cookieHeader
    }

    // Fetch the content
    const response = await fetch(targetUrl, {
      headers: requestHeaders,
      redirect: 'follow',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'text/html'
    
    // For HTML content, inject auto-login and modify headers
    if (contentType.includes('text/html')) {
      const content = await response.text()
      
      // Auto-login credentials
      const autoLoginEmail = process.env.AUTO_LOGIN_EMAIL || 'elevi.ed.tehn.eliade@gmail.com'
      const autoLoginPassword = process.env.AUTO_LOGIN_PASSWORD || 'Pereu@1973'

      // Inject base tag to handle relative URLs properly
      let processedContent = content
      
      // Add base tag if not present to help with relative URLs
      if (!content.includes('<base')) {
        const baseTag = `<base href="${url.origin}/">`
        if (processedContent.includes('<head>')) {
          processedContent = processedContent.replace('<head>', `<head>${baseTag}`)
        } else if (processedContent.includes('<html>')) {
          processedContent = processedContent.replace('<html>', `<html><head>${baseTag}</head>`)
        }
      }

      // Remove CSP meta tags that block iframe embedding
      processedContent = processedContent
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*name=["']referrer["'][^>]*>/gi, '')

      // Inject comprehensive auto-login script
      const autoLoginScript = `
<script>
(function() {
  const email = ${JSON.stringify(autoLoginEmail)};
  const password = ${JSON.stringify(autoLoginPassword)};
  let loginAttempted = false;
  let step = 0;
  
  function isGoogleLogin() {
    return window.location.hostname.includes('accounts.google.com') || 
           window.location.hostname.includes('google.com');
  }
  
  function isGoogleOAuth() {
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    return bodyText.includes('sign in with google') ||
           bodyText.includes('continue with google') ||
           document.querySelector('[data-provider="google"], button[aria-label*="Google"]') !== null;
  }
  
  function clickGoogleSignIn() {
    const selectors = [
      'button[aria-label*="Google" i]',
      '[data-provider="google"]',
      'button:has-text("Google")',
      '.google-signin',
      '#google-signin'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (el.offsetParent !== null && !el.disabled) {
            el.click();
            return true;
          }
        }
      } catch (e) {}
    }
    
    const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    for (const btn of allButtons) {
      const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
      if ((text.includes('google') || text.includes('gmail')) && 
          (text.includes('sign') || text.includes('continue') || text.includes('login'))) {
        if (btn.offsetParent !== null && !btn.disabled) {
          btn.click();
          return true;
        }
      }
    }
    return false;
  }
  
  function handleGoogleLogin() {
    if (step === 0) {
      const identifierInput = document.querySelector('input[type="email"], input[name="identifier"], input[id="identifierId"]');
      if (identifierInput && !identifierInput.value) {
        identifierInput.focus();
        identifierInput.value = email;
        ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
          identifierInput.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
        
        setTimeout(() => {
          const nextButton = Array.from(document.querySelectorAll('button, [role="button"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              return text.includes('next') || text.includes('continue') || (btn.type === 'button' && !text);
            });
          
          if (nextButton) {
            nextButton.click();
            step = 1;
            loginAttempted = true;
          }
        }, 800);
        return true;
      }
    }
    
    if (step === 1) {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput && !passwordInput.value) {
        passwordInput.focus();
        passwordInput.value = password;
        ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
          passwordInput.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
        
        setTimeout(() => {
          const signInButton = Array.from(document.querySelectorAll('button, [role="button"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              return text.includes('sign in') || text.includes('next') || btn.type === 'submit';
            });
          
          if (signInButton) {
            signInButton.click();
            step = 2;
          }
        }, 800);
        return true;
      }
    }
    return false;
  }
  
  function handleGenericLogin() {
    const emailSelectors = [
      'input[type="email"]',
      'input[name*="email" i]',
      'input[name*="username" i]',
      'input[id*="email" i]',
      'input[id*="username" i]'
    ];
    
    const passwordSelectors = [
      'input[type="password"]',
      'input[name*="password" i]',
      'input[id*="password" i]'
    ];
    
    let emailInput = null;
    let passwordInput = null;
    
    for (const selector of emailSelectors) {
      const inputs = document.querySelectorAll(selector);
      for (const input of inputs) {
        if (input.offsetParent !== null && !input.disabled && !input.readOnly) {
          emailInput = input;
          break;
        }
      }
      if (emailInput) break;
    }
    
    for (const selector of passwordSelectors) {
      const inputs = document.querySelectorAll(selector);
      for (const input of inputs) {
        if (input.offsetParent !== null && !input.disabled && !input.readOnly) {
          passwordInput = input;
          break;
        }
      }
      if (passwordInput) break;
    }
    
    if (emailInput && passwordInput && !emailInput.value && !passwordInput.value) {
      emailInput.focus();
      emailInput.value = email;
      ['input', 'change', 'blur'].forEach(eventType => {
        emailInput.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      setTimeout(() => {
        passwordInput.focus();
        passwordInput.value = password;
        ['input', 'change', 'blur'].forEach(eventType => {
          passwordInput.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        setTimeout(() => {
          const submitButton = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              return text.includes('sign in') || text.includes('log in') || text.includes('login') || btn.type === 'submit';
            });
          
          if (submitButton) {
            submitButton.click();
            loginAttempted = true;
          } else if (emailInput.form) {
            emailInput.form.submit();
            loginAttempted = true;
          }
        }, 500);
      }, 500);
      return true;
    }
    return false;
  }
  
  function attemptAutoLogin() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptAutoLogin);
      return;
    }
    
    if (loginAttempted && step >= 2) return;
    
    if (document.body?.textContent?.toLowerCase().includes('sign out') ||
        document.body?.textContent?.toLowerCase().includes('logout')) {
      return;
    }
    
    if (isGoogleLogin()) {
      if (handleGoogleLogin()) return;
    }
    
    if (isGoogleOAuth() && !loginAttempted) {
      if (clickGoogleSignIn()) {
        loginAttempted = true;
        setTimeout(() => {
          if (isGoogleLogin()) handleGoogleLogin();
        }, 2000);
        return;
      }
    }
    
    if (handleGenericLogin()) return;
  }
  
  attemptAutoLogin();
  setTimeout(attemptAutoLogin, 1000);
  setTimeout(attemptAutoLogin, 3000);
  
  const observer = new MutationObserver(() => {
    if (!loginAttempted || step < 2) attemptAutoLogin();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  setTimeout(() => observer.disconnect(), 15000);
})();
</script>`

      // Inject script before closing body tag
      if (processedContent.includes('</body>')) {
        processedContent = processedContent.replace('</body>', autoLoginScript + '</body>');
      } else if (processedContent.includes('</html>')) {
        processedContent = processedContent.replace('</html>', autoLoginScript + '</html>');
      } else {
        processedContent += autoLoginScript;
      }

      // Build response headers WITHOUT CSP restrictions
      const responseHeaders = new Headers()
      
      // Copy safe headers from original response
      const safeToCopy = ['content-type', 'content-language', 'cache-control']
      safeToCopy.forEach(header => {
        const value = response.headers.get(header)
        if (value) responseHeaders.set(header, value)
      })

      // Set frame-friendly headers - this is the KEY difference from API routes
      responseHeaders.set('X-Frame-Options', 'ALLOWALL')
      responseHeaders.delete('Content-Security-Policy')
      responseHeaders.delete('X-Content-Security-Policy')
      responseHeaders.set('Content-Type', contentType)
      
      // Forward cookies
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        responseHeaders.set('Set-Cookie', setCookie)
      }

      return new NextResponse(processedContent, {
        status: 200,
        headers: responseHeaders,
      })
    } else {
      // For non-HTML content (CSS, JS, images), pass through with minimal processing
      const content = await response.arrayBuffer()
      
      const responseHeaders = new Headers()
      responseHeaders.set('Content-Type', contentType)
      responseHeaders.set('Cache-Control', 'public, max-age=31536000')
      responseHeaders.set('Access-Control-Allow-Origin', '*')
      
      return new NextResponse(content, {
        status: 200,
        headers: responseHeaders,
      })
    }
  } catch (error) {
    console.error('Edge proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

