// Local development server. It mounts the exact same handlers Vercel runs from api/,
// under the same /api paths, so there is one backend implementation with two entrypoints.
// Vite proxies /api here (frontend/vite.config.js), so the browser always talks to its own origin.
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import chat from '../api/chat.js';
import insights from '../api/insights.js';
import conversations from '../api/conversations.js';
import memory from '../api/memory.js';
import profile from '../api/profile.js';
import transactions from '../api/transactions.js';
import squads from '../api/squads.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

const app = express();
const port = Number(process.env.API_PORT) || 3000;

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.post('/api/chat', chat);
app.post('/api/insights', insights);
app.all('/api/conversations', conversations);
app.all('/api/memory', memory);
app.post('/api/profile', profile);
app.all('/api/transactions', transactions);
app.all('/api/squads', squads);

const missing = ['MONGODB_URI', 'FIREBASE_SERVICE_ACCOUNT', 'GROQ_API_KEY'].filter((key) => !process.env[key]);
app
  .listen(port, () => {
    console.log(`FinWise API running on http://localhost:${port}/api`);
    if (missing.length) console.warn(`Missing in .env: ${missing.join(', ')}. Related features will return errors.`);
  })
  .on('error', (error) => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Set API_PORT in .env to change it.` : error);
    process.exit(1);
  });
