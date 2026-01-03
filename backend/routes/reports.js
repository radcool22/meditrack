import express from 'express';
import { reportDb } from '../database.js';
import { requireAuth, upload, extractTextFromPDF } from '../middleware.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Upload new report
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, category, reportDate, source } = req.body;

        if (!title) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Title is required' });
        }

        // Store relative path from backend directory
        const relativePath = join('uploads', req.session.userId.toString(), req.file.filename);

        const reportId = reportDb.create(
            req.session.userId,
            title,
            category || null,
            reportDate || null,
            source || null,
            relativePath,
            req.file.mimetype
        );

        const report = reportDb.findById(reportId, req.session.userId);

        res.status(201).json({
            message: 'Report uploaded successfully',
            report
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up file if error occurs
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        }
        res.status(500).json({ error: 'Failed to upload report' });
    }
});

// Get all reports for current user
router.get('/', (req, res) => {
    try {
        const { search, category, sortBy, order } = req.query;

        const reports = reportDb.findByUserId(
            req.session.userId,
            search || '',
            category || '',
            sortBy || 'created_at',
            order || 'DESC'
        );

        res.json({ reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Get categories for current user
router.get('/categories', (req, res) => {
    try {
        const categories = reportDb.getCategories(req.session.userId);
        res.json({ categories: categories.map(c => c.category) });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get specific report
router.get('/:id', (req, res) => {
    try {
        const report = reportDb.findById(parseInt(req.params.id), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Serve report file
router.get('/:id/file', (req, res) => {
    try {
        const report = reportDb.findById(parseInt(req.params.id), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const filePath = join(__dirname, '..', report.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Serve file error:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
});

// Extract text from report (for AI processing)
router.get('/:id/text', async (req, res) => {
    try {
        const report = reportDb.findById(parseInt(req.params.id), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const filePath = join(__dirname, '..', report.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        let text = '';

        // Extract text from PDF
        if (report.file_type === 'application/pdf') {
            text = await extractTextFromPDF(filePath);
        } else {
            // For images, we'd need OCR - for now return empty
            text = '[Image file - OCR not yet implemented]';
        }

        res.json({ text });
    } catch (error) {
        console.error('Extract text error:', error);
        res.status(500).json({ error: 'Failed to extract text' });
    }
});

// Delete report
router.delete('/:id', (req, res) => {
    try {
        const report = reportDb.findById(parseInt(req.params.id), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Delete file
        const filePath = join(__dirname, '..', report.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        reportDb.delete(parseInt(req.params.id), req.session.userId);

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

export default router;
