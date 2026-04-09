import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getReportById,
  downloadReportFile,
  updateReport,
  verifyReportOwnership,
} from '@/services/reportService';
import { performOCR } from '@/services/ocrService';
import { analyzeReport } from '@/services/aiService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const isOwner = await verifyReportOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if already analyzed
    if (report.analysis) {
      return NextResponse.json({
        report,
        message: 'Report already analyzed',
      });
    }

    // Step 1: Download the file
    const fileBuffer = await downloadReportFile(report.file_url);

    // Step 2: OCR - Extract text
    const extractedText = await performOCR(fileBuffer, report.file_type);

    // Step 3: AI Analysis
    const analysis = await analyzeReport(extractedText);

    // Step 4: Save results
    const updatedReport = await updateReport(id, {
      extracted_text: extractedText,
      analysis,
      report_type: analysis.key_findings.length > 0 ? 'medical_report' : 'unknown',
    });

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze report. Please try again.' },
      { status: 500 }
    );
  }
}
