import { openai } from '@/lib/openai';
import { sanitizeText } from '@/lib/utils';
import pdf from 'pdf-parse';

export async function extractTextFromImage(base64Data: string, mimeType: string): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract ALL text from this medical report image. Preserve the structure including headers, values, reference ranges, and units. Maintain table formats where possible. Output only the extracted text, nothing else.',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl, detail: 'high' },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content || '';
  return sanitizeText(text);
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    const text = data.text?.trim();

    // If pdf-parse extracted meaningful text, use it
    if (text && text.length > 50) {
      return sanitizeText(text);
    }

    // Fallback: PDF might be image-based (scanned), try Vision
    // Convert first page to base64 is not straightforward without extra deps,
    // so we return what we got with a note
    return sanitizeText(text || 'Unable to extract text from this PDF. The PDF may contain scanned images. Please upload the report as an image (JPG/PNG) for better results.');
  } catch (error) {
    throw new Error('Failed to parse PDF file. Please ensure the file is a valid PDF.');
  }
}

export async function performOCR(
  fileBuffer: Buffer,
  fileType: string
): Promise<string> {
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(fileBuffer);
  }

  if (fileType.startsWith('image/')) {
    const base64 = fileBuffer.toString('base64');
    return extractTextFromImage(base64, fileType);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}
