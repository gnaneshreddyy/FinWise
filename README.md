# FinWise

FinWise is a personal finance web app for people who pay with UPI and don't want to link a bank. You log income and spending; FinWise turns it into monthly statements, computed insights and an assistant that answers questions about your own numbers.

[**Live Demo**](https://fin-wise-self.vercel.app/)

## Features

- Google and email sign-in with Firebase Authentication (Firebase is used for nothing else).
- Add, edit and delete transactions, stored per user in MongoDB behind a validated API.
- One-click sample data (three realistic months) for demos, removable without touching real entries.
- Dashboard with balance, this month's money in/out, savings rate and a month-end spending projection.
- Monthly statements: opening and closing balance, net movement and category split.
- Insights: charts computed from your data, plus short takeaways written by an LLM from those same figures, with a computed fallback.
- Assistant that answers from a server-built snapshot of your data, with saved conversations you can reopen or delete.
- Long-term assistant memory: goals and upcoming expenses you mention are remembered across conversations, shown to you, and deletable one by one.
- Paper-trading simulator. (Squads code remains but is hidden from navigation.)

## How the AI layer works

The model never sees raw client input as "your data", and never does the arithmetic.

1. The browser sends only the question and a conversation id, with a Firebase ID token.
2. The server verifies the token, applies a per-user rate limit and validates the body with zod.
3. The server loads that user's transactions from MongoDB and builds a **financial snapshot** (`core/finance/snapshot.js`): this month, last month, three-month averages, category changes, projected spend.
4. The server loads the last 12 turns of that conversation and the user's remembered facts from MongoDB.
5. Two calls run in parallel: the reply (snapshot + memory + history) and a small JSON extraction that decides whether the message contains a lasting fact. Extracted facts are filtered (no account numbers, PINs, OTPs), de-duplicated and capped at 20.
6. Both turns are stored with model and token usage. Insights charts are always computed, never generated.

The same `core/` code runs in the browser for instant, offline-safe fallbacks.

## Architecture

```
core/                Shared, framework-free logic (browser + Node)
  finance/           Dates, financial snapshot, sample data
  ai/                Prompt builders and completion parsing
  schemas.js         zod request schemas, category list

api/                 Vercel serverless functions (the only backend)
  chat.js            POST /api/chat
  conversations.js   GET/DELETE /api/conversations (list, open, delete threads)
  memory.js          GET/DELETE /api/memory (view, forget one, forget all)
  insights.js        POST /api/insights
  profile.js         POST /api/profile (get or create the signed-in user's profile)
  transactions.js    GET/POST/PATCH/DELETE /api/transactions
  squads.js          GET/POST /api/squads (create, invite, join; points awarded server-side)
  _lib/              Token verification, rate limiting, LLM client, MongoDB stores

backend/server.js    Local dev server: the same api/ handlers on Express, under /api
scripts/dev.mjs      Runs the API and Vite together (npm run dev)

frontend/            Vite + React app
  src/components/    Pages and UI
  src/services/      Firebase Auth and API clients
  src/index.css      Design tokens (Tailwind v4 @theme)
  src/theme.js       Token hex values for charts
```

### Design tokens

Components use semantic token classes only: `bg-canvas`, `bg-surface`, `bg-raised`, `border-line`, `text-ink`, `text-ink-muted`, `text-ink-subtle`, `bg-accent` / `text-accent-ink`, and `text-gain` / `text-loss` / `text-warn`. Change colours in `frontend/src/index.css` (and mirror them in `frontend/src/theme.js` for charts), never in components.

## Data model and security

Firebase Authentication issues ID tokens; that is its only job. All data lives in MongoDB (database `finwise`) and is reached only through `api/`. The browser never talks to the database. Every route verifies the token, and every query filters on the verified uid, so a user can only ever touch their own documents.

| Collection | Contents |
| --- | --- |
| `users` | `_id` = uid, email, name, photo, unique `username`, squad, points, timestamps |
| `transactions` | `uid`, `date` (`YYYY-MM-DD`, local), `time`, `amount`, `category`, `description`, `source` (`manual`/`sample`). Validated by zod in `core/schemas.js`. |
| `conversations` | `uid`, `title`, `preview`, `messageCount`, timestamps |
| `messages` | `conversationId`, `uid`, `role`, `content`, `model`, `usage`, `createdAt` |
| `user_memory` | `_id` = uid, `facts: [{ id, text, createdAt, conversationId }]` |
| `squads` | `_id` = owner username, members, invites. Only the server changes membership or awards points. |
| `rate_limits` | Per-user, per-window counters with a TTL index |

Other users only ever see a public projection of a profile (name, username, photo, points), never email or money data.

## Environment variables

Create a root `.env` for local development (see `.env.example`).

| Variable | Where | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | Server | LLM access |
| `GROQ_MODEL` | Server | Optional. Defaults to `openai/gpt-oss-120b` (run with low reasoning effort). `openai/gpt-oss-20b` is faster and cheaper. |
| `FIREBASE_SERVICE_ACCOUNT` | Server | Service-account JSON, raw or base64, used only to verify ID tokens. Firebase console → Project settings → Service accounts → Generate new private key. |
| `MONGODB_URI` | Server | Atlas connection string (all app data) |
| `MONGODB_DB` | Server | Optional, defaults to `finwise` |
| `VITE_FIREBASE_*` | Browser | Firebase web config |
| `API_PORT` | Dev only | Port for the local API server, default `5000`. Vite proxies `/api` to it. |
| `VITE_FINNHUB_API_KEY` | Browser | Paper trading quotes |

## Running locally

```bash
npm install
npm run dev            # API on :5000 and the app on http://localhost:5173, together

# or separately
npm run dev:backend
npm run dev:frontend
```

## Scripts

```bash
npm test        # vitest: snapshot math, prompts, memory filtering, parsing, rate limiting, sample data
npm run lint
npm run build
```

## Deployment

- Vercel deploys the Vite app plus the functions in `api/`. Root directory `./`, build `npm run build`, output `dist`.
- Set `GROQ_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `MONGODB_URI` and the `VITE_FIREBASE_*` variables in Vercel.
- In Atlas → Network Access, allow `0.0.0.0/0` (Vercel functions have no fixed IP), relying on the database user's password.
- In Firebase, enable the Email/Password and Google sign-in providers and add the Vercel domain to Authorized domains. Firestore is not used and does not need to be enabled.

FinWise is an educational tool and does not give financial advice.
