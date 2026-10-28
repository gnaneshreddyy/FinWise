import { API_BASE_URL } from '../config/api';
import { auth } from '../config/firebase';

// Every route requires the caller's Firebase ID token; the server reads the
// user's data and conversation history itself.
const UNREACHABLE = import.meta.env.DEV
  ? "Can't reach the FinWise API. Start it with `npm run dev` (it runs the API and the app together)."
  : "Can't reach FinWise right now. Check your connection and try again.";

async function request(method, path, { body, query } = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Sign in to use this feature.');
  const token = await currentUser.getIdToken();

  const search = query ? `?${new URLSearchParams(Object.entries(query).filter(([, value]) => value != null))}` : '';
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${search}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error(UNREACHABLE), { status: 0 });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // No JSON body means the API itself never answered (e.g. the dev proxy found nothing on its port).
    if (!data && response.status >= 500) throw Object.assign(new Error(UNREACHABLE), { status: 0 });
    const error = new Error(data?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body = {}) => request('POST', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path, query) => request('DELETE', path, { query }),
};

export function requestChatReply(message, conversationId = null) {
  return request('POST', '/chat', { body: { message, ...(conversationId ? { conversationId } : {}) } });
}

export function requestExpenseInsights() {
  return request('POST', '/insights', { body: {} });
}

export function listConversations() {
  return request('GET', '/conversations');
}

export function getConversation(id) {
  return request('GET', '/conversations', { query: { id } });
}

export function deleteConversation(id) {
  return request('DELETE', '/conversations', { query: { id } });
}

export function getMemory() {
  return request('GET', '/memory');
}

export function forgetMemory(factId = null) {
  return request('DELETE', '/memory', { query: { factId } });
}
