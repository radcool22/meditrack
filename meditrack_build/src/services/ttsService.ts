import { openai } from '@/lib/openai';

export async function generateSpeech(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
    response_format: 'mp3',
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const languageNames: Record<string, string> = {
    hi: 'Hindi (use Devanagari script)',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi',
    ur: 'Urdu',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    zh: 'Chinese (Simplified)',
    ja: 'Japanese',
    ar: 'Arabic',
  };

  const langName = languageNames[targetLanguage] || targetLanguage;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Translate the following medical report summary to ${langName}. Keep it simple, clear, and easy to understand. Maintain all medical values and numbers as-is. Do not add any explanation or notes — output only the translation.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || text;
}

export async function translateAndSpeak(
  text: string,
  targetLanguage: string = 'hi'
): Promise<Buffer> {
  let textToSpeak = text;

  if (targetLanguage !== 'en') {
    textToSpeak = await translateText(text, targetLanguage);
  }

  return generateSpeech(textToSpeak);
}
