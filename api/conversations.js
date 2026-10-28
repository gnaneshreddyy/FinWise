import { createHandler, routeByMethod } from './_lib/http.js';
import { deleteConversation, getConversationWithMessages, listConversations } from './_lib/conversationStore.js';
import { conversationDeleteSchema, conversationQuerySchema } from '../core/schemas.js';

// GET    /api/conversations         -> recent threads
// GET    /api/conversations?id=...  -> one thread with its messages
// DELETE /api/conversations?id=...  -> delete a thread and its messages
export default routeByMethod({
  GET: createHandler({
    method: 'GET',
    schema: conversationQuerySchema,
    async handle({ user, body }) {
      if (body.id) return getConversationWithMessages(user.uid, body.id);
      return { conversations: await listConversations(user.uid) };
    },
  }),
  DELETE: createHandler({
    method: 'DELETE',
    schema: conversationDeleteSchema,
    async handle({ user, body }) {
      await deleteConversation(user.uid, body.id);
      return { deleted: true };
    },
  }),
});
