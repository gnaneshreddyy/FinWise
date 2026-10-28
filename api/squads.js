import { createHandler, routeByMethod } from './_lib/http.js';
import { createSquad, getSquadFor, inviteToSquad, joinSquad } from './_lib/squadStore.js';
import { squadActionSchema } from '../core/schemas.js';

// GET  /api/squads                                   -> the user's squad with members, or null
// POST /api/squads { action: create | invite | join } -> squad actions (points awarded server-side)
export default routeByMethod({
  GET: createHandler({
    method: 'GET',
    async handle({ user }) {
      return { squad: await getSquadFor(user.uid) };
    },
  }),
  POST: createHandler({
    method: 'POST',
    schema: squadActionSchema,
    rateLimit: { bucket: 'squads', perMinute: 10, perDay: 100 },
    async handle({ user, body }) {
      if (body.action === 'create') return createSquad(user.uid);
      if (body.action === 'invite') return inviteToSquad(user.uid, body.username);
      return joinSquad(user.uid, body.username);
    },
  }),
});
