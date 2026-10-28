import React from 'react';
import { ArrowLeft, Gift } from 'lucide-react';

export default function Rewards({ onBack, profile }) {
  const points = Number(profile?.points?.total || 0);
  const actions = Array.isArray(profile?.points?.actions) ? profile.points.actions : [];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-6">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-ink mb-2">Community Points</h1>
          <p className="text-ink-muted mb-4">
            Only squad/community actions award points now.
          </p>
          <div className="mb-6 rounded-xl border border-accent/40 bg-accent/20 p-4 flex items-center justify-between">
            <span className="text-ink-muted">Total Community Points</span>
            <span className="text-accent text-xl font-semibold">{points} pts</span>
          </div>
          <div className="space-y-3">
            {actions.length === 0 && (
              <div className="text-ink-muted">No squad actions yet. Create, invite, or join by username to earn points.</div>
            )}
            {actions.map((r, index) => (
              <div key={`${r.key}-${index}`} className="flex items-center justify-between bg-raised/60 rounded-xl p-4 border border-line">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-accent"/>
                  <div>
                    <div className="text-ink font-medium">{r.label}</div>
                    {r.metadata?.squadId && <div className="text-sm text-ink-muted">Squad: @{r.metadata.squadId}</div>}
                    {r.metadata?.username && <div className="text-sm text-ink-muted">Invited: @{r.metadata.username}</div>}
                  </div>
                </div>
                <div className="text-accent font-semibold">+{r.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



