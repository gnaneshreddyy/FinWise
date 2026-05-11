import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const CHART_STROKE = '#374151';
const AXIS_TICK = { fill: '#9CA3AF', fontSize: 12 };

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

export default function Insights({ transactions = [] }) {
  const [aiInsightsResponse, setAiInsightsResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const expenseData = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.amount < 0)
        .map((transaction) => ({
          date: transaction.rawDate || transaction.date,
          category: transaction.name || 'Other',
          amount: Math.abs(transaction.amount),
        })),
    [transactions]
  );

  const hasEnoughInsightsData = expenseData.length > 4;

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
  }, [expenseData]);

  useEffect(() => {
    if (!hasEnoughInsightsData) {
      setLoading(false);
      setError(null);
      setAiInsightsResponse(null);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expenseData }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        setAiInsightsResponse(data || fallback);
      } catch (err) {
        setError(err.message);
        setAiInsightsResponse(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [apiBaseUrl, fallback, hasEnoughInsightsData, expenseData]);

  const renderChart = (chartConfig) => {
    const data = chartConfig.aggregatedData || expenseData;
    switch (chartConfig.type) {
      case 'BarChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} />
              <XAxis dataKey={chartConfig.xField} tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1F2937', borderRadius: '0.75rem' }}
              />
              <Legend />
              <Bar dataKey={chartConfig.dataKey} fill="#60A5FA" radius={[6, 6, 0, 0]} {...(chartConfig.additionalProps || {})} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'LineChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} />
              <XAxis dataKey={chartConfig.xField} tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip
                cursor={{ stroke: '#374151' }}
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1F2937', borderRadius: '0.75rem' }}
              />
              <Legend />
              <Line type="monotone" dataKey={chartConfig.dataKey} stroke="#60A5FA" strokeWidth={3} dot={{ r: 2 }} {...(chartConfig.additionalProps || {})} />
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
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1F2937', borderRadius: '0.75rem' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'AreaChart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} />
              <XAxis dataKey={chartConfig.xField} tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip
                cursor={{ stroke: '#374151' }}
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1F2937', borderRadius: '0.75rem' }}
              />
              <Legend />
              <Area type="monotone" dataKey={chartConfig.dataKey} stroke="#60A5FA" fill="#1D4ED8" fillOpacity={0.45} {...(chartConfig.additionalProps || {})} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-red-300">Unsupported chart type: {chartConfig.type}</div>;
    }
  };

  const renderStateCard = (title, description, tone = 'default') => {
    const toneClasses =
      tone === 'error'
        ? 'border-red-500/30 bg-red-500/10'
        : tone === 'loading'
          ? 'border-blue-500/30 bg-blue-500/10'
          : 'border-gray-700/70 bg-gray-900/80';

    return (
      <div className={`rounded-2xl border ${toneClasses} p-6`}>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-300">{description}</p>
      </div>
    );
  };

  if (!hasEnoughInsightsData) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-white">Expense Insights</h1>
            <p className="mt-2 text-sm text-gray-400">AI-powered patterns from your spending history.</p>
          </header>
          {renderStateCard(
            'Not enough data yet',
            'Add at least 5 expense transactions to unlock personalized insights and chart recommendations.',
            'default'
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-white">Expense Insights</h1>
            <p className="mt-2 text-sm text-gray-400">AI-powered patterns from your spending history.</p>
          </header>
          {renderStateCard('Building your insights', 'Analyzing recent transactions and preparing chart suggestions.', 'loading')}
        </div>
      </div>
    );
  }

  if (!aiInsightsResponse) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-white">Expense Insights</h1>
            <p className="mt-2 text-sm text-gray-400">AI-powered patterns from your spending history.</p>
          </header>
          {renderStateCard('No insights available', 'Try again after adding more transactions or refreshing the page.', 'error')}
        </div>
      </div>
    );
  }

  const { insights, charts } = aiInsightsResponse;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">Expense Insights</h1>
          <p className="mt-2 text-sm text-gray-400">AI-powered patterns from your spending history.</p>
          {error ? (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
              Live AI insights had an issue. Showing fallback analysis instead.
            </p>
          ) : null}
        </header>

        {insights?.length ? (
          <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
            <h2 className="mb-3 text-lg font-semibold text-white">Key Takeaways</h2>
            <ul className="space-y-2 text-sm leading-6 text-gray-300">
            {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{insight}</span>
                </li>
            ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">Recommended Charts</h2>
          <div className="space-y-6">
          {charts?.map((chart, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5 shadow-lg shadow-black/20">
                <h3 className="mb-1 text-lg font-semibold text-white">{chart.title}</h3>
                <p className="mb-4 text-sm leading-6 text-gray-400">{chart.description}</p>
              {renderChart(chart)}
            </div>
          ))}
          </div>
        </section>
      </div>
    </div>
  );
}


