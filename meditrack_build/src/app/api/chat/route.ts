import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getReportById,
  getChatMessages,
  saveChatMessage,
  verifyReportOwnership,
} from '@/services/reportService';
import { chatWithReport } from '@/services/aiService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      );
    }

    const isOwner = await verifyReportOwnership(reportId, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await getChatMessages(reportId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, message } = body;

    if (!reportId || !message) {
      return NextResponse.json(
        { error: 'reportId and message are required' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be a string under 2000 characters' },
        { status: 400 }
      );
    }

    const isOwner = await verifyReportOwnership(reportId, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const report = await getReportById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!report.analysis || !report.extracted_text) {
      return NextResponse.json(
        { error: 'Report must be analyzed before chatting' },
        { status: 400 }
      );
    }

    // Save user message
    await saveChatMessage(reportId, 'user', message);

    // Get chat history
    const history = await getChatMessages(reportId);
    const chatHistory = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await chatWithReport(
      report.extracted_text,
      report.analysis.summary,
      chatHistory.slice(0, -1), // exclude the message we just saved
      message
    );

    // Save assistant response
    const savedMessage = await saveChatMessage(reportId, 'assistant', aiResponse);

    return NextResponse.json({
      message: savedMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
