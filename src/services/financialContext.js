function getTransactionDate(transaction) {
  const date = new Date(transaction.rawDate || transaction.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinDays(date, days) {
  if (!date) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function normalizeCategory(category = '') {
  return category.trim().toLowerCase() || 'other';
}

export function buildFinancialContext({ user = null, profile = null, transactions = [] } = {}) {
  const spendingCategories = {};
  const incomeCategories = {};
  const recentTransactions = [];
  let totalExpenses = 0;
  let totalIncome = 0;
  let last30DayExpenses = 0;
  let alcoholSpendingLast30Days = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    const absoluteAmount = Math.abs(amount);
    const category = normalizeCategory(transaction.category || transaction.name || 'other');
    const date = getTransactionDate(transaction);
    const isExpense = amount < 0;

    recentTransactions.push({
      date: date ? date.toISOString().slice(0, 10) : transaction.date || 'unknown',
      category,
      amount,
      description: transaction.description || transaction.name || '',
    });

    if (isExpense) {
      totalExpenses += absoluteAmount;
      spendingCategories[category] = (spendingCategories[category] || 0) + absoluteAmount;

      if (isWithinDays(date, 30)) {
        last30DayExpenses += absoluteAmount;
        if (category.includes('alcohol') || category.includes('drink')) {
          alcoholSpendingLast30Days += absoluteAmount;
        }
      }
    } else {
      totalIncome += amount;
      incomeCategories[category] = (incomeCategories[category] || 0) + amount;
    }
  });

  const monthlyIncome = Number(profile?.monthlyIncome) || totalIncome;
  const debt = Number(profile?.debt) || 0;
  const monthlySavings = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? Number((monthlySavings / monthlyIncome).toFixed(2)) : 0;
  const highRiskCategories = [];

  if (monthlyIncome > 0 && alcoholSpendingLast30Days > monthlyIncome * 0.1) {
    highRiskCategories.push('alcohol');
  }

  return {
    user: {
      uid: user?.uid || profile?.uid || null,
      name: profile?.fullName || user?.displayName || user?.email?.split('@')?.[0] || 'User',
    },
    financial_summary: {
      monthly_income: monthlyIncome,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      monthly_savings: monthlySavings,
      debt,
      spending_categories: spendingCategories,
      income_categories: incomeCategories,
      last_30_day_expenses: last30DayExpenses,
      alcohol_spending_last_30_days: alcoholSpendingLast30Days,
      financial_goals: profile?.financialGoals || [],
    },
    behavioral_signals: {
      savings_rate: savingsRate,
      high_risk_categories: highRiskCategories,
      transaction_count: transactions.length,
    },
    recent_transactions: recentTransactions
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20),
  };
}
