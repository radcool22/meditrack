// Dashboard Logic

let allReports = [];
let currentFilters = {
    search: '',
    category: '',
    sortBy: 'created_at',
    order: 'DESC'
};

function initDashboard() {
    const logoutBtn = document.getElementById('logout-btn');
    const uploadBtn = document.getElementById('upload-report-btn');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    logoutBtn?.addEventListener('click', handleLogout);
    uploadBtn?.addEventListener('click', () => {
        document.getElementById('upload-modal').classList.add('active');
    });

    // Search and filter
    searchInput?.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        filterAndDisplayReports();
    });

    categoryFilter?.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        filterAndDisplayReports();
    });

    sortSelect?.addEventListener('change', (e) => {
        const [sortBy, order] = e.target.value.split('-');
        currentFilters.sortBy = sortBy;
        currentFilters.order = order;
        loadReports();
    });
}

async function loadDashboard() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        document.getElementById('user-email').textContent = user.phone || user.email;
    }

    await loadCategories();
    await loadReports();
}

async function loadCategories() {
    try {
        const { categories } = await reportsApi.getCategories();
        const categoryFilter = document.getElementById('category-filter');

        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadReports() {
    const loading = document.getElementById('dashboard-loading');
    const reportsGrid = document.getElementById('reports-grid');
    const emptyState = document.getElementById('empty-state');

    try {
        loading.classList.remove('hidden');
        reportsGrid.innerHTML = '';

        const { reports } = await reportsApi.list({
            sortBy: currentFilters.sortBy,
            order: currentFilters.order
        });

        allReports = reports;
        filterAndDisplayReports();
    } catch (error) {
        console.error('Failed to load reports:', error);
        reportsGrid.innerHTML = '<p class="error-message">Failed to load reports. Please try again.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

function filterAndDisplayReports() {
    const reportsGrid = document.getElementById('reports-grid');
    const emptyState = document.getElementById('empty-state');

    let filtered = allReports;

    // Apply search filter
    if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        filtered = filtered.filter(report =>
            report.title.toLowerCase().includes(searchLower) ||
            (report.source && report.source.toLowerCase().includes(searchLower))
        );
    }

    // Apply category filter
    if (currentFilters.category) {
        filtered = filtered.filter(report => report.category === currentFilters.category);
    }

    // Display reports
    if (filtered.length === 0) {
        reportsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        reportsGrid.innerHTML = filtered.map(report => createReportCard(report)).join('');

        // Add click listeners
        document.querySelectorAll('.report-card').forEach(card => {
            card.addEventListener('click', () => {
                const reportId = card.dataset.reportId;
                viewReport(reportId);
            });
        });
    }
}

function createReportCard(report) {
    const date = report.report_date ? new Date(report.report_date).toLocaleDateString() : 'No date';
    const category = report.category || 'Uncategorized';
    const source = report.source || 'Unknown source';

    return `
    <div class="report-card fade-in" data-report-id="${report.id}">
      <div class="report-card-header">
        <h3>${escapeHtml(report.title)}</h3>
        <span class="badge">${escapeHtml(category)}</span>
      </div>
      <div class="report-card-meta">
        <p>📅 ${date}</p>
        <p>🏥 ${escapeHtml(source)}</p>
        <p style="color: var(--text-light); font-size: 0.85rem;">Uploaded ${formatRelativeTime(report.created_at)}</p>
      </div>
    </div>
  `;
}

function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
