import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Sample expense data (replace with actual source if needed)
const expenseData = [
  { date: '2024-01-01', category: 'Housing', amount: 1200.00 },
  { date: '2024-01-02', category: 'Food', amount: 50.00 },
  { date: '2024-01-03', category: 'Transportation', amount: 25.00 },
  { date: '2024-01-04', category: 'Healthcare', amount: 150.00 },
  { date: '2024-01-05', category: 'Entertainment', amount: 75.00 },
  { date: '2024-01-06', category: 'Shopping', amount: 200.00 },
  { date: '2024-01-07', category: 'Utilities', amount: 100.00 },
  { date: '2024-01-08', category: 'Food', amount: 45.00 },
  { date: '2024-01-09', category: 'Transportation', amount: 30.00 },
  { date: '2024-01-10', category: 'Healthcare', amount: 80.00 },
  { date: '2024-01-11', category: 'Entertainment', amount: 120.00 },
  { date: '2024-01-12', category: 'Shopping', amount: 90.00 },
  { date: '2024-01-13', category: 'Food', amount: 60.00 },
  { date: '2024-01-14', category: 'Transportation', amount: 40.00 },
  { date: '2024-01-15', category: 'Housing', amount: 300.00 },
  { date: '2024-01-16', category: 'Utilities', amount: 85.00 },
  { date: '2024-01-17', category: 'Food', amount: 55.00 },
  { date: '2024-01-18', category: 'Entertainment', amount: 95.00 },
  { date: '2024-01-19', category: 'Shopping', amount: 140.00 },
  { date: '2024-01-20', category: 'Transportation', amount: 35.00 },
  { date: '2024-01-21', category: 'Food', amount: 65.00 },
  { date: '2024-01-22', category: 'Healthcare', amount: 200.00 },
  { date: '2024-01-23', category: 'Entertainment', amount: 110.00 },
  { date: '2024-01-24', category: 'Shopping', amount: 80.00 },
  { date: '2024-01-25', category: 'Utilities', amount: 70.00 },
  { date: '2024-01-26', category: 'Food', amount: 48.00 },
  { date: '2024-01-27', category: 'Transportation', amount: 28.00 },
  { date: '2024-01-28', category: 'Entertainment', amount: 130.00 },
  { date: '2024-01-29', category: 'Shopping', amount: 160.00 },
  { date: '2024-01-30', category: 'Food', amount: 52.00 },
  { date: '2024-01-31', category: 'Healthcare', amount: 90.00 },
  { date: '2024-02-01', category: 'Housing', amount: 1200.00 },
  { date: '2024-02-02', category: 'Transportation', amount: 42.00 },
  { date: '2024-02-03', category: 'Food', amount: 58.00 },
  { date: '2024-02-04', category: 'Entertainment', amount: 85.00 },
  { date: '2024-02-05', category: 'Shopping', amount: 120.00 },
  { date: '2024-02-06', category: 'Utilities', amount: 95.00 },
  { date: '2024-02-07', category: 'Food', amount: 62.00 },
  { date: '2024-02-08', category: 'Transportation', amount: 38.00 },
  { date: '2024-02-09', category: 'Healthcare', amount: 175.00 },
  { date: '2024-02-10', category: 'Entertainment', amount: 105.00 },
  { date: '2024-02-11', category: 'Shopping', amount: 75.00 },
  { date: '2024-02-12', category: 'Food', amount: 44.00 },
  { date: '2024-02-13', category: 'Transportation', amount: 32.00 },
  { date: '2024-02-14', category: 'Entertainment', amount: 150.00 },
  { date: '2024-02-15', category: 'Shopping', amount: 200.00 },
  { date: '2024-02-16', category: 'Utilities', amount: 88.00 },
  { date: '2024-02-17', category: 'Food', amount: 56.00 },
  { date: '2024-02-18', category: 'Transportation', amount: 45.00 },
  { date: '2024-02-19', category: 'Healthcare', amount: 120.00 },
  { date: '2024-02-20', category: 'Entertainment', amount: 90.00 },
  { date: '2024-02-21', category: 'Shopping', amount: 110.00 },
  { date: '2024-02-22', category: 'Food', amount: 68.00 },
  { date: '2024-02-23', category: 'Transportation', amount: 36.00 },
  { date: '2024-02-24', category: 'Entertainment', amount: 125.00 },
  { date: '2024-02-25', category: 'Shopping', amount: 95.00 },
  { date: '2024-02-26', category: 'Utilities', amount: 92.00 },
  { date: '2024-02-27', category: 'Food', amount: 54.00 },
  { date: '2024-02-28', category: 'Transportation', amount: 41.00 },
  { date: '2024-02-29', category: 'Healthcare', amount: 160.00 },
  { date: '2024-03-01', category: 'Housing', amount: 1200.00 },
  { date: '2024-03-02', category: 'Entertainment', amount: 100.00 },
  { date: '2024-03-03', category: 'Shopping', amount: 85.00 },
  { date: '2024-03-04', category: 'Food', amount: 59.00 },
  { date: '2024-03-05', category: 'Transportation', amount: 33.00 },
  { date: '2024-03-06', category: 'Utilities', amount: 105.00 },
  { date: '2024-03-07', category: 'Food', amount: 47.00 },
  { date: '2024-03-08', category: 'Entertainment', amount: 115.00 },
  { date: '2024-03-09', category: 'Shopping', amount: 140.00 },
  { date: '2024-03-10', category: 'Transportation', amount: 39.00 },
  { date: '2024-03-11', category: 'Healthcare', amount: 185.00 },
  { date: '2024-03-12', category: 'Food', amount: 61.00 },
  { date: '2024-03-13', category: 'Entertainment', amount: 80.00 },
  { date: '2024-03-14', category: 'Shopping', amount: 125.00 },
  { date: '2024-03-15', category: 'Transportation', amount: 44.00 },
  { date: '2024-03-16', category: 'Utilities', amount: 78.00 },
  { date: '2024-03-17', category: 'Food', amount: 53.00 },
  { date: '2024-03-18', category: 'Entertainment', amount: 135.00 },
  { date: '2024-03-19', category: 'Shopping', amount: 95.00 },
  { date: '2024-03-20', category: 'Transportation', amount: 37.00 },
  { date: '2024-03-21', category: 'Healthcare', amount: 145.00 },
  { date: '2024-03-22', category: 'Food', amount: 66.00 },
  { date: '2024-03-23', category: 'Entertainment', amount: 110.00 },
  { date: '2024-03-24', category: 'Shopping', amount: 105.00 },
  { date: '2024-03-25', category: 'Transportation', amount: 29.00 },
  { date: '2024-03-26', category: 'Utilities', amount: 102.00 },
  { date: '2024-03-27', category: 'Food', amount: 57.00 },
  { date: '2024-03-28', category: 'Entertainment', amount: 88.00 },
  { date: '2024-03-29', category: 'Shopping', amount: 115.00 },
  { date: '2024-03-30', category: 'Transportation', amount: 43.00 },
  { date: '2024-03-31', category: 'Healthcare', amount: 165.00 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

function aggregateByCategory(rows) {
  const map = new Map();
  rows.forEach(({ category, amount }) => {
    map.set(category, (map.get(category) || 0) + amount);
  });
  return Array.from(map, ([category, total]) => ({ category, total }));
}

function aggregateByMonth(rows) {
  const map = new Map();
  rows.forEach(({ date, amount }) => {
    const month = new Date(date).toISOString().slice(0, 7);
    map.set(month, (map.get(month) || 0) + amount);
  });
  return Array.from(map, ([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month));
}

export default function Insights() {
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TEMP: Direct key per user request (do not store in .env for now)
  const GEMINI_API_KEY = 'AIzaSyBlAmW_WeRgVIC0tqL3wIFiViZkcBpdwEM';

  const fallback = useMemo(() => {
    const byCategory = aggregateByCategory(expenseData);
    const byMonth = aggregateByMonth(expenseData);
    const topCategory = [...byCategory].sort((a, b) => b.total - a.total)[0];
    const total = expenseData.reduce((s, r) => s + r.amount, 0);
    return {
      insights: [
        `Total spend: ₹${total.toFixed(2)}`,
        topCategory ? `Highest category: ${topCategory.category} (₹${topCategory.total.toFixed(2)})` : 'No category data',
        `Months covered: ${byMonth.length}`,
      ],
      charts: [
        {
          type: 'BarChart',
          title: 'Spending by Category',
          xField: 'category',
          yField: 'total',
          dataKey: 'total',
          additionalProps: {},
          description: 'Compares total spend across categories.',
          aggregatedData: byCategory,
        },
        {
          type: 'LineChart',
          title: 'Monthly Spending Trend',
          xField: 'month',
          yField: 'total',
          dataKey: 'total',
          additionalProps: {},
          description: 'Shows spending trend over months.',
          aggregatedData: byMonth,
        },
        {
          type: 'PieChart',
          title: 'Category Share',
          categoryField: 'category',
          valueField: 'total',
          dataKey: 'total',
          additionalProps: {},
          description: 'Distribution of spend by category.',
          aggregatedData: byCategory,
        },
        {
          type: 'AreaChart',
          title: 'Cumulative Monthly Spending',
          xField: 'month',
          yField: 'cumulative',
          dataKey: 'cumulative',
          additionalProps: {},
          description: 'Cumulative spend over time.',
          aggregatedData: (function() {
            let sum = 0;
            return byMonth.map(r => ({ month: r.month, cumulative: (sum += r.total) }));
          })(),
        },
      ],
    };
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      const apiKey = GEMINI_API_KEY;
      try {
        const prompt = `You are an expert data visualization assistant specialized in personal finance insights. Given the dataset, produce JSON as specified. Dataset: ${JSON.stringify(expenseData)}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = null;
        }
        setGeminiResponse(parsed || fallback);
      } catch (err) {
        setError(err.message);
        setGeminiResponse(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [fallback]);

  const renderChart = (chartConfig) => {
    const data = chartConfig.aggregatedData || expenseData;
    switch (chartConfig.type) {
      case 'BarChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartConfig.dataKey} fill="#8884d8" {...(chartConfig.additionalProps || {})} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'LineChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chartConfig.dataKey} stroke="#8884d8" {...(chartConfig.additionalProps || {})} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'PieChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey={chartConfig.valueField}
                nameKey={chartConfig.categoryField}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'AreaChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={chartConfig.dataKey} stroke="#8884d8" fill="#8884d8" {...(chartConfig.additionalProps || {})} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-red-300">Unsupported chart type: {chartConfig.type}</div>;
    }
  };

  if (loading) return <div className="text-gray-300 p-6">Loading insights...</div>;
  if (!geminiResponse) return <div className="text-gray-300 p-6">No insights available.</div>;

  const { insights, charts } = geminiResponse;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Expense Insights</h1>
        {insights?.length ? (
          <ul className="list-disc list-inside mb-8 text-gray-300">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        ) : null}
        <h2 className="text-2xl font-semibold text-white mb-4">Recommended Charts</h2>
        <div className="space-y-8">
          {charts?.map((chart, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-1">{chart.title}</h3>
              <p className="text-gray-400 mb-4">{chart.description}</p>
              {renderChart(chart)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


