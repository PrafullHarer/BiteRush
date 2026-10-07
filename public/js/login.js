/**
 * login.js - Controller for login.html
 * Handles user login form submission, input validation, JWT token storage, and redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[🔐 Login Page] Page loaded successfully.');

  // If already logged in, redirect to dashboard
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('[🔑 Session] Existing auth token found. Verifying session...');
    verifySession(token);
  } else {
    console.log('[🔓 Session] No active session detected. Awaiting user login.');
  }

  // Clear error highlight on typing
  const inputs = document.querySelectorAll('#loginEmail, #loginPassword');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      console.log(`[⌨️ Input] User typing in: ${input.id}`);
      document.querySelectorAll('.input-wrapper').forEach(el => el.classList.remove('has-error'));
      hideAlert();
    });
  });
});

/**
 * Handle Login Form Submit
 */
async function handleLogin(event) {
  event.preventDefault();
  hideAlert();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginSubmitBtn');

  console.log(`[📤 Login] Attempting login for email: ${email}`);

  setButtonLoading(submitBtn, true);

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[❌ Login Failed] Server responded with status ${response.status}: ${data.message}`);
      throw new Error(data.message || 'Invalid email or password. Please try again.');
    }

    // Save JWT Token & User Data
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    console.log(`[✅ Login Success] User "${data.user.fullname}" authenticated. Token saved.`);
    console.log(`[🔀 Redirect] Navigating to dashboard in 700ms...`);

    showAlert('success', 'Login successful! Redirecting to dashboard...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);

  } catch (error) {
    console.error(`[❌ Login Error] ${error.message}`);

    // Show prominent error message
    showAlert('error', error.message || 'Invalid email or password. Please check your credentials.');

    // Shake the auth card for visual feedback
    const authCard = document.getElementById('authCard');
    if (authCard) {
      authCard.classList.remove('shake-anim');
      void authCard.offsetWidth; // trigger reflow
      authCard.classList.add('shake-anim');
      console.log('[🔔 UI] Shake animation triggered on auth card.');
    }

    // Highlight inputs and focus password
    document.querySelectorAll('.input-wrapper').forEach(el => el.classList.add('has-error'));
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Toggle Password Visibility (Eye Icon)
 */
function togglePasswordVisibility(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  console.log(`[👁️ Password] Visibility toggled to: ${isPassword ? 'visible' : 'hidden'}`);

  btnElement.innerHTML = isPassword
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
       </svg>`;
}

/**
 * Verify session if token exists
 */
async function verifySession(token) {
  try {
    const response = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      console.log('[✅ Session] Valid session found. Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    } else {
      console.log('[⚠️ Session] Token expired or invalid. Staying on login page.');
    }
  } catch (e) {
    console.error('[❌ Session] Verification failed:', e.message);
  }
}

/**
 * Forgot password handler
 */
function handleForgotPassword(event) {
  event.preventDefault();
  console.log('[📧 Forgot Password] Password reset requested.');
  showAlert('error', 'Password reset instructions will be emailed if account exists.');
}

/**
 * Display Alert Messages (Success / Error)
 */
function showAlert(type, message) {
  const alertBox = document.getElementById('alertBox');
  const alertMessage = document.getElementById('alertMessage');
  const alertIcon = document.getElementById('alertIcon');

  if (!alertBox || !alertMessage || !alertIcon) return;

  alertBox.className = `alert-box ${type}`;
  alertMessage.textContent = message;

  alertIcon.innerHTML = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  alertBox.classList.remove('hidden');
  console.log(`[🔔 Alert] ${type.toUpperCase()}: ${message}`);
}

/**
 * Hide Alert Box
 */
function hideAlert() {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) alertBox.classList.add('hidden');
}

/**
 * Toggle Button Loading State
 */
function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  const textSpan = btn.querySelector('.btn-text');
  const loaderSpan = btn.querySelector('.btn-loader');

  if (isLoading) {
    btn.disabled = true;
    if (textSpan) textSpan.classList.add('hidden');
    if (loaderSpan) loaderSpan.classList.remove('hidden');
    console.log('[⏳ UI] Submit button set to loading state.');
  } else {
    btn.disabled = false;
    if (textSpan) textSpan.classList.remove('hidden');
    if (loaderSpan) loaderSpan.classList.add('hidden');
    console.log('[✅ UI] Submit button loading state cleared.');
  }
}
