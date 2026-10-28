import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../services/financeSummary';
import { categoryLabel } from '../config/categories';

export default function TransactionRow({ transaction, actions = null }) {
  const isIncome = transaction.amount >= 0;
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isIncome ? 'bg-gain/10 text-gain' : 'bg-raised text-ink-muted'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{transaction.name}</p>
          <p className="text-xs text-ink-subtle">
            {transaction.date} · {categoryLabel(transaction.category)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`font-medium tabular-nums ${isIncome ? 'text-gain' : 'text-ink'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(Math.abs(transaction.amount))}
        </span>
        {actions}
      </div>
    </li>
  );
}
