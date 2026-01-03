// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// API endpoints
const API = {
    AUTH: {
        SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
        VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
        ME: `${API_BASE_URL}/auth/me`,
        LOGOUT: `${API_BASE_URL}/auth/logout`
    },
    REPORTS: {
        LIST: `${API_BASE_URL}/reports`,
        UPLOAD: `${API_BASE_URL}/reports/upload`,
        GET: (id) => `${API_BASE_URL}/reports/${id}`,
        FILE: (id) => `${API_BASE_URL}/reports/${id}/file`,
        TEXT: (id) => `${API_BASE_URL}/reports/${id}/text`,
        DELETE: (id) => `${API_BASE_URL}/reports/${id}`,
        CATEGORIES: `${API_BASE_URL}/reports/categories`
    },
    AI: {
        EXPLAIN: `${API_BASE_URL}/ai/explain`,
        CHAT: `${API_BASE_URL}/ai/chat`
    }
};
