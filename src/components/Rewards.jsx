import React from 'react';
import { ArrowLeft, Gift, BadgeCheck, Calendar } from 'lucide-react';

const mockRewards = [
  { id: 'r1', title: 'Weekly Top Trader', date: '2025-09-15', points: 500, icon: <BadgeCheck className="w-4 h-4 text-green-400"/> },
  { id: 'r2', title: 'Challenge Winner', date: '2025-09-01', points: 300, icon: <Gift className="w-4 h-4 text-pink-400"/> },
  { id: 'r3', title: 'Streak Milestone', date: '2025-08-20', points: 200, icon: <Calendar className="w-4 h-4 text-blue-400"/> },
];

export default function Rewards({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Rewards History</h1>
          <div className="space-y-3">
            {mockRewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-gray-800/60 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  {r.icon}
                  <div>
                    <div className="text-white font-medium">{r.title}</div>
                    <div className="text-sm text-gray-400">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-blue-300 font-semibold">+{r.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



