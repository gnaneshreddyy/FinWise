function toFiniteAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function toMonth(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().slice(0, 7);
}

export function aggregateByCategory(rows = []) {
  const totals = new Map();
  rows.forEach((row) => {
    const category = row.category || 'Other';
    totals.set(category, (totals.get(category) || 0) + toFiniteAmount(row.amount));
  });
  return Array.from(totals, ([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

export function aggregateByMonth(rows = []) {
  const totals = new Map();
  rows.forEach((row) => {
    const month = toMonth(row.date);
    totals.set(month, (totals.get(month) || 0) + toFiniteAmount(row.amount));
  });
  return Array.from(totals, ([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month));
}

export function buildDeterministicCharts(expenseData = []) {
  const byCategory = aggregateByCategory(expenseData);
  const byMonth = aggregateByMonth(expenseData);
  let cumulative = 0;

  return {
    BarChart: {
      type: 'BarChart',
      title: 'Spending by Category',
      description: 'Compares total spending across categories.',
      xField: 'category',
      yField: 'total',
      dataKey: 'total',
      additionalProps: {},
      aggregatedData: byCategory,
    },
    LineChart: {
      type: 'LineChart',
      title: 'Monthly Spending Trend',
      description: 'Tracks total spending month by month.',
      xField: 'month',
      yField: 'total',
      dataKey: 'total',
      additionalProps: {},
      aggregatedData: byMonth,
    },
    PieChart: {
      type: 'PieChart',
      title: 'Category Share',
      description: 'Shows how spending is split by category.',
      categoryField: 'category',
      valueField: 'total',
      dataKey: 'total',
      additionalProps: {},
      aggregatedData: byCategory,
    },
    AreaChart: {
      type: 'AreaChart',
      title: 'Cumulative Spending',
      description: 'Shows how expenses accumulate over time.',
      xField: 'month',
      yField: 'cumulative',
      dataKey: 'cumulative',
      additionalProps: {},
      aggregatedData: byMonth.map((row) => ({
        month: row.month,
        cumulative: (cumulative += row.total),
      })),
    },
  };
}

export function buildExpenseInsightsPrompt(expenseData = []) {
  return [
    'You are an expert personal finance analyst using the Groq OpenAI-compatible API.',
    'Analyze the expense dataset and respond with strict JSON only.',
    'Return exactly this object shape:',
    '{',
    '  "insights": string[],',
    '  "charts": [',
    '    {',
    '      "type": "BarChart" | "LineChart" | "PieChart" | "AreaChart",',
    '      "title": string,',
    '      "description": string,',
    '      "dataKey": string,',
    '      "additionalProps": object,',
    '      "xField"?: string,',
    '      "yField"?: string,',
    '      "categoryField"?: string,',
    '      "valueField"?: string',
    '    }',
    '  ]',
    '}',
    'Rules:',
    '- Provide 3 to 5 concise insights.',
    '- Provide exactly 4 charts including one each of BarChart, LineChart, PieChart, and AreaChart.',
    '- Use category/total for category charts and month/total for monthly charts.',
    '- Do not include markdown, commentary, or code fences.',
    '',
    `Dataset: ${JSON.stringify(expenseData)}`,
  ].join('\n');
}

export function normalizeInsightsResponse(parsed, expenseData = []) {
  const deterministicCharts = buildDeterministicCharts(expenseData);
  const allowedTypes = ['BarChart', 'LineChart', 'PieChart', 'AreaChart'];
  const chartsByType = new Map(
    Array.isArray(parsed?.charts)
      ? parsed.charts
          .filter((chart) => allowedTypes.includes(chart?.type))
          .map((chart) => [chart.type, chart])
      : []
  );

  return {
    insights: Array.isArray(parsed?.insights)
      ? parsed.insights.filter((insight) => typeof insight === 'string').slice(0, 5)
      : [],
    charts: allowedTypes.map((type) => {
      const aiChart = chartsByType.get(type) || {};
      const chart = deterministicCharts[type];

      return {
        ...chart,
        title: typeof aiChart.title === 'string' ? aiChart.title : chart.title,
        description: typeof aiChart.description === 'string' ? aiChart.description : chart.description,
        additionalProps: {},
      };
    }),
  };
}
