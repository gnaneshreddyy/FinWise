import { createHandler } from './_lib/http.js';
import { completeChat } from './_lib/llm.js';
import { loadUserFinancialData } from './_lib/userData.js';
import { buildFinancialSnapshot, aggregateExpenses } from '../core/finance/snapshot.js';
import {
  MIN_EXPENSES_FOR_INSIGHTS,
  buildFallbackInsights,
  buildInsightCharts,
  buildInsightsMessages,
  parseInsightsCompletion,
} from '../core/ai/insights.js';
import { insightsRequestSchema } from '../core/schemas.js';

export default createHandler({
  schema: insightsRequestSchema,
  rateLimit: { bucket: 'insights', perMinute: 4, perDay: 40 },
  async handle({ user }) {
    const { profile, transactions } = await loadUserFinancialData(user.uid);
    if (aggregateExpenses(transactions).count < MIN_EXPENSES_FOR_INSIGHTS) {
      return { enoughData: false, insights: [], charts: [], source: 'none' };
    }

    const snapshot = buildFinancialSnapshot(transactions, { profile });
    const charts = buildInsightCharts(transactions);

    let insights = null;
    try {
      const { content } = await completeChat({ messages: buildInsightsMessages(snapshot), json: true });
      insights = parseInsightsCompletion(content);
    } catch (error) {
      console.warn('Insights completion failed, using computed takeaways:', error.message);
    }

    return insights
      ? { enoughData: true, insights, charts, source: 'ai' }
      : { enoughData: true, insights: buildFallbackInsights(snapshot), charts, source: 'computed' };
  },
});
