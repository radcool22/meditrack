// Main Application Logic

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Initialize app
async function initApp() {
    // Initialize all modules
    initAuth();
    initDashboard();
    initReportDetail();
    initUpload();

    // Check if user is already authenticated
    const user = await checkAuth();

    if (user) {
        // User is authenticated, show dashboard
        showPage('dashboard-page');
        loadDashboard();
    } else {
        // Show landing page
        showPage('landing-page');
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
