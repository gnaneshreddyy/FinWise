import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../config/categories';
import { toDateTimeInputValue } from '../../../core/finance/dates.js';

const inputClass =
  'w-full rounded-lg border border-line bg-raised px-3.5 py-2.5 text-ink placeholder-ink-subtle transition-colors focus:border-accent focus:outline-none';

// Add or edit a transaction. `initial` switches it into edit mode.
export default function TransactionForm({ initial = null, onClose, onSubmit }) {
  const [direction, setDirection] = useState(initial && initial.amount > 0 ? 'inflow' : 'outflow');
  const [amount, setAmount] = useState(initial ? String(Math.abs(initial.amount)) : '');
  const [category, setCategory] = useState(initial?.category || 'food');
  const [dateTime, setDateTime] = useState(initial?.rawDate?.slice(0, 16) || toDateTimeInputValue());
  const [description, setDescription] = useState(initial?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = direction === 'inflow' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!categories.some((item) => item.value === category)) setCategory(categories[0].value);
  }, [categories, category]);

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        amount: direction === 'inflow' ? value : -value,
        category,
        rawDate: dateTime,
        description,
      });
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Could not save. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-surface p-6 shadow-2xl shadow-black/40"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="transaction-form-title" className="text-lg font-semibold text-ink">
            {initial ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-raised hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-raised p-1">
          {[
            { id: 'outflow', label: 'Money out', Icon: ArrowDownLeft, active: 'bg-loss/15 text-loss' },
            { id: 'inflow', label: 'Money in', Icon: ArrowUpRight, active: 'bg-gain/15 text-gain' },
          ].map(({ id, label, Icon, active }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDirection(id)}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                direction === id ? active : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-ink-muted">Amount</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">₹</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={`${inputClass} pl-8 tabular-nums`}
                placeholder="0"
                step="0.01"
                min="0"
                required
                autoFocus
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-ink-muted">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-ink-muted">Date and time</span>
            <input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} className={inputClass} required />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-ink-muted">Note <span className="text-ink-subtle">(optional)</span></span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
              placeholder="e.g. Swiggy, auto to office"
              maxLength={200}
            />
          </label>

          {error ? <p className="text-sm text-loss">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line-strong py-2.5 font-medium text-ink hover:bg-raised">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-accent py-2.5 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
