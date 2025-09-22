import React, { useState } from 'react';
import { Users, Crown, LogOut, PlusCircle, Search } from 'lucide-react';

const mockSquads = [
  {
    id: 'alpha',
    name: 'Alpha Traders',
    members: [
      { id: 'u1', name: 'Ava', xp: 12450 },
      { id: 'u2', name: 'Ben', xp: 11120 },
      { id: 'u3', name: 'Cara', xp: 9800 },
    ],
  },
  {
    id: 'beta',
    name: 'Beta Bulls',
    members: [
      { id: 'u4', name: 'Dev', xp: 13370 },
      { id: 'u5', name: 'Eli', xp: 9050 },
    ],
  },
];

export default function Squads({ currentUser, onOpenProfile, onGoToRewards }) {
  const [squads, setSquads] = useState(mockSquads);
  const [query, setQuery] = useState('');

  const handleLeave = (squadId) => {
    setSquads((prev) => prev.filter((s) => s.id !== squadId));
  };

  const handleJoin = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setSquads((prev) => [...prev, { id, name, members: [{ id: 'me', name: currentUser?.email || 'You', xp: 0 }] }]);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Users className="w-7 h-7 text-blue-400"/> Squads</h1>
          <div className="flex items-center gap-2">
            <button onClick={onGoToRewards} className="px-3 py-2 rounded-lg border border-gray-800 hover:bg-gray-900 text-sm">Rewards</button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500"/>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find or create a squad..."
              className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500"
            />
            <button
              onClick={() => query.trim() && handleJoin(query.trim())}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <PlusCircle className="w-4 h-4"/> Join/Create
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {squads.map((squad) => {
            const leaderboard = [...squad.members].sort((a, b) => b.xp - a.xp);
            return (
              <div key={squad.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{squad.name}</h2>
                  <button
                    onClick={() => handleLeave(squad.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-gray-800 hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4"/> Leave
                  </button>
                </div>
                <div className="space-y-2">
                  {leaderboard.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-5 text-right">{idx + 1}</span>
                        <span className="text-white font-medium flex items-center gap-2">
                          {idx === 0 && <Crown className="w-4 h-4 text-yellow-400"/>}
                          <button onClick={() => onOpenProfile && onOpenProfile(m)} className="hover:underline">
                            {m.name}
                          </button>
                        </span>
                      </div>
                      <span className="text-blue-300 font-semibold">{m.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



