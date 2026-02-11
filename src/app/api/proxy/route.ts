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

    // Auto-login credentials (from environment or defaults)
    const autoLoginEmail = process.env.AUTO_LOGIN_EMAIL || 'elevi.ed.tehn.eliade@gmail.com'
    const autoLoginPassword = process.env.AUTO_LOGIN_PASSWORD || 'Pereu@1973'

    // If it's HTML, rewrite URLs to go through our proxy and inject auto-login
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

      // Inject auto-login script before closing body tag
      const autoLoginScript = `
<script>
(function() {
  const email = ${JSON.stringify(autoLoginEmail)};
  const password = ${JSON.stringify(autoLoginPassword)};
  let loginAttempted = false;
  
  function attemptAutoLogin() {
    // Wait for page to be interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptAutoLogin);
      return;
    }

    // Prevent multiple attempts
    if (loginAttempted) return;
    
    // Function to find and fill login forms
    function fillLoginForm() {
      let filled = false;
      
      // Special handling for Google login
      const isGoogleLogin = window.location.hostname.includes('accounts.google.com') || 
                          window.location.hostname.includes('google.com');
      
      if (isGoogleLogin) {
        // Google uses identifier input first
        const identifierInput = document.querySelector('input[type="email"], input[name="identifier"]');
        if (identifierInput && !identifierInput.value) {
          identifierInput.value = email;
          identifierInput.dispatchEvent(new Event('input', { bubbles: true }));
          identifierInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Find and click Next button
          setTimeout(() => {
            const nextButton = Array.from(document.querySelectorAll('button, [role="button"]'))
              .find(btn => {
                const text = (btn.textContent || '').toLowerCase();
                return text.includes('next') || text.includes('continue') || text === '';
              });
            if (nextButton) {
              nextButton.click();
              loginAttempted = true;
            }
          }, 500);
          return true;
        }
        
        // Then password input appears
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput && !passwordInput.value) {
          passwordInput.value = password;
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          setTimeout(() => {
            const signInButton = Array.from(document.querySelectorAll('button, [role="button"]'))
              .find(btn => {
                const text = (btn.textContent || '').toLowerCase();
                return text.includes('sign in') || text.includes('next') || text === '';
              });
            if (signInButton) {
              signInButton.click();
              loginAttempted = true;
            }
          }, 500);
          return true;
        }
      }

      // Try to find email/username input by various selectors
      const emailSelectors = [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[name*="username" i]',
        'input[name*="user" i]',
        'input[id*="email" i]',
        'input[id*="username" i]',
        'input[id*="user" i]',
        'input[placeholder*="email" i]',
        'input[placeholder*="username" i]',
        'input[aria-label*="email" i]',
        'input[aria-label*="username" i]'
      ];

      // Try to find password input
      const passwordSelectors = [
        'input[type="password"]',
        'input[name*="password" i]',
        'input[name*="pass" i]',
        'input[id*="password" i]',
        'input[id*="pass" i]'
      ];

      let emailInput = null;
      let passwordInput = null;

      // Find email input
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

      // Find password input
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

      // Fill the form if both inputs found
      if (emailInput && passwordInput) {
        // Set values
        emailInput.value = email;
        passwordInput.value = password;

        // Trigger input events
        ['input', 'change', 'blur'].forEach(eventType => {
          emailInput.dispatchEvent(new Event(eventType, { bubbles: true }));
          passwordInput.dispatchEvent(new Event(eventType, { bubbles: true }));
        });

          // Try to find and click submit button
        setTimeout(() => {
          // Get all buttons and inputs
          const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], [role="button"]'));
          
          // Find submit button by text content or aria-label
          let submitButton = allButtons.find(btn => {
            if (!btn.offsetParent || btn.disabled) return false;
            const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
            return text.includes('sign in') || 
                   text.includes('log in') || 
                   text.includes('login') || 
                   text.includes('continue') || 
                   text.includes('next') ||
                   text.includes('submit') ||
                   btn.type === 'submit' ||
                   (btn.tagName === 'BUTTON' && !btn.type);
          });

          // If still not found, try form submit button
          if (!submitButton && emailInput.form) {
            submitButton = emailInput.form.querySelector('button[type="submit"], input[type="submit"]');
          }

          // If no button found, try to submit the form directly
          if (submitButton) {
            submitButton.click();
            filled = true;
          } else if (emailInput.form) {
            emailInput.form.submit();
            filled = true;
          } else {
            // Try pressing Enter on password field
            passwordInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            }));
            passwordInput.dispatchEvent(new KeyboardEvent('keypress', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            }));
            filled = true;
          }
        }, 500);

        return true;
      }

      return false;
    }

    // Try immediate fill
    if (fillLoginForm()) {
      return;
    }

    // If not found, try again after a delay (for dynamic content)
    setTimeout(() => {
      fillLoginForm();
    }, 1000);

    // Also watch for dynamically added forms
    const observer = new MutationObserver(() => {
      fillLoginForm();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Stop observing after 10 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }

  // Start auto-login
  attemptAutoLogin();
})();
</script>`

      // Inject script before closing body tag, or before closing head if no body
      if (processedContent.includes('</body>')) {
        processedContent = processedContent.replace('</body>', autoLoginScript + '</body>');
      } else if (processedContent.includes('</html>')) {
        processedContent = processedContent.replace('</html>', autoLoginScript + '</html>');
      } else {
        processedContent += autoLoginScript;
      }
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

