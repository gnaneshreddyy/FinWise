import process from 'node:process';
import { HttpError } from './http.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const TIMEOUT_MS = 20_000;

async function requestCompletion(body, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// Single LLM entry point for every route. Retries once on rate limits and server errors.
export async function completeChat({ messages, json = false, temperature = 0.2, maxTokens = 600 }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new HttpError(500, 'The AI service is not configured on the server.');

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  // gpt-oss models reason before answering and those tokens count against max_tokens,
  // so keep reasoning short and leave headroom for the visible answer.
  const isReasoningModel = model.startsWith('openai/gpt-oss');
  const body = {
    model,
    temperature,
    max_tokens: isReasoningModel ? maxTokens + 1024 : maxTokens,
    messages,
    ...(isReasoningModel ? { reasoning_effort: 'low', include_reasoning: false } : {}),
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  };

  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await requestCompletion(body, apiKey);
    } catch (error) {
      if (attempt === 1) throw new HttpError(504, 'The AI service timed out.', { cause: error });
      continue;
    }
    if (response.ok || (response.status !== 429 && response.status < 500)) break;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 800));
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('LLM request failed', response.status, data?.error?.message);
    throw new HttpError(502, 'The AI service is unavailable right now.');
  }

  return {
    content: data?.choices?.[0]?.message?.content || '',
    usage: data?.usage || null,
    model: data?.model || model,
  };
}
