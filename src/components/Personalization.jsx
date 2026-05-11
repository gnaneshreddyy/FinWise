import React, { useMemo, useState } from 'react';

export default function Personalization({ onBack }) {
  const [form, setForm] = useState({
    // Few short text inputs
    primaryGoal: '', // e.g., Reduce eating out by 20%
    monthlyBudget: '',
    motivationAnchor: '', // what they'd do with savings
    proudWin: '', // recent good decision (short)
    // Mostly MCQs
    emotionalTrigger: '', // weekends | stress | sales | boredom
    financialPainPoint: '', // tracking | impulse control | saving | investing
    identityCheck: '', // spender | saver | investor
    rewardStyle: '', // support circles | learning streaks | unlocking features | squad ranking
    savingsCheck: '', // yes | no | partially
    spendingLeakCategory: '', // category name
    nextMonthFocus: '', // short text or select
    categoriesToReduce: [], // multi-select
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => (
    ['Food', 'Entertainment', 'Transportation', 'Shopping', 'Utilities', 'Healthcare', 'Housing', 'Subscriptions']
  ), []);

  const handleCheckbox = (cat) => {
    setForm((f) => {
      const set = new Set(f.categoriesToReduce);
      if (set.has(cat)) set.delete(cat); else set.add(cat);
      return { ...f, categoriesToReduce: Array.from(set) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Non-squad score paths are disabled: personalization no longer grants points.
    // Keep this form as a profile preference capture flow.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-6">Back</button>
        <h1 className="text-3xl font-bold text.white mb-4">Better Personalisation</h1>
        <p className="text-gray-400 mb-6">Quick setup. Mostly choices, a few short answers.</p>
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          {/* Compact grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Primary goal (short)</label>
              <input
                value={form.primaryGoal}
                onChange={(e) => setForm({ ...form, primaryGoal: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
                placeholder="Reduce eating out by 20%"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Monthly budget (₹)</label>
              <input
                type="number"
                value={form.monthlyBudget}
                onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
                placeholder="25000"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Emotional trigger</label>
              <select
                value={form.emotionalTrigger}
                onChange={(e) => setForm({ ...form, emotionalTrigger: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
              >
                <option value="">Select…</option>
                {['weekends', 'stress', 'sales', 'boredom'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Financial pain point</label>
              <select
                value={form.financialPainPoint}
                onChange={(e) => setForm({ ...form, financialPainPoint: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
              >
                <option value="">Select…</option>
                {['tracking', 'impulse control', 'saving', 'investing'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Identity</label>
              <div className="grid grid-cols-3 gap-2 text-gray-300">
                {['spender', 'saver', 'investor'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input type="radio" name="identity" checked={form.identityCheck === opt} onChange={() => setForm({ ...form, identityCheck: opt })} />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Community style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-300">
                {['support circles', 'learning streaks', 'unlocking features', 'squad ranking'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input type="radio" name="rewardstyle" checked={form.rewardStyle === opt} onChange={() => setForm({ ...form, rewardStyle: opt })} />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Spending leak category</label>
              <select
                value={form.spendingLeakCategory}
                onChange={(e) => setForm({ ...form, spendingLeakCategory: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
              >
                <option value="">Select…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Savings check</label>
              <div className="grid grid-cols-3 gap-2 text-gray-300">
                {['yes', 'no', 'partially'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input type="radio" name="savingscheck" checked={form.savingsCheck === opt} onChange={() => setForm({ ...form, savingsCheck: opt })} />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">Categories to reduce</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" checked={form.categoriesToReduce.includes(c)} onChange={() => handleCheckbox(c)} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Motivation anchor (short)</label>
              <input
                value={form.motivationAnchor}
                onChange={(e) => setForm({ ...form, motivationAnchor: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
                placeholder="What you'd do with ₹5,000 saved"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Recent proud win (short)</label>
              <input
                value={form.proudWin}
                onChange={(e) => setForm({ ...form, proudWin: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
                placeholder="One smart decision"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">Next‑month focus (short)</label>
              <input
                value={form.nextMonthFocus}
                onChange={(e) => setForm({ ...form, nextMonthFocus: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"
                placeholder="One habit to improve next month"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white">
              {submitting ? 'Saving…' : 'Save preferences'}
            </button>
            <div className="text-xs text-gray-500">
              Points are now earned only from squad/community participation.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


