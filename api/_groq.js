/* eslint-env node */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export function stripMarkdownFences(text = '') {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export async function generateGroqResponse(prompt, responseFormat = 'text') {
  const env = globalThis.process?.env || {};

  if (!env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY in Vercel environment');
  }

  const response = await globalThis.fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful personal finance AI assistant.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq request failed with status ${response.status}`);
  }

  return data?.choices?.[0]?.message?.content || '';
}
