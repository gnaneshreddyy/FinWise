import { createHandler, routeByMethod } from './_lib/http.js';
import { clearMemory, forgetFact, getMemory } from './_lib/memoryStore.js';
import { memoryDeleteSchema } from '../core/schemas.js';

// GET    /api/memory               -> everything the assistant remembers about the user
// DELETE /api/memory?factId=...    -> forget one fact
// DELETE /api/memory               -> forget everything
export default routeByMethod({
  GET: createHandler({
    method: 'GET',
    async handle({ user }) {
      return { facts: await getMemory(user.uid) };
    },
  }),
  DELETE: createHandler({
    method: 'DELETE',
    schema: memoryDeleteSchema,
    async handle({ user, body }) {
      if (body.factId) await forgetFact(user.uid, body.factId);
      else await clearMemory(user.uid);
      return { facts: await getMemory(user.uid) };
    },
  }),
});
