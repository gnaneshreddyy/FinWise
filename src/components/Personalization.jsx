import React, { useMemo, useState } from 'react';

// Reuse sample expenses for now; replace with real user data when available
const sampleExpenses = [
  { date: '2024-03-01', category: 'Food', amount: 42 },
  { date: '2024-03-08', category: 'Entertainment', amount: 80 },
  { date: '2024-03-15', category: 'Transportation', amount: 25 },
  { date: '2024-03-22', category: 'Food', amount: 55 },
  { date: '2024-04-01', category: 'Food', amount: 40 },
  { date: '2024-04-08', category: 'Entertainment', amount: 60 },
  { date: '2024-04-15', category: 'Transportation', amount: 22 },
  { date: '2024-04-22', category: 'Food', amount: 50 },
];

export default function Personalization({ onBack, onRewardsGenerated }) {
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
    rewardStyle: '', // xp/levels | badges | unlocking features | squad ranking
    savingsCheck: '', // yes | no | partially
    spendingLeakCategory: '', // category name
    nextMonthFocus: '', // short text or select
    categoriesToReduce: [], // multi-select
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const GEMINI_API_KEY = 'AIzaSyBlAmW_WeRgVIC0tqL3wIFiViZkcBpdwEM';

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
    setError(null);

    // Prepare payload for Gemini: goals, answers, expense history
    const payload = {
      answers: form,
      expenseHistory: sampleExpenses,
      comparisonWindow: { prevMonths: 1, recentWeeks: 4 },
      request: 'Analyze accomplishments vs previous periods, compute notable improvements (e.g., % category reductions), and assign reward points with brief rationale.'
    };

    const systemPrompt = `You are a finance coach and rewards engine. Given user's personalization answers and expense history, return strict JSON with fields: accomplishments (array of strings), rewards (array of { id, title, points, reason }). Base accomplishments on measurable improvements (e.g., 10% less on category X vs prior month). Keep total points between 100 and 1000.`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\nINPUT:\n${JSON.stringify(payload)}` }] }],
        }),
      });
      if (!res.ok) throw new Error('Gemini request failed');
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }

      const rewards = parsed?.rewards && Array.isArray(parsed.rewards) ? parsed.rewards : [
        { id: 'fallback-1', title: 'Great Start!', points: 200, reason: 'Completed personalization to unlock tailored goals.' }
      ];
      onRewardsGenerated?.(rewards);
    } catch (err) {
      setError(err.message);
      onRewardsGenerated?.([
        { id: 'fallback-1', title: 'Great Start!', points: 200, reason: 'Completed personalization to unlock tailored goals.' }
      ]);
    } finally {
      setSubmitting(false);
    }
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
              <label className="block text-sm text-gray-300 mb-2">Reward style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-300">
                {['xp/levels', 'badges', 'unlocking features', 'squad ranking'].map((opt) => (
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

          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
            <button type="button" onClick={() => onRewardsGenerated?.([{ id: 'quick', title: 'Quick Start', points: 100, reason: 'Started personalisation.' }])} className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
              Skip (Demo Reward)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


