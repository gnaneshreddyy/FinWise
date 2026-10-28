export class HttpError extends Error {
  constructor(status, message, { headers = {}, cause } = {}) {
    super(message, { cause });
    this.status = status;
    this.headers = headers;
  }
}

function bearerToken(req) {
  const header = req.headers?.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

// Wraps a route with method check, Firebase auth, per-user rate limiting and zod validation.
// Works for both Vercel functions and Express, which share the req/res shape used here.
export function createHandler({ method = 'POST', schema, rateLimit, handle }) {
  return async function handler(req, res) {
    const startedAt = Date.now();
    try {
      if (req.method !== method) {
        throw new HttpError(405, 'Method not allowed', { headers: { Allow: method } });
      }

      const token = bearerToken(req);
      if (!token) throw new HttpError(401, 'Sign in to use this feature.');

      // Loaded lazily so unit tests of route logic never touch firebase-admin.
      const { verifyUser } = await import('./auth.js');
      const user = await verifyUser(token);

      if (rateLimit) {
        const { enforceRateLimit } = await import('./rateLimit.js');
        await enforceRateLimit(user.uid, rateLimit);
      }

      // GET and DELETE take their input from the query string, everything else from the body.
      let body = (method === 'GET' || method === 'DELETE' ? req.query : req.body) ?? {};
      if (schema) {
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          throw new HttpError(400, parsed.error.issues[0]?.message || 'Invalid request');
        }
        body = parsed.data;
      }

      const result = await handle({ user, body });
      console.info(JSON.stringify({ route: req.url, uid: user.uid, ms: Date.now() - startedAt, status: 200 }));
      return res.status(200).json(result);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error(error);
      Object.entries(error.headers || {}).forEach(([key, value]) => res.setHeader(key, value));
      return res.status(status).json({ error: status >= 500 && !(error instanceof HttpError) ? 'Something went wrong.' : error.message });
    }
  };
}

// One endpoint, several methods: { GET: createHandler({ method: 'GET', ... }), DELETE: ... }.
export function routeByMethod(handlers) {
  const allowed = Object.keys(handlers).join(', ');
  return (req, res) => {
    const handler = handlers[req.method];
    if (handler) return handler(req, res);
    res.setHeader('Allow', allowed);
    return res.status(405).json({ error: 'Method not allowed' });
  };
}
