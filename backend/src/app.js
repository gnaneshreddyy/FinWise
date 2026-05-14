import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/aiRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use(aiRoutes);

  return app;
}
