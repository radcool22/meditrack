import express from 'express';
import OpenAI from 'openai';
import { requireAuth } from '../middleware.js';
import { reportDb } from '../database.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF } from '../middleware.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System prompt for medical report explanations
const SYSTEM_PROMPT = `You are MediTrack, a specialized medical report assistant designed to help patients understand their medical reports through conversational interaction.

**Your Role:**
- Analyze medical reports, lab results, imaging summaries, and clinical documentation
- Translate complex medical terms and values into patient-friendly explanations
- Provide explanations for conditions, tests, and recommendations explicitly mentioned in the report
- Help patients understand individual test values or report sections when asked

**Critical Guidelines:**
- ONLY use information explicitly provided in the report
- ALWAYS cite exact test values, units, and reference ranges as shown in the report
- Quote any interpretation or comment section word-for-word if it exists
- NEVER provide or suggest diagnoses, risk categories, or stages of disease
- NEVER calculate values not listed in the report
- Avoid describing patterns unless the report explicitly states them

**Communication Style:**
- Be concise yet complete
- Use a calm, professional, and empathetic tone
- Structure responses: acknowledge question → cite data → quote interpretation → explain simply → clarify boundaries

**Always conclude with:**
"Please consult your healthcare provider to interpret these results in the context of your full medical history."`;

// All routes require authentication
router.use(requireAuth);

// Generate explanation for a report
router.post('/explain', async (req, res) => {
    try {
        const { reportId } = req.body;

        if (!reportId) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        // Get report
        const report = reportDb.findById(parseInt(reportId), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Extract text from report
        const filePath = join(__dirname, '..', report.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Report file not found' });
        }

        let reportText = '';

        if (report.file_type === 'application/pdf') {
            reportText = await extractTextFromPDF(filePath);
        } else {
            return res.status(400).json({ error: 'Image OCR not yet implemented. Please upload PDF reports.' });
        }

        if (!reportText.trim()) {
            return res.status(400).json({ error: 'Could not extract text from report' });
        }

        // Generate explanation using OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Please provide a comprehensive summary and explanation of this medical report in simple, patient-friendly language:\n\n${reportText.substring(0, 8000)}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        const explanation = completion.choices[0].message.content;

        res.json({
            explanation,
            reportTitle: report.title
        });
    } catch (error) {
        console.error('AI explanation error:', error);
        res.status(500).json({ error: 'Failed to generate explanation' });
    }
});

// Chat about a report (follow-up questions)
router.post('/chat', async (req, res) => {
    try {
        const { reportId, question, conversationHistory } = req.body;

        if (!reportId || !question) {
            return res.status(400).json({ error: 'Report ID and question are required' });
        }

        // Get report
        const report = reportDb.findById(parseInt(reportId), req.session.userId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Extract text from report
        const filePath = join(__dirname, '..', report.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Report file not found' });
        }

        let reportText = '';

        if (report.file_type === 'application/pdf') {
            reportText = await extractTextFromPDF(filePath);
        } else {
            return res.status(400).json({ error: 'Image OCR not yet implemented. Please upload PDF reports.' });
        }

        if (!reportText.trim()) {
            return res.status(400).json({ error: 'Could not extract text from report' });
        }

        // Build messages array
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + `\n\nReport content:\n${reportText.substring(0, 6000)}` }
        ];

        // Add conversation history if provided
        if (conversationHistory && Array.isArray(conversationHistory)) {
            messages.push(...conversationHistory);
        }

        // Add current question
        messages.push({ role: 'user', content: question });

        // Generate response
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            temperature: 0.7,
            max_tokens: 800
        });

        const answer = completion.choices[0].message.content;

        res.json({
            answer,
            reportTitle: report.title
        });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process question' });
    }
});

export default router;
