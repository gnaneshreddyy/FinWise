import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { requestExpenseInsights } from '../services/backendApi';
import { formatCurrency } from '../services/financeSummary';
import { categoryLabel } from '../config/categories';
import { buildFinancialSnapshot, aggregateExpenses } from '../../../core/finance/snapshot.js';
import {
  MIN_EXPENSES_FOR_INSIGHTS,
  buildFallbackInsights,
  buildInsightCharts,
} from '../../../core/ai/insights.js';
import { chartAxisTick, chartGridStroke, chartSeries, chartTooltipStyle, colors } from '../theme';

const compactRupees = (value) => (value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`);
const tooltipFormatter = (value, name) => [formatCurrency(value), categoryLabel(name)];

function ChartFrame({ children }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      {children}
    </ResponsiveContainer>
  );
}

function renderChart(chart) {
  const data = chart.aggregatedData;
  const axes = [
    <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />,
    <XAxis
      key="x"
      dataKey={chart.xField}
      tick={chartAxisTick}
      axisLine={false}
      tickLine={false}
      tickFormatter={chart.xField === 'category' ? categoryLabel : undefined}
    />,
    <YAxis key="y" tick={chartAxisTick} axisLine={false} tickLine={false} width={56} tickFormatter={compactRupees} />,
    <Tooltip key="tip" {...chartTooltipStyle} formatter={(value) => formatCurrency(value)} labelFormatter={chart.xField === 'category' ? categoryLabel : undefined} />,
  ];

  switch (chart.type) {
    case 'BarChart':
      return (
        <ChartFrame>
          <BarChart data={data}>
            {axes}
            <Bar dataKey={chart.dataKey} fill={colors.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartFrame>
      );
    case 'LineChart':
      return (
        <ChartFrame>
          <LineChart data={data}>
            {axes}
            <Line type="monotone" dataKey={chart.dataKey} stroke={colors.accent} strokeWidth={2} dot={{ r: 3, fill: colors.accent }} />
          </LineChart>
        </ChartFrame>
      );
    case 'PieChart':
      return (
        <ChartFrame>
          <PieChart>
            <Pie data={data} dataKey={chart.dataKey} nameKey={chart.categoryField} innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={chartSeries[index % chartSeries.length]} />
              ))}
            </Pie>
            <Tooltip {...chartTooltipStyle} formatter={tooltipFormatter} />
          </PieChart>
        </ChartFrame>
      );
    case 'AreaChart':
      return (
        <ChartFrame>
          <AreaChart data={data}>
            {axes}
            <Area type="monotone" dataKey={chart.dataKey} stroke={colors.accent} fill={colors.accent} fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ChartFrame>
      );
    default:
      return null;
  }
}

function PageShell({ children, notice }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-ink-muted">Charts are computed from your data. Takeaways are written from those same numbers.</p>
          {notice}
        </header>
        {children}
      </main>
    </div>
  );
}

function StateCard({ title, description }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </div>
  );
}

export default function Insights({ transactions = [] }) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const expenseCount = useMemo(() => aggregateExpenses(transactions).count, [transactions]);
  const enoughData = expenseCount >= MIN_EXPENSES_FOR_INSIGHTS;

  // Same computation the server runs; shown immediately and kept if the server fails.
  const local = useMemo(
    () => ({
      charts: buildInsightCharts(transactions),
      insights: buildFallbackInsights(buildFinancialSnapshot(transactions)),
      source: 'computed',
    }),
    [transactions]
  );

  // Refetch only when the data actually changes, not on every re-render.
  const dataVersion = `${transactions.length}:${transactions[0]?.id || ''}:${transactions.reduce((sum, item) => sum + item.amount, 0)}`;

  useEffect(() => {
    if (!enoughData) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    requestExpenseInsights()
      .then((data) => !cancelled && setRemote(data))
      .catch((requestError) => !cancelled && setError(requestError.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dataVersion, enoughData]);

  if (!enoughData) {
    return (
      <PageShell>
        <StateCard
          title="Not enough data yet"
          description={`Log at least ${MIN_EXPENSES_FOR_INSIGHTS} expenses to unlock insights. You have ${expenseCount} so far.`}
        />
      </PageShell>
    );
  }

  const view = remote?.enoughData ? remote : local;
  const notice = error ? (
    <p className="mt-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
      Showing computed takeaways because the AI request failed: {error}
    </p>
  ) : null;

  return (
    <PageShell notice={notice}>
      <section className="mb-6 rounded-xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Takeaways</h2>
          <span className="text-xs text-ink-subtle">
            {loading ? 'Updating…' : view.source === 'ai' ? 'Written by AI from computed figures' : 'Computed'}
          </span>
        </div>
        <ul className="space-y-2 text-sm leading-6 text-ink-muted">
          {view.insights.map((insight) => (
            <li key={insight} className="flex gap-3">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {view.charts.map((chart) => (
          <div key={chart.type} className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">{chart.title}</h3>
            <p className="mb-4 text-sm text-ink-muted">{chart.description}</p>
            {renderChart(chart)}
          </div>
        ))}
      </section>
    </PageShell>
  );
}
