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
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-6">
          <ArrowLeft className="w-4 h-4"/> Back to Squads
        </button>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-ink text-xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">{name}</h1>
              <p className="text-accent text-sm">{username}</p>
              <p className="text-ink-muted">Community profile</p>
              {email && <p className="text-xs text-ink-subtle mt-1">{email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-raised/60 rounded-xl p-4 border border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-accent"/>
                <span className="text-ink-muted">Squad</span>
              </div>
              <span className="text-ink font-semibold">{squadId ? `@${squadId}` : 'None'}</span>
            </div>
            <div className="bg-raised/60 rounded-xl p-4 border border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-warn"/>
                <span className="text-ink-muted">Role</span>
              </div>
              <span className="text-ink font-semibold capitalize">{squadRole}</span>
            </div>
            <div className="bg-raised/60 rounded-xl p-4 border border-line flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-accent"/>
                  <span className="text-ink-muted">Squad actions completed</span>
                </div>
                <span className="text-ink font-semibold">{actions.length}</span>
              </div>
          </div>

          <div className="bg-raised/60 rounded-xl p-4 border border-line flex items-center justify-between">
            <span className="text-ink-muted">Total Community Points</span>
            <span className="text-accent font-semibold">{totalPoints.toLocaleString()} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}



