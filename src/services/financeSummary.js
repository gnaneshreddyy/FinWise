export const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

function getTransactionDate(transaction) {
  const parsed = new Date(transaction.rawDate || transaction.date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

export function getCurrentBalance(transactions = []) {
  if (!transactions.length) return null;
  return transactions.reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
}

export function getMonthlySummaries(transactions = []) {
  const sorted = [...transactions]
    .map((transaction) => ({ transaction, date: getTransactionDate(transaction) }))
    .filter(({ date }) => date)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let runningBalance = 0;
  const summaries = new Map();

  sorted.forEach(({ transaction, date }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!summaries.has(key)) {
      summaries.set(key, {
        key,
        label: monthFormatter.format(date),
        startingBalance: runningBalance,
        endingBalance: runningBalance,
        moneySpent: 0,
        moneyReceived: 0,
        netExpenditure: 0,
        expenseCategories: new Map(),
        transactions: [],
      });
    }

    const amount = Number(transaction.amount) || 0;
    const summary = summaries.get(key);

    if (amount >= 0) {
      summary.moneyReceived += amount;
    } else {
      const spent = Math.abs(amount);
      const category = transaction.category || 'other';
      summary.moneySpent += spent;
      summary.expenseCategories.set(category, (summary.expenseCategories.get(category) || 0) + spent);
    }

    runningBalance += amount;
    summary.endingBalance = runningBalance;
    summary.netExpenditure = summary.moneySpent - summary.moneyReceived;
    summary.transactions.push(transaction);
  });

  return Array.from(summaries.values())
    .map((summary) => ({
      ...summary,
      expenseSplit: Array.from(summary.expenseCategories, ([category, amount]) => ({
        category,
        amount,
      })).sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
}
