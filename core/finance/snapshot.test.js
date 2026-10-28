import { describe, expect, it } from 'vitest';
import { buildFinancialSnapshot, normalizeTransactions, aggregateExpenses } from './snapshot.js';
import { normalizeDateKey, shiftMonthKey } from './dates.js';

const now = new Date(2026, 9, 20, 12, 0); // 20 Oct 2026, local time

const transactions = [
  { date: '2026-10-01', amount: 40000, category: 'salary', description: 'Salary' },
  { date: '2026-10-03', amount: -12000, category: 'rent', description: 'Rent' },
  { date: '2026-10-10', amount: -3000, category: 'Food', description: 'Swiggy' },
  { date: '2026-09-01', amount: 40000, category: 'salary' },
  { date: '2026-09-05', amount: -2000, category: 'food' },
  { date: '2026-09-06', amount: -10000, category: 'rent' },
  { date: '2026-08-01', amount: 30000, category: 'salary' },
  { date: '2026-08-02', amount: -15000, category: 'rent' },
];

describe('dates', () => {
  it('keeps the written calendar day for local datetimes', () => {
    expect(normalizeDateKey('2026-10-28T01:30')).toBe('2026-10-28');
    expect(normalizeDateKey('2026-10-28')).toBe('2026-10-28');
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
    expect(shiftMonthKey('2025-12', 1)).toBe('2026-01');
  });
});

describe('buildFinancialSnapshot', () => {
  const snapshot = buildFinancialSnapshot(transactions, { now });

  it('summarises the current month only', () => {
    expect(snapshot.current_month.month).toBe('2026-10');
    expect(snapshot.current_month.income).toBe(40000);
    expect(snapshot.current_month.expenses).toBe(15000);
    expect(snapshot.current_month.savings_rate).toBe(0.63);
  });

  it('projects month-end spending from the daily pace', () => {
    expect(snapshot.current_month.days_elapsed).toBe(20);
    expect(snapshot.current_month.projected_expenses).toBe(23250);
  });

  it('averages complete months for the savings rate instead of mixing all-time totals', () => {
    expect(snapshot.trailing_average.months_used).toEqual(['2026-09', '2026-08']);
    expect(snapshot.trailing_average.monthly_income).toBe(35000);
    expect(snapshot.trailing_average.monthly_expenses).toBe(13500);
    expect(snapshot.trailing_average.savings_rate).toBe(0.61);
  });

  it('compares categories with the previous month', () => {
    const food = snapshot.category_changes.find((row) => row.category === 'food');
    expect(food).toEqual({ category: 'food', current_month: 3000, previous_month: 2000, change_pct: 0.5 });
  });

  it('reports all-time balance', () => {
    expect(snapshot.all_time.net_balance).toBe(68000);
    expect(snapshot.all_time.first_transaction_date).toBe('2026-08-01');
  });

  it('handles an empty history', () => {
    const empty = buildFinancialSnapshot([], { now });
    expect(empty.has_data).toBe(false);
    expect(empty.current_month.savings_rate).toBeNull();
    expect(empty.trailing_average.months_used).toEqual([]);
  });
});

describe('normalizeTransactions', () => {
  it('drops unusable rows and lowercases categories', () => {
    const rows = normalizeTransactions([
      { date: 'not a date', amount: -10 },
      { date: '2026-10-01', amount: 'abc' },
      { rawDate: '2026-10-02T09:00', amount: -50, category: ' Transport ', name: 'Auto' },
    ]);
    expect(rows).toEqual([{ date: '2026-10-02', amount: -50, category: 'transport', description: 'Auto' }]);
  });
});

describe('aggregateExpenses', () => {
  it('groups spending by category and month', () => {
    const result = aggregateExpenses(transactions);
    expect(result.count).toBe(5);
    expect(result.byCategory[0]).toEqual({ category: 'rent', total: 37000 });
    expect(result.byMonth.map((row) => row.month)).toEqual(['2026-08', '2026-09', '2026-10']);
  });
});
