// Authentication Logic

let currentPhone = '';

// Initialize auth listeners
function initAuth() {
    const navLoginBtn = document.getElementById('nav-login-btn');
    const heroCTABtn = document.getElementById('hero-cta-btn');
    const sendOTPBtn = document.getElementById('send-otp-btn');
    const verifyOTPBtn = document.getElementById('verify-otp-btn');
    const resendOTPBtn = document.getElementById('resend-otp-btn');
    const phoneInput = document.getElementById('email-input'); // Reusing ID
    const otpInput = document.getElementById('otp-input');

    navLoginBtn?.addEventListener('click', () => showPage('login-page'));
    heroCTABtn?.addEventListener('click', () => showPage('login-page'));

    sendOTPBtn?.addEventListener('click', handleSendOTP);
    verifyOTPBtn?.addEventListener('click', handleVerifyOTP);
    resendOTPBtn?.addEventListener('click', handleSendOTP);

    // Allow Enter key to submit
    phoneInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendOTP();
    });

    otpInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleVerifyOTP();
    });
}

async function handleSendOTP() {
    const phoneInput = document.getElementById('email-input'); // Reusing ID
    const phone = phoneInput.value.trim();
    const errorDiv = document.getElementById('email-error');
    const loading = document.getElementById('auth-loading');

    errorDiv.textContent = '';

    if (!phone) {
        errorDiv.textContent = 'Please enter your phone number';
        return;
    }

    // Basic phone validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        errorDiv.textContent = 'Please enter a valid phone number with country code (e.g., +1234567890)';
        return;
    }

    try {
        loading.classList.remove('hidden');
        await authApi.sendOTP(phone);

        currentPhone = phone;
        document.getElementById('otp-email').textContent = phone;
        document.getElementById('email-form').classList.add('hidden');
        document.getElementById('otp-form').classList.remove('hidden');

        // Focus OTP input
        setTimeout(() => {
            document.getElementById('otp-input').focus();
        }, 100);
    } catch (error) {
        errorDiv.textContent = error.message || 'Failed to send verification code';
    } finally {
        loading.classList.add('hidden');
    }
}

async function handleVerifyOTP() {
    const otpInput = document.getElementById('otp-input');
    const otp = otpInput.value.trim();
    const errorDiv = document.getElementById('otp-error');
    const loading = document.getElementById('auth-loading');

    errorDiv.textContent = '';

    if (!otp || otp.length !== 6) {
        errorDiv.textContent = 'Please enter the 6-digit code';
        return;
    }

    try {
        loading.classList.remove('hidden');
        const result = await authApi.verifyOTP(currentPhone, otp);

        // Store user info
        sessionStorage.setItem('user', JSON.stringify(result.user));

        // Redirect to dashboard
        showPage('dashboard-page');
        loadDashboard();
    } catch (error) {
        errorDiv.textContent = error.message || 'Invalid verification code';
        otpInput.value = '';
        otpInput.focus();
    } finally {
        loading.classList.add('hidden');
    }
}

async function checkAuth() {
    try {
        const user = await authApi.getMe();
        sessionStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        sessionStorage.removeItem('user');
        return null;
    }
}

async function handleLogout() {
    try {
        await authApi.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        sessionStorage.removeItem('user');
        showPage('landing-page');

        // Reset forms
        document.getElementById('email-form').classList.remove('hidden');
        document.getElementById('otp-form').classList.add('hidden');
        document.getElementById('email-input').value = '';
        document.getElementById('otp-input').value = '';
    }
}
