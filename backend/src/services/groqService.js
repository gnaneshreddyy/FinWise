import OpenAI from 'openai';
import { env } from '../config/env.js';

const client = new OpenAI({
  apiKey: env.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1',
});

export function stripMarkdownFences(text = '') {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export async function generateGroqResponse(prompt, responseFormat = 'text') {
  if (!env.groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in server environment');
  }

  const completion = await client.chat.completions.create({
    model: env.groqModel,
    temperature: 0.2,
    response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful personal finance AI assistant.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return completion.choices?.[0]?.message?.content || '';
}
