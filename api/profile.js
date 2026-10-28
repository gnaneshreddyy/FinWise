import { createHandler } from './_lib/http.js';
import { ensureUser } from './_lib/userStore.js';
import { profileEnsureSchema } from '../core/schemas.js';

// POST /api/profile -> the signed-in user's profile, created on first sign-in.
export default createHandler({
  schema: profileEnsureSchema,
  async handle({ user, body }) {
    return { profile: await ensureUser(user, body) };
  },
});
