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

    // Auto-login credentials
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

      // Inject comprehensive auto-login script
      const autoLoginScript = `
<script>
(function() {
  const email = ${JSON.stringify(autoLoginEmail)};
  const password = ${JSON.stringify(autoLoginPassword)};
  let loginAttempted = false;
  let verificationAttempted = false;
  let step = 0; // Track multi-step login process
  
  // Detect if we're on a Google login page
  function isGoogleLogin() {
    const hostname = window.location.hostname;
    return hostname.includes('accounts.google.com') || 
           hostname.includes('google.com') ||
           hostname.includes('gstatic.com');
  }
  
  // Detect if we're on a platform that uses Google OAuth
  function isGoogleOAuth() {
    const hostname = window.location.hostname;
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    return bodyText.includes('sign in with google') ||
           bodyText.includes('continue with google') ||
           bodyText.includes('google account') ||
           document.querySelector('[data-provider="google"]') !== null ||
           document.querySelector('button[aria-label*="Google"]') !== null;
  }
  
  // Find and click Google sign-in button
  function clickGoogleSignIn() {
    // Look for various Google sign-in button patterns
    const selectors = [
      'button[aria-label*="Google" i]',
      'button:has-text("Google")',
      '[data-provider="google"]',
      'button:contains("Sign in with Google")',
      'button:contains("Continue with Google")',
      '.google-signin',
      '#google-signin',
      '[class*="google"][class*="button"]',
      '[class*="google"][class*="sign"]',
    ];
    
    for (const selector of selectors) {
      try {
        const buttons = Array.from(document.querySelectorAll(selector));
        for (const btn of buttons) {
          if (btn.offsetParent !== null && !btn.disabled) {
            btn.click();
            return true;
          }
        }
      } catch (e) {}
    }
    
    // Also try finding by text content
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
  
  // Handle Google account login flow
  function handleGoogleLogin() {
    if (step === 0) {
      // Step 1: Enter email/identifier
      const identifierInput = document.querySelector('input[type="email"], input[name="identifier"], input[id="identifierId"], input[aria-label*="email" i], input[aria-label*="phone" i]');
      if (identifierInput && !identifierInput.value) {
        identifierInput.focus();
        identifierInput.value = email;
        
        // Trigger all necessary events for Edge
        ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
          identifierInput.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
        
        // Wait a bit then click Next
        setTimeout(() => {
          const nextButton = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              const id = (btn.id || '').toLowerCase();
              return text.includes('next') || 
                     text.includes('continue') || 
                     id.includes('next') ||
                     (btn.type === 'button' && !text);
            });
          
          if (nextButton) {
            nextButton.click();
            step = 1;
            loginAttempted = true;
          } else {
            // Try pressing Enter
            identifierInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              bubbles: true,
              cancelable: true
            }));
            step = 1;
          }
        }, 800);
        return true;
      }
    }
    
    if (step === 1) {
      // Step 2: Check if password field appeared or if verification is needed
      const passwordInput = document.querySelector('input[type="password"], input[name="password"], input[id="password"], input[aria-label*="password" i]');
      const verificationInput = document.querySelector('input[type="text"][name*="code"], input[type="text"][id*="code"], input[aria-label*="code" i], input[aria-label*="verification" i]');
      
      // If verification code is needed, we can't auto-fill it
      if (verificationInput) {
        console.log('Email verification required - cannot auto-fill');
        verificationAttempted = true;
        return false;
      }
      
      // If password field exists, fill it
      if (passwordInput && !passwordInput.value) {
        passwordInput.focus();
        passwordInput.value = password;
        
        // Trigger events
        ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
          passwordInput.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
        
        // Wait then click Sign in
        setTimeout(() => {
          const signInButton = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              const id = (btn.id || '').toLowerCase();
              return text.includes('sign in') || 
                     text.includes('next') || 
                     text.includes('continue') ||
                     id.includes('sign') ||
                     btn.type === 'submit';
            });
          
          if (signInButton) {
            signInButton.click();
            step = 2;
          } else {
            // Try pressing Enter
            passwordInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              bubbles: true,
              cancelable: true
            }));
            step = 2;
          }
        }, 800);
        return true;
      }
    }
    
    return false;
  }
  
  // Handle generic login forms
  function handleGenericLogin() {
    // Try to find email/username input
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
          // Find and click submit button
          const submitButton = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'))
            .find(btn => {
              if (!btn.offsetParent || btn.disabled) return false;
              const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
              return text.includes('sign in') || 
                     text.includes('log in') || 
                     text.includes('login') || 
                     text.includes('continue') ||
                     btn.type === 'submit';
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
  
  // Main auto-login function
  function attemptAutoLogin() {
    // Wait for page to be interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptAutoLogin);
      return;
    }
    
    // Prevent multiple attempts
    if (loginAttempted && step >= 2) return;
    if (verificationAttempted) return;
    
    // Check if already logged in
    if (document.body?.textContent?.toLowerCase().includes('sign out') ||
        document.body?.textContent?.toLowerCase().includes('logout') ||
        document.querySelector('[aria-label*="account" i]') !== null) {
      return; // Already logged in
    }
    
    // Priority 1: If on Google login page, use Google flow
    if (isGoogleLogin()) {
      if (handleGoogleLogin()) {
        return;
      }
    }
    
    // Priority 2: If platform uses Google OAuth, click Google button first
    if (isGoogleOAuth() && !loginAttempted) {
      if (clickGoogleSignIn()) {
        loginAttempted = true;
        // Wait for redirect to Google
        setTimeout(() => {
          if (isGoogleLogin()) {
            handleGoogleLogin();
          }
        }, 2000);
        return;
      }
    }
    
    // Priority 3: Try generic login form
    if (handleGenericLogin()) {
      return;
    }
  }
  
  // Start auto-login immediately
  attemptAutoLogin();
  
  // Also try after delays (for dynamic content)
  setTimeout(attemptAutoLogin, 1000);
  setTimeout(attemptAutoLogin, 3000);
  
  // Watch for dynamically added forms (especially for Edge)
  const observer = new MutationObserver(() => {
    if (!loginAttempted || step < 2) {
      attemptAutoLogin();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // Stop observing after 15 seconds
  setTimeout(() => {
    observer.disconnect();
  }, 15000);
  
  // Handle navigation events (for Edge iframe)
  window.addEventListener('load', attemptAutoLogin);
  window.addEventListener('pageshow', attemptAutoLogin);
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

