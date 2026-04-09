import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { translateAndSpeak, generateSpeech } from '@/services/ttsService';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, language = 'en' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 4000 characters.' },
        { status: 400 }
      );
    }

    let audioBuffer: Buffer;

    if (language === 'en') {
      audioBuffer = await generateSpeech(text);
    } else {
      audioBuffer = await translateAndSpeak(text, language);
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
