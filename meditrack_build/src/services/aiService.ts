import { openai } from '@/lib/openai';
import type { ReportAnalysis } from '@/types';

export async function analyzeReport(extractedText: string): Promise<ReportAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a medical report analysis assistant. Analyze the provided medical report text and return a structured JSON response.

Your response MUST be valid JSON with this exact structure:
{
  "key_findings": ["string array of important findings in simple English"],
  "abnormal_values": [
    {
      "parameter": "name of the parameter",
      "value": "the reported value with units",
      "normal_range": "the expected normal range",
      "status": "high" | "low" | "critical"
    }
  ],
  "risk_flags": [
    {
      "condition": "potential condition name",
      "severity": "low" | "medium" | "high",
      "description": "brief explanation in simple terms"
    }
  ],
  "summary": "A 2-3 sentence summary of the report in simple, non-medical language that a regular person can understand",
  "recommendations": ["actionable recommendations in simple English"]
}

Rules:
- Use simple, everyday English. Avoid medical jargon.
- Be accurate but not alarming.
- Always recommend consulting a doctor for abnormal findings.
- If values are normal, say so clearly.
- If no abnormal values are found, return empty arrays for abnormal_values and risk_flags.
- Include at least one recommendation.
- Output ONLY valid JSON, no markdown code fences, no explanation.`,
      },
      {
        role: 'user',
        content: `Analyze this medical report:\n\n${extractedText}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);

  // Ensure all required fields exist with defaults
  return {
    key_findings: parsed.key_findings || [],
    abnormal_values: parsed.abnormal_values || [],
    risk_flags: parsed.risk_flags || [],
    summary: parsed.summary || 'Analysis could not generate a summary.',
    recommendations: parsed.recommendations || ['Please consult your healthcare provider for a detailed review.'],
  };
}

export async function chatWithReport(
  reportText: string,
  analysisSummary: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    {
      role: 'system',
      content: `You are a helpful, empathetic medical assistant chatbot. You help users understand their medical reports in simple, everyday language.

REPORT CONTEXT:
${reportText}

ANALYSIS SUMMARY:
${analysisSummary}

RULES:
- Answer questions about the report clearly and simply.
- Avoid unnecessary medical jargon. If you must use a medical term, explain it.
- Always remind users to consult a healthcare professional for medical advice.
- Be empathetic and reassuring, but honest.
- If asked about something not in the report, say you can only discuss what's in the report.
- Keep responses concise (2-4 sentences) unless the user asks for detail.
- Never diagnose conditions — only explain what the report shows.`,
    },
    ...chatHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 800,
    temperature: 0.5,
  });

  return (
    response.choices[0]?.message?.content ||
    'I apologize, I could not generate a response. Please try again.'
  );
}
