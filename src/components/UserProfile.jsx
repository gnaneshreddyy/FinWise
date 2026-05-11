import React from 'react';
import { ArrowLeft, Users, Trophy } from 'lucide-react';

export default function UserProfile({ profile, onBack }) {
  const name = profile?.fullName || profile?.name || 'User';
  const username = profile?.username ? `@${profile.username}` : '@user';
  const email = profile?.email || null;
  const totalPoints = Number(profile?.points?.total || profile?.points || 0);
  const squadId = profile?.squadId || null;
  const squadRole = profile?.squadRole || 'member';
  const actions = Array.isArray(profile?.points?.actions) ? profile.points.actions : [];

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
              <p className="text-blue-300 text-sm">{username}</p>
              <p className="text-gray-400">Community profile</p>
              {email && <p className="text-xs text-gray-500 mt-1">{email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-400"/>
                <span className="text-gray-300">Squad</span>
              </div>
              <span className="text-white font-semibold">{squadId ? `@${squadId}` : 'None'}</span>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-yellow-400"/>
                <span className="text-gray-300">Role</span>
              </div>
              <span className="text-white font-semibold capitalize">{squadRole}</span>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-blue-400"/>
                  <span className="text-gray-300">Squad actions completed</span>
                </div>
                <span className="text-white font-semibold">{actions.length}</span>
              </div>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
            <span className="text-gray-300">Total Community Points</span>
            <span className="text-blue-300 font-semibold">{totalPoints.toLocaleString()} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}



