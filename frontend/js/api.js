// API Helper Functions

async function apiRequest(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

async function apiUpload(url, formData) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
    }

    return response.json();
}

// Auth API
const authApi = {
    sendOTP: (phone) => apiRequest(API.AUTH.SEND_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone })
    }),

    verifyOTP: (phone, otp) => apiRequest(API.AUTH.VERIFY_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone, otp })
    }),

    getMe: () => apiRequest(API.AUTH.ME),

    logout: () => apiRequest(API.AUTH.LOGOUT, { method: 'POST' })
};

// Reports API
const reportsApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`${API.REPORTS.LIST}?${query}`);
    },

    upload: (formData) => apiUpload(API.REPORTS.UPLOAD, formData),

    get: (id) => apiRequest(API.REPORTS.GET(id)),

    delete: (id) => apiRequest(API.REPORTS.DELETE(id), { method: 'DELETE' }),

    getCategories: () => apiRequest(API.REPORTS.CATEGORIES)
};

// AI API
const aiApi = {
    explain: (reportId) => apiRequest(API.AI.EXPLAIN, {
        method: 'POST',
        body: JSON.stringify({ reportId })
    }),

    chat: (reportId, question, conversationHistory = []) => apiRequest(API.AI.CHAT, {
        method: 'POST',
        body: JSON.stringify({ reportId, question, conversationHistory })
    })
};
