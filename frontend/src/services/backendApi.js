import { API_BASE_URL } from '../config/api';

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export function requestChatReply(prompt, financialContext = null) {
  return postJson('/chat', { prompt, financialContext });
}

export function requestExpenseInsights(expenseData) {
  return postJson('/insights', { expenseData });
}

export function requestPersonalizationRewards(payload) {
  return postJson('/personalization/rewards', payload);
}
