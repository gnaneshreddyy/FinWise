import { daysInMonth, monthKeyOf, normalizeDateKey, shiftMonthKey, toDateKey } from './dates.js';

// Deterministic financial summary. Every number the AI is allowed to quote comes
// from here, so the model narrates figures instead of computing them.

const round = (value) => Math.round(value * 100) / 100;

export function normalizeCategory(category) {
  const value = typeof category === 'string' ? category.trim().toLowerCase() : '';
  return value || 'other';
}

// Coerce any stored or UI transaction into { date, amount, category, description }.
export function normalizeTransactions(transactions = []) {
  return transactions
    .map((transaction) => {
      const date = normalizeDateKey(transaction.date ?? transaction.rawDate);
      const amount = Number(transaction.amount);
      if (!date || !Number.isFinite(amount) || amount === 0) return null;
      return {
        date,
        amount,
        category: normalizeCategory(transaction.category),
        description: String(transaction.description || transaction.name || '').slice(0, 120),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function summarizeMonth(rows) {
  let income = 0;
  let expenses = 0;
  const byCategory = new Map();

  rows.forEach((row) => {
    if (row.amount > 0) {
      income += row.amount;
      return;
    }
    const spent = -row.amount;
    expenses += spent;
    byCategory.set(row.category, (byCategory.get(row.category) || 0) + spent);
  });

  return {
    income: round(income),
    expenses: round(expenses),
    net: round(income - expenses),
    transaction_count: rows.length,
    by_category: Array.from(byCategory, ([category, amount]) => ({
      category,
      amount: round(amount),
      share: expenses > 0 ? round(amount / expenses) : 0,
    })).sort((a, b) => b.amount - a.amount),
  };
}

function savingsRate(income, expenses) {
  return income > 0 ? round((income - expenses) / income) : null;
}

export function buildFinancialSnapshot(transactions = [], { now = new Date(), profile = null } = {}) {
  const rows = normalizeTransactions(transactions);
  const asOf = toDateKey(now);
  const currentMonth = monthKeyOf(asOf);
  const previousMonth = shiftMonthKey(currentMonth, -1);

  const byMonth = new Map();
  rows.forEach((row) => {
    const key = monthKeyOf(row.date);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(row);
  });

  const current = summarizeMonth(byMonth.get(currentMonth) || []);
  const previous = summarizeMonth(byMonth.get(previousMonth) || []);

  // Average over the last three complete months that have any data.
  const trailingKeys = [1, 2, 3].map((offset) => shiftMonthKey(currentMonth, -offset)).filter((key) => byMonth.has(key));
  const trailing = trailingKeys.map((key) => summarizeMonth(byMonth.get(key)));
  const avgIncome = trailing.length ? trailing.reduce((sum, month) => sum + month.income, 0) / trailing.length : 0;
  const avgExpenses = trailing.length ? trailing.reduce((sum, month) => sum + month.expenses, 0) / trailing.length : 0;

  const allTime = summarizeMonth(rows);
  const previousByCategory = new Map(previous.by_category.map((row) => [row.category, row.amount]));
  const categoryChanges = current.by_category.map((row) => {
    const before = previousByCategory.get(row.category) || 0;
    return {
      category: row.category,
      current_month: row.amount,
      previous_month: before,
      change_pct: before > 0 ? round((row.amount - before) / before) : null,
    };
  });

  const elapsed = Number(asOf.slice(8, 10));
  const totalDays = daysInMonth(currentMonth);

  return {
    as_of: asOf,
    currency: 'INR',
    has_data: rows.length > 0,
    all_time: {
      income: allTime.income,
      expenses: allTime.expenses,
      net_balance: allTime.net,
      transaction_count: rows.length,
      first_transaction_date: rows.length ? rows[rows.length - 1].date : null,
    },
    current_month: {
      month: currentMonth,
      days_elapsed: elapsed,
      days_in_month: totalDays,
      ...current,
      savings_rate: savingsRate(current.income, current.expenses),
      // Straight-line projection of this month's spending; null until a few days in.
      projected_expenses: elapsed >= 5 ? round((current.expenses / elapsed) * totalDays) : null,
    },
    previous_month: {
      month: previousMonth,
      ...previous,
      savings_rate: savingsRate(previous.income, previous.expenses),
    },
    trailing_average: {
      months_used: trailingKeys,
      monthly_income: round(avgIncome),
      monthly_expenses: round(avgExpenses),
      savings_rate: savingsRate(avgIncome, avgExpenses),
    },
    category_changes: categoryChanges,
    largest_expenses_this_month: (byMonth.get(currentMonth) || [])
      .filter((row) => row.amount < 0)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 5)
      .map((row) => ({ ...row, amount: round(-row.amount) })),
    recent_transactions: rows.slice(0, 15),
    profile: {
      stated_monthly_income: Number(profile?.monthlyIncome) || null,
      debt: Number(profile?.debt) || null,
      goals: Array.isArray(profile?.financialGoals) ? profile.financialGoals.slice(0, 5) : [],
    },
  };
}

// Month-level series used by the insights charts.
export function aggregateExpenses(transactions = []) {
  const expenses = normalizeTransactions(transactions).filter((row) => row.amount < 0);
  const byCategory = new Map();
  const byMonth = new Map();

  expenses.forEach((row) => {
    const spent = -row.amount;
    byCategory.set(row.category, (byCategory.get(row.category) || 0) + spent);
    const month = monthKeyOf(row.date);
    byMonth.set(month, (byMonth.get(month) || 0) + spent);
  });

  return {
    count: expenses.length,
    byCategory: Array.from(byCategory, ([category, total]) => ({ category, total: round(total) })).sort((a, b) => b.total - a.total),
    byMonth: Array.from(byMonth, ([month, total]) => ({ month, total: round(total) })).sort((a, b) => a.month.localeCompare(b.month)),
  };
}
