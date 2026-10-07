/**
 * register.js - Controller for register.html
 * Handles new account registration, password strength validation, confirm match, and JWT storage.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[📝 Register Page] Page loaded successfully.');
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('[🔑 Session] Existing auth token found. Verifying session...');
    verifySession(token);
  } else {
    console.log('[🔓 Session] No active session detected. Awaiting user registration.');
  }
});

/**
 * Handle Register Form Submit
 */
async function handleRegister(event) {
  event.preventDefault();
  hideAlert();

  const fullname = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  const submitBtn = document.getElementById('registerSubmitBtn');

  console.log(`[📤 Register] Attempting registration for: ${fullname} (${email})`);

  if (!agreeTerms) {
    console.warn('[⚠️ Validation] User has not agreed to Terms & Privacy Policy.');
    showAlert('error', 'Please agree to the Terms & Privacy Policy to proceed.');
    return;
  }

  if (password !== confirmPassword) {
    console.warn('[⚠️ Validation] Passwords do not match.');
    showAlert('error', 'Passwords do not match. Please re-enter.');
    return;
  }

  if (password.length < 6) {
    console.warn('[⚠️ Validation] Password too short (less than 6 characters).');
    showAlert('error', 'Password must be at least 6 characters long.');
    return;
  }

  console.log('[✅ Validation] All client-side validations passed. Sending to server...');
  setButtonLoading(submitBtn, true);

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[❌ Registration Failed] Server responded with status ${response.status}: ${data.message}`);
      throw new Error(data.message || 'Registration failed.');
    }

    // Save JWT Token & User Data
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    console.log(`[✅ Registration Success] Account created for "${data.user.fullname}". Token saved.`);
    console.log(`[🔀 Redirect] Navigating to dashboard in 700ms...`);

    showAlert('success', 'Account created successfully! Redirecting...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);

  } catch (error) {
    console.error(`[❌ Registration Error] ${error.message}`);
    showAlert('error', error.message || 'Registration failed. Please check your details.');

    const authCard = document.getElementById('authCard');
    if (authCard) {
      authCard.classList.remove('shake-anim');
      void authCard.offsetWidth;
      authCard.classList.add('shake-anim');
      console.log('[🔔 UI] Shake animation triggered on auth card.');
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Real-time Password Strength Meter
 */
function checkPasswordStrength(password) {
  const bar = document.getElementById('strengthBar');
  const text = document.getElementById('strengthText');
  if (!bar || !text) return;

  let score = 0;
  if (!password) {
    bar.style.width = '0%';
    text.textContent = 'Password must be at least 6 characters';
    text.style.color = 'var(--text-dim)';
    console.log('[🔒 Password Strength] Empty — awaiting input.');
    return;
  }

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    bar.style.width = '25%';
    bar.style.backgroundColor = '#555555';
    text.textContent = 'Weak password (add numbers & symbols)';
    text.style.color = '#888888';
    console.log('[🔒 Password Strength] Weak (score: ' + score + '/5)');
  } else if (score <= 3) {
    bar.style.width = '60%';
    bar.style.backgroundColor = '#999999';
    text.textContent = 'Moderate password strength';
    text.style.color = '#aaaaaa';
    console.log('[🔒 Password Strength] Moderate (score: ' + score + '/5)');
  } else {
    bar.style.width = '100%';
    bar.style.backgroundColor = '#ffffff';
    text.textContent = 'Strong & secure password!';
    text.style.color = '#ffffff';
    console.log('[🔒 Password Strength] Strong (score: ' + score + '/5)');
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
  console.log(`[👁️ Password] Visibility toggled for "${inputId}" to: ${isPassword ? 'visible' : 'hidden'}`);

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
 * Verify session
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
      console.log('[⚠️ Session] Token expired or invalid. Staying on register page.');
    }
  } catch (e) {
    console.error('[❌ Session] Verification failed:', e.message);
  }
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
