import { createHandler } from './_lib/http.js';
import { completeChat } from './_lib/llm.js';
import { loadUserFinancialData } from './_lib/userData.js';
import { appendExchange, deleteConversation, getOrCreateConversation, loadRecentTurns } from './_lib/conversationStore.js';
import { getMemory, rememberFacts } from './_lib/memoryStore.js';
import { buildFinancialSnapshot } from '../core/finance/snapshot.js';
import { buildChatMessages } from '../core/ai/chat.js';
import { buildMemoryExtractionMessages, parseMemoryCompletion } from '../core/ai/memory.js';
import { chatRequestSchema } from '../core/schemas.js';

// Memory extraction must never break a chat reply, so failures resolve to no new facts.
async function extractFacts(existingFacts, message) {
  try {
    const { content } = await completeChat({
      messages: buildMemoryExtractionMessages({ existingFacts, message }),
      json: true,
      temperature: 0,
      maxTokens: 200,
    });
    return parseMemoryCompletion(content);
  } catch (error) {
    console.warn('Memory extraction failed:', error.message);
    return [];
  }
}

export default createHandler({
  schema: chatRequestSchema,
  rateLimit: { bucket: 'chat', perMinute: 8, perDay: 150 },
  async handle({ user, body }) {
    const { message } = body;
    const [{ conversation, isNew }, memory, { profile, transactions }] = await Promise.all([
      getOrCreateConversation(user.uid, body.conversationId, message),
      getMemory(user.uid),
      loadUserFinancialData(user.uid),
    ]);
    const history = isNew ? [] : await loadRecentTurns(user.uid, conversation.id);
    const snapshot = buildFinancialSnapshot(transactions, { profile });

    let completion;
    let newFacts;
    try {
      [completion, newFacts] = await Promise.all([
        completeChat({ messages: buildChatMessages({ snapshot, memory, history, message }), temperature: 0.3 }),
        extractFacts(memory, message),
      ]);
    } catch (error) {
      // Don't leave an empty thread behind when the very first reply fails.
      if (isNew) await deleteConversation(user.uid, conversation.id).catch(() => {});
      throw error;
    }

    const reply = completion.content.trim() || "I couldn't come up with an answer. Try rephrasing the question.";
    const [, remembered] = await Promise.all([
      appendExchange(user.uid, conversation.id, { userMessage: message, reply, model: completion.model, usage: completion.usage }),
      rememberFacts(user.uid, newFacts, { conversationId: conversation.id }),
    ]);

    return {
      reply,
      conversation: { id: conversation.id, title: conversation.title },
      remembered,
    };
  },
});
