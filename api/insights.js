/* eslint-env node */

import { generateGroqResponse, stripMarkdownFences } from './_groq.js';
import {
  buildExpenseInsightsPrompt,
  normalizeInsightsResponse,
} from '../backend/src/services/insightsService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { expenseData } = req.body || {};

    if (!Array.isArray(expenseData)) {
      return res.status(400).json({ error: 'expenseData must be an array' });
    }

    const prompt = buildExpenseInsightsPrompt(expenseData);
    const raw = await generateGroqResponse(prompt, 'json');
    const parsed = JSON.parse(stripMarkdownFences(raw));

    return res.status(200).json(normalizeInsightsResponse(parsed, expenseData));
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
}
