// Upload Modal Logic

function initUpload() {
    const uploadModal = document.getElementById('upload-modal');
    const closeModalBtn = document.getElementById('close-upload-modal');
    const cancelBtn = document.getElementById('cancel-upload-btn');
    const uploadForm = document.getElementById('upload-form');

    closeModalBtn?.addEventListener('click', closeUploadModal);
    cancelBtn?.addEventListener('click', closeUploadModal);

    uploadForm?.addEventListener('submit', handleUploadSubmit);

    // Close modal on outside click
    uploadModal?.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });
}

function closeUploadModal() {
    const uploadModal = document.getElementById('upload-modal');
    const uploadForm = document.getElementById('upload-form');

    uploadModal.classList.remove('active');
    uploadForm.reset();
    document.getElementById('upload-error').textContent = '';
}

async function handleUploadSubmit(e) {
    e.preventDefault();

    const fileInput = document.getElementById('file-input');
    const titleInput = document.getElementById('title-input');
    const categoryInput = document.getElementById('category-input');
    const dateInput = document.getElementById('date-input');
    const sourceInput = document.getElementById('source-input');
    const errorDiv = document.getElementById('upload-error');
    const loading = document.getElementById('upload-loading');

    errorDiv.textContent = '';

    // Validate file
    if (!fileInput.files || fileInput.files.length === 0) {
        errorDiv.textContent = 'Please select a file';
        return;
    }

    const file = fileInput.files[0];

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        errorDiv.textContent = 'File size must be less than 10MB';
        return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        errorDiv.textContent = 'Only PDF and image files (JPEG, PNG) are allowed';
        return;
    }

    // Validate title
    if (!titleInput.value.trim()) {
        errorDiv.textContent = 'Please enter a report title';
        return;
    }

    try {
        loading.classList.remove('hidden');

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', titleInput.value.trim());

        if (categoryInput.value) {
            formData.append('category', categoryInput.value);
        }

        if (dateInput.value) {
            formData.append('reportDate', dateInput.value);
        }

        if (sourceInput.value.trim()) {
            formData.append('source', sourceInput.value.trim());
        }

        // Upload report
        await reportsApi.upload(formData);

        // Close modal and reload dashboard
        closeUploadModal();
        await loadReports();

        // Show success message
        alert('Report uploaded successfully!');

    } catch (error) {
        console.error('Upload error:', error);
        errorDiv.textContent = error.message || 'Failed to upload report. Please try again.';
    } finally {
        loading.classList.add('hidden');
    }
}
