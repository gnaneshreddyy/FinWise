import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react';
import { formatCurrency, getMonthlySummaries } from '../services/financeSummary';

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE', '#FB7185'];

export default function Transactions({ transactions = [] }) {
  const monthlySummaries = useMemo(() => getMonthlySummaries(transactions), [transactions]);
  const [selectedMonthKey, setSelectedMonthKey] = useState('');
  const selectedMonth = monthlySummaries.find((month) => month.key === selectedMonthKey) || monthlySummaries[0];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="mt-2 text-sm text-gray-400">Monthly balance movement and expenditure split.</p>
        </header>

        {!selectedMonth ? (
          <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-500" />
            <p className="text-lg font-semibold text-white">No transactions yet</p>
            <p className="mt-1 text-sm text-gray-400">Add earnings or spending from the dashboard to build monthly reports.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected month</p>
                <h2 className="text-2xl font-semibold text-white">{selectedMonth.label}</h2>
              </div>
              <select
                value={selectedMonth.key}
                onChange={(event) => setSelectedMonthKey(event.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                {monthlySummaries.map((month) => (
                  <option key={month.key} value={month.key}>{month.label}</option>
                ))}
              </select>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-5">
              <SummaryCard label="Starting Balance" value={formatCurrency(selectedMonth.startingBalance)} />
              <SummaryCard label="Ending Balance" value={formatCurrency(selectedMonth.endingBalance)} />
              <SummaryCard label="Money Spent" value={formatCurrency(selectedMonth.moneySpent)} tone="red" />
              <SummaryCard label="Money Received" value={formatCurrency(selectedMonth.moneyReceived)} tone="green" />
              <SummaryCard label="Net Expenditure" value={formatCurrency(selectedMonth.netExpenditure)} tone={selectedMonth.netExpenditure >= 0 ? 'red' : 'green'} />
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 lg:col-span-3">
                <h3 className="mb-4 text-lg font-semibold text-white">Monthly Transactions</h3>
                <div className="space-y-3">
                  {selectedMonth.transactions.map((transaction, index) => {
                    const isIncome = transaction.amount >= 0;
                    return (
                      <div key={`${transaction.rawDate}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-800/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isIncome ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                            {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{transaction.name}</p>
                            <p className="text-xs text-gray-400">{transaction.date} - {transaction.category || 'other'}</p>
                          </div>
                        </div>
                        <p className={`font-semibold ${isIncome ? 'text-green-300' : 'text-red-300'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-white">Expenditure Split</h3>
                {selectedMonth.expenseSplit.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedMonth.expenseSplit}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="45%"
                          outerRadius={90}
                          label
                        >
                          {selectedMonth.expenseSplit.map((entry, index) => (
                            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-gray-700 text-center text-sm text-gray-400">
                    No expenditure recorded for this month.
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
  const toneClass =
    tone === 'green'
      ? 'text-green-300'
      : tone === 'red'
        ? 'text-red-300'
        : 'text-white';

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
