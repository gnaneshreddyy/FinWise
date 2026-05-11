import React from 'react';
import { ArrowLeft, Gift } from 'lucide-react';

export default function Rewards({ onBack, profile }) {
  const points = Number(profile?.points?.total || 0);
  const actions = Array.isArray(profile?.points?.actions) ? profile.points.actions : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Community Points</h1>
          <p className="text-gray-400 mb-4">
            Only squad/community actions award points now.
          </p>
          <div className="mb-6 rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 flex items-center justify-between">
            <span className="text-gray-300">Total Community Points</span>
            <span className="text-blue-300 text-xl font-semibold">{points} pts</span>
          </div>
          <div className="space-y-3">
            {actions.length === 0 && (
              <div className="text-gray-400">No squad actions yet. Create, invite, or join by username to earn points.</div>
            )}
            {actions.map((r, index) => (
              <div key={`${r.key}-${index}`} className="flex items-center justify-between bg-gray-800/60 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-pink-400"/>
                  <div>
                    <div className="text-white font-medium">{r.label}</div>
                    {r.metadata?.squadId && <div className="text-sm text-gray-400">Squad: @{r.metadata.squadId}</div>}
                    {r.metadata?.username && <div className="text-sm text-gray-400">Invited: @{r.metadata.username}</div>}
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



