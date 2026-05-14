/* eslint-env node */

import { generateGroqResponse } from './_groq.js';
import { buildFinancialChatPrompt } from '../backend/src/services/financialChatService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, financialContext } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const reply = await generateGroqResponse(buildFinancialChatPrompt(prompt, financialContext), 'text');
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Failed to generate chat reply:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate chat reply' });
  }
}
