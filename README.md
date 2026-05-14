# FinWise

FinWise is a personal finance web app for tracking income, spending, monthly balances, social squads, paper trading, and AI-assisted financial guidance.

## Features

- Google sign-in with Firebase Authentication.
- Firestore-backed user profiles and transactions.
- Dashboard with live total balance from saved inflow and outflow transactions.
- Transactions page with monthly starting balance, ending balance, money spent, money received, net expenditure, and expenditure split pie chart.
- AI Insights page powered by Groq's OpenAI-compatible API through the backend.
- Context-aware chatbot that answers using the signed-in user's real transaction behavior.
- Social squads with join/leave/member logic.
- Paper trading simulator.
- Firebase rules for user-owned transaction/profile data.

## Architecture

Frontend code lives in `frontend/` and is built with Vite + React. Browser code only reads browser-safe `VITE_` environment variables.

Backend code lives in `backend/` for local Express development. Production serverless endpoints live in `api/` for Vercel. AI keys stay server-side only.

```
frontend/
  index.html         Vite HTML entrypoint
  vite.config.js     Frontend-only Vite config
  public/            Static frontend assets
  src/
    components/      React pages and UI
    config/          Browser-safe config such as Firebase and API base URL
    services/        Frontend service layer for Firestore, auth, AI requests, and summaries

backend/
  server.js          Local Express entrypoint
  src/config/        Server env loading
  src/routes/        Express routes
  src/services/      Shared AI prompt and normalization logic

api/
  chat.js            Vercel chatbot endpoint
  insights.js        Vercel insights endpoint
  _groq.js           Serverless Groq OpenAI-compatible client
```

## Environment Variables

Create a root `.env` file for local development.

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FINNHUB_API_KEY=your_finnhub_api_key
```

For Vercel, set at least:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FINNHUB_API_KEY=your_finnhub_api_key
```

In production, `VITE_API_BASE_URL` can be omitted because the frontend falls back to `/api`.

## Running Locally

Install dependencies:

```bash
npm install
npm --prefix backend install
```

Run frontend and backend in separate terminals:

```bash
npm run dev:frontend
npm run dev:backend
```

Then open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The root `package.json` delegates frontend commands to `frontend/vite.config.js`, so the React app stays isolated from backend/serverless code.

## Firebase

Transactions are stored at:

```text
users/{uid}/transactions/{transactionId}
```

User profile data is stored at:

```text
users/{uid}
```

Deploy Firestore rules after changing `firestore.rules`:

```bash
npx firebase-tools deploy --only firestore:rules
```

## AI Behavior

AI calls do not go directly from the browser to Groq. The browser sends safe request payloads to the backend/serverless API, and the server calls Groq with `GROQ_API_KEY`.

### Insights

`POST /insights` or `POST /api/insights`

Generates finance insights with Groq and returns normalized chart-ready JSON. Chart data is deterministic so Recharts always receives matching fields.

### Chatbot

`POST /chat` or `POST /api/chat`

The chatbot sends the user's question plus a financial context summary built from their profile and transactions. The prompt asks the AI to be practical, supportive, non-judgmental, and to base advice on real spending patterns.

## Useful Commands

```bash
npm run lint
npm run build
npm run dev:frontend
npm run dev:backend
```

## Deployment Notes

- Add `GROQ_API_KEY` in Vercel project environment variables.
- Add all required Firebase `VITE_` variables in Vercel.
- Publish Firestore rules before testing authenticated Firestore reads/writes.
- Never commit real API keys. Keep secrets in local `.env` and deployment environment variables.
