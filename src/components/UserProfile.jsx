import React from 'react';
import { ArrowLeft, Star, Target, Trophy, ChartLine } from 'lucide-react';

const mockXpBreakdown = [
  { label: 'Trades Simulated', value: 5200, icon: <ChartLine className="w-4 h-4 text-blue-400"/> },
  { label: 'Challenges Won', value: 4300, icon: <Trophy className="w-4 h-4 text-yellow-400"/> },
  { label: 'Daily Streaks', value: 2000, icon: <Star className="w-4 h-4 text-purple-400"/> },
  { label: 'Goals Achieved', value: 800, icon: <Target className="w-4 h-4 text-green-400"/> },
];

export default function UserProfile({ profile, onBack }) {
  const name = profile?.name || 'User';
  const totalXp = mockXpBreakdown.reduce((s, i) => s + i.value, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4"/> Back to Squads
        </button>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="text-gray-400">XP Overview</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {mockXpBreakdown.map((item) => (
              <div key={item.label} className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-white font-semibold">{item.value.toLocaleString()} XP</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
            <span className="text-gray-300">Total</span>
            <span className="text-blue-300 font-semibold">{totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}



