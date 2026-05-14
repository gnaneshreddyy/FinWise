import express from 'express';
import { generateGroqResponse, stripMarkdownFences } from '../services/groqService.js';
import { buildExpenseInsightsPrompt, normalizeInsightsResponse } from '../services/insightsService.js';
import { buildFinancialChatPrompt } from '../services/financialChatService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { prompt, financialContext } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const reply = await generateGroqResponse(buildFinancialChatPrompt(prompt, financialContext), 'text');
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/insights', async (req, res) => {
  try {
    const { expenseData } = req.body;

    if (!Array.isArray(expenseData)) {
      return res.status(400).json({ error: 'expenseData must be an array' });
    }

    const prompt = buildExpenseInsightsPrompt(expenseData);
    const raw = await generateGroqResponse(prompt, 'json');
    const parsed = JSON.parse(stripMarkdownFences(raw));
    res.json(normalizeInsightsResponse(parsed, expenseData));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/personalization/rewards', async (req, res) => {
  res.status(410).json({
    error: 'Personalization rewards are disabled. Use squad/community actions for points.',
  });
});

export default router;
