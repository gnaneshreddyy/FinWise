import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, getMonthlySummaries } from '../services/financeSummary';
import { categoryLabel } from '../config/categories';
import { chartSeries, chartTooltipStyle } from '../theme';
import TransactionForm from './TransactionForm';
import TransactionRow from './TransactionRow';

export default function Transactions({ transactions = [], onUpdateTransaction, onDeleteTransaction }) {
  const monthlySummaries = useMemo(() => getMonthlySummaries(transactions), [transactions]);
  const [selectedMonthKey, setSelectedMonthKey] = useState('');
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const selectedMonth = monthlySummaries.find((month) => month.key === selectedMonthKey) || monthlySummaries[0];

  const handleDelete = async (transaction) => {
    if (pendingDelete !== transaction.id) {
      setPendingDelete(transaction.id);
      return;
    }
    setPendingDelete(null);
    await onDeleteTransaction?.(transaction.id);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {editing && (
        <TransactionForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(values) => onUpdateTransaction?.(editing.id, values)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Statements</h1>
            <p className="mt-1 text-sm text-ink-muted">Month by month: what you started with, what moved, where it went.</p>
          </div>
          {selectedMonth ? (
            <select
              value={selectedMonth.key}
              onChange={(event) => setSelectedMonthKey(event.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              aria-label="Select month"
            >
              {monthlySummaries.map((month) => (
                <option key={month.key} value={month.key}>{month.label}</option>
              ))}
            </select>
          ) : null}
        </header>

        {!selectedMonth ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-ink-subtle" />
            <p className="text-lg font-semibold">No transactions yet</p>
            <p className="mt-1 text-sm text-ink-muted">Add income or spending from the dashboard to build monthly statements.</p>
          </div>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-5">
              <SummaryCard label="Opening balance" value={formatCurrency(selectedMonth.startingBalance)} />
              <SummaryCard label="Money in" value={formatCurrency(selectedMonth.moneyReceived)} tone="gain" />
              <SummaryCard label="Money out" value={formatCurrency(selectedMonth.moneySpent)} tone="loss" />
              <SummaryCard
                label="Net"
                value={`${selectedMonth.netExpenditure > 0 ? '−' : '+'}${formatCurrency(Math.abs(selectedMonth.netExpenditure))}`}
                tone={selectedMonth.netExpenditure > 0 ? 'loss' : 'gain'}
              />
              <SummaryCard label="Closing balance" value={formatCurrency(selectedMonth.endingBalance)} />
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-line bg-surface p-5 lg:col-span-3">
                <h2 className="mb-2 font-semibold">Transactions</h2>
                <ul className="divide-y divide-line">
                  {[...selectedMonth.transactions].reverse().map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      actions={
                        <div className="ml-1 flex items-center">
                          <button
                            onClick={() => setEditing(transaction)}
                            className="rounded-md p-1.5 text-ink-subtle hover:bg-raised hover:text-ink"
                            aria-label={`Edit ${transaction.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction)}
                            onBlur={() => setPendingDelete(null)}
                            className={`rounded-md p-1.5 text-xs font-medium ${
                              pendingDelete === transaction.id ? 'bg-loss/15 px-2 text-loss' : 'text-ink-subtle hover:bg-raised hover:text-loss'
                            }`}
                            aria-label={`Delete ${transaction.name}`}
                          >
                            {pendingDelete === transaction.id ? 'Confirm' : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      }
                    />
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
                <h2 className="mb-4 font-semibold">Where it went</h2>
                {selectedMonth.expenseSplit.length ? (
                  <>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedMonth.expenseSplit}
                            dataKey="amount"
                            nameKey="category"
                            innerRadius="58%"
                            outerRadius="90%"
                            paddingAngle={2}
                            stroke="none"
                          >
                            {selectedMonth.expenseSplit.map((entry, index) => (
                              <Cell key={entry.category} fill={chartSeries[index % chartSeries.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...chartTooltipStyle} formatter={(value, name) => [formatCurrency(value), categoryLabel(name)]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      {selectedMonth.expenseSplit.map((entry, index) => (
                        <li key={entry.category} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-ink-muted">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chartSeries[index % chartSeries.length] }} />
                            {categoryLabel(entry.category)}
                          </span>
                          <span className="tabular-nums text-ink">{formatCurrency(entry.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-line text-sm text-ink-muted">
                    No spending recorded this month.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-ink';
  return (
    <div className="bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{label}</p>
      <p className={`mt-2 text-lg font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
