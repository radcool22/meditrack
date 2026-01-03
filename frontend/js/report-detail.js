// Report Detail Logic

let currentReport = null;
let conversationHistory = [];

function initReportDetail() {
    const backBtn = document.getElementById('back-to-dashboard-btn');
    const deleteBtn = document.getElementById('delete-report-btn');
    const explainBtn = document.getElementById('get-explanation-btn');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');

    backBtn?.addEventListener('click', () => {
        showPage('dashboard-page');
        loadDashboard();
    });

    deleteBtn?.addEventListener('click', handleDeleteReport);
    explainBtn?.addEventListener('click', handleGetExplanation);
    sendChatBtn?.addEventListener('click', handleSendChat);

    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendChat();
    });
}

async function viewReport(reportId) {
    const loading = document.getElementById('ai-loading');

    try {
        // Show report detail page
        showPage('report-detail-page');

        // Reset state
        conversationHistory = [];
        document.getElementById('explanation-container').classList.add('hidden');
        document.getElementById('chat-container').classList.add('hidden');
        document.getElementById('chat-messages').innerHTML = '';

        // Load report data
        const { report } = await reportsApi.get(reportId);
        currentReport = report;

        // Display report metadata
        document.getElementById('report-title').textContent = report.title;

        const categoryBadge = document.getElementById('report-category');
        categoryBadge.textContent = report.category || 'Uncategorized';

        const reportDate = document.getElementById('report-date');
        reportDate.textContent = report.report_date
            ? `📅 ${new Date(report.report_date).toLocaleDateString()}`
            : '';

        const reportSource = document.getElementById('report-source');
        reportSource.textContent = report.source ? `🏥 ${report.source}` : '';

        // Display PDF
        const pdfViewer = document.getElementById('pdf-viewer');
        pdfViewer.src = API.REPORTS.FILE(reportId);

    } catch (error) {
        console.error('Failed to load report:', error);
        alert('Failed to load report. Please try again.');
        showPage('dashboard-page');
    }
}

async function handleGetExplanation() {
    if (!currentReport) return;

    const loading = document.getElementById('ai-loading');
    const explainBtn = document.getElementById('get-explanation-btn');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationContent = document.getElementById('explanation-content');

    try {
        loading.classList.remove('hidden');
        explainBtn.disabled = true;

        const { explanation } = await aiApi.explain(currentReport.id);

        explanationContent.textContent = explanation;
        explanationContainer.classList.remove('hidden');

        // Show chat interface
        document.getElementById('chat-container').classList.remove('hidden');

        // Scroll to explanation
        explanationContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Failed to get explanation:', error);
        alert('Failed to generate explanation. Please try again.');
    } finally {
        loading.classList.add('hidden');
        explainBtn.disabled = false;
    }
}

async function handleSendChat() {
    if (!currentReport) return;

    const chatInput = document.getElementById('chat-input');
    const question = chatInput.value.trim();

    if (!question) return;

    const chatMessages = document.getElementById('chat-messages');
    const loading = document.getElementById('ai-loading');

    try {
        // Add user message
        addChatMessage('user', question);
        chatInput.value = '';
        chatInput.disabled = true;

        // Add to conversation history
        conversationHistory.push({ role: 'user', content: question });

        loading.classList.remove('hidden');

        const { answer } = await aiApi.chat(currentReport.id, question, conversationHistory);

        // Add AI response
        addChatMessage('ai', answer);

        // Add to conversation history
        conversationHistory.push({ role: 'assistant', content: answer });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Failed to send chat:', error);
        addChatMessage('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
        loading.classList.add('hidden');
        chatInput.disabled = false;
        chatInput.focus();
    }
}

function addChatMessage(type, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type} fade-in`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
}

async function handleDeleteReport() {
    if (!currentReport) return;

    const confirmed = confirm(`Are you sure you want to delete "${currentReport.title}"? This action cannot be undone.`);

    if (!confirmed) return;

    try {
        await reportsApi.delete(currentReport.id);
        alert('Report deleted successfully');
        showPage('dashboard-page');
        loadDashboard();
    } catch (error) {
        console.error('Failed to delete report:', error);
        alert('Failed to delete report. Please try again.');
    }
}
