import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Sparkles } from 'lucide-react';
import { formatCurrency, getCurrentBalance } from '../services/financeSummary';
import { buildFinancialSnapshot } from '../../../core/finance/snapshot.js';
import { chartAxisTick, chartGridStroke, chartTooltipStyle, colors } from '../theme';
import TransactionForm from './TransactionForm';
import TransactionRow from './TransactionRow';

const TIMEFRAMES = [
  { id: '1M', months: 1 },
  { id: '3M', months: 3 },
  { id: '6M', months: 6 },
];

function greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function buildChartData(transactions, months) {
  const now = new Date();
  const buckets = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expense: 0,
    });
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  transactions.forEach((transaction) => {
    const date = new Date(transaction.rawDate);
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!bucket) return;
    if (transaction.amount >= 0) bucket.income += transaction.amount;
    else bucket.expense += Math.abs(transaction.amount);
  });

  return buckets;
}

export default function Dashboard({
  user = null,
  profile = null,
  transactions = [],
  onAddTransaction,
  onLoadSample,
  onClearSample,
  onChangeView,
  persistenceError = null,
}) {
  const [timeframe, setTimeframe] = useState('3M');
  const [showForm, setShowForm] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);

  const now = new Date();
  const firstName = (profile?.fullName || user?.displayName || user?.email?.split('@')?.[0] || '').split(' ')[0];
  const balance = useMemo(() => getCurrentBalance(transactions), [transactions]);
  const snapshot = useMemo(() => buildFinancialSnapshot(transactions), [transactions]);
  const months = TIMEFRAMES.find((item) => item.id === timeframe).months;
  const chartData = useMemo(() => buildChartData(transactions, months), [transactions, months]);
  const hasTransactions = transactions.length > 0;
  const hasSample = transactions.some((transaction) => transaction.source === 'sample');
  const month = snapshot.current_month;

  const runSampleAction = async (action) => {
    setSampleBusy(true);
    try {
      await action?.();
    } finally {
      setSampleBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSubmit={onAddTransaction} />}

      <main className="mx-auto max-w-7xl px-4 py-8">
        {persistenceError ? (
          <div className="mb-6 rounded-lg border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">{persistenceError}</div>
        ) : null}

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-ink-subtle">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {greeting(now)}{firstName ? `, ${firstName}` : ''}
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" /> Add transaction
          </button>
        </header>

        {hasSample ? (
          <div className="mb-6 flex flex-col gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-ink-muted">You are looking at sample data. Your own entries are kept separately.</span>
            <button
              onClick={() => runSampleAction(onClearSample)}
              disabled={sampleBusy}
              className="font-medium text-accent hover:text-accent-hover disabled:opacity-60"
            >
              {sampleBusy ? 'Removing…' : 'Remove sample data'}
            </button>
          </div>
        ) : null}

        {!hasTransactions ? (
          <section className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">Start with your first transaction</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-muted">
              Log what came in and what went out. Statements, insights and the assistant all build on these entries.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-ink hover:bg-accent-hover"
              >
                Add a transaction
              </button>
              <button
                onClick={() => runSampleAction(onLoadSample)}
                disabled={sampleBusy}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 font-medium text-ink hover:bg-raised disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-accent" /> {sampleBusy ? 'Loading…' : 'Explore with sample data'}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
              <Stat label="Balance" value={formatCurrency(balance)} />
              <Stat label="In this month" value={formatCurrency(month.income)} tone="gain" />
              <Stat label="Out this month" value={formatCurrency(month.expenses)} tone="loss" />
              <Stat
                label="Kept this month"
                value={month.savings_rate === null ? '—' : `${Math.round(month.savings_rate * 100)}%`}
                hint={month.projected_expenses ? `On pace to spend ${formatCurrency(month.projected_expenses)}` : null}
              />
            </section>

            <div className="grid gap-6 lg:grid-cols-5">
              <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-3">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-semibold">Money in and out</h2>
                  <div className="flex gap-1 rounded-lg bg-raised p-1" role="tablist">
                    {TIMEFRAMES.map((item) => (
                      <button
                        key={item.id}
                        role="tab"
                        aria-selected={timeframe === item.id}
                        onClick={() => setTimeframe(item.id)}
                        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                          timeframe === item.id ? 'bg-line text-ink' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        {item.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.gain} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={colors.gain} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.loss} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={colors.loss} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={chartAxisTick} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={chartAxisTick}
                        width={56}
                        tickFormatter={(value) => (value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`)}
                      />
                      <Tooltip {...chartTooltipStyle} formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'In' : 'Out']} />
                      <Area type="monotone" dataKey="income" stroke={colors.gain} fill="url(#incomeFill)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expense" stroke={colors.loss} fill="url(#expenseFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">Recent activity</h2>
                  <button onClick={() => onChangeView?.('transactions')} className="text-sm font-medium text-accent hover:text-accent-hover">
                    View all
                  </button>
                </div>
                <ul className="divide-y divide-line">
                  {transactions.slice(0, 7).map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone, hint }) {
  const toneClass = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-ink';
  return (
    <div className="bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  );
}
