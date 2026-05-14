import React, { useEffect, useMemo, useState } from 'react';
import { Users, Crown, PlusCircle, Search, UserPlus, ShieldAlert } from 'lucide-react';
import {
  createOrOwnSquad,
  getSquadForUser,
  inviteUserByUsername,
  joinSquadByUsername,
  SQUAD_POINT_ACTIONS,
} from '../services/squadService';

export default function Squads({ currentUser, currentUserProfile, onOpenProfile, onGoToRewards, onProfileUpdated }) {
  const [inviteUsername, setInviteUsername] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSquad, setCurrentSquad] = useState(null);

  const profilePoints = Number(currentUserProfile?.points?.total || 0);

  const loadSquad = async (profile = currentUserProfile) => {
    if (!profile) {
      setCurrentSquad(null);
      return;
    }
    const squad = await getSquadForUser(profile);
    setCurrentSquad(squad);
  };

  useEffect(() => {
    loadSquad().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserProfile?.uid, currentUserProfile?.squadId]);

  const leaderboard = useMemo(
    () => (currentSquad?.members ? [...currentSquad.members].sort((a, b) => b.points - a.points) : []),
    [currentSquad]
  );

  const runAction = async (runner) => {
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const result = await runner();
      const updatedProfile = await onProfileUpdated?.();
      await loadSquad(updatedProfile || currentUserProfile);
      setStatus(result || 'Action completed.');
    } catch (err) {
      setError(err.message || 'Unable to complete this action.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrOwnSquad = () => {
    runAction(async () => {
      const result = await createOrOwnSquad(currentUserProfile);
      return result.created
        ? `Squad @${result.squadId} created. +${SQUAD_POINT_ACTIONS.CREATE_SQUAD.points} pts`
        : `You already own squad @${result.squadId}.`;
    });
  };

  const handleInvite = () => {
    runAction(async () => {
      const result = await inviteUserByUsername(currentUserProfile, inviteUsername);
      setInviteUsername('');
      if (!result.invited) return 'This username is already invited or already a member.';
      return `Invite sent. +${SQUAD_POINT_ACTIONS.INVITE_MEMBER.points} pts`;
    });
  };

  const handleJoin = () => {
    runAction(async () => {
      const result = await joinSquadByUsername(currentUserProfile, joinUsername);
      setJoinUsername('');
      if (!result.joined) return 'You are already in that squad.';
      return `Joined @${result.squadId}. +${SQUAD_POINT_ACTIONS.JOIN_SQUAD.points} pts`;
    });
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

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-gray-400">Signed in as</div>
              <div className="text-white font-medium">{currentUserProfile?.username ? `@${currentUserProfile.username}` : currentUser?.email}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Community points (squad-only)</div>
              <div className="text-blue-300 text-xl font-semibold">{profilePoints} pts</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-blue-400"/> Own a Squad</h2>
            <p className="text-sm text-gray-400 mb-4">Create your squad if missing (keyed by your username).</p>
            <button
              onClick={handleCreateOrOwnSquad}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm"
            >
              Create / Own Squad
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-purple-400"/> Invite by Username</h2>
            <p className="text-sm text-gray-400 mb-4">Invite another user to your squad by username.</p>
            <div className="flex items-center gap-2">
              <input
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="@username"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 outline-none"
              />
              <button
                onClick={handleInvite}
                disabled={loading || !inviteUsername.trim()}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm"
              >
                Invite
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-green-400"/> Join by Username</h2>
          <p className="text-sm text-gray-400 mb-4">Join a squad using owner username (squad id is owner username).</p>
          <div className="flex items-center gap-2">
            <input
              value={joinUsername}
              onChange={(e) => setJoinUsername(e.target.value)}
              placeholder="@ownerUsername"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 outline-none"
            />
            <button
              onClick={handleJoin}
              disabled={loading || !joinUsername.trim()}
              className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm"
            >
              Join Squad
            </button>
          </div>
        </div>

        {(status || error) && (
          <div className={`mb-6 p-3 rounded-lg border ${error ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-green-950/20 border-green-900/40 text-green-300'}`}>
            {error ? <span className="inline-flex items-center gap-2"><ShieldAlert className="w-4 h-4"/>{error}</span> : status}
          </div>
        )}

        {currentSquad && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Squad @{currentSquad.squadId}</h2>
              <div className="text-xs text-gray-400">Owner: @{currentSquad.ownerUsername}</div>
            </div>
            <div className="space-y-2">
              {leaderboard.map((m, idx) => (
                <div key={m.uid} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-5 text-right">{idx + 1}</span>
                    <span className="text-white font-medium flex items-center gap-2">
                      {idx === 0 && <Crown className="w-4 h-4 text-yellow-400"/>}
                      <button onClick={() => onOpenProfile && onOpenProfile(m)} className="hover:underline">
                        {m.name} {m.username ? `(@${m.username})` : ''}
                      </button>
                    </span>
                  </div>
                  <span className="text-blue-300 font-semibold">{m.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Only squad actions award points: create squad, invite by username, join by username.
            </p>
          </div>
        )}

        {!currentSquad && (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-5 text-gray-400">
            You are not in a squad yet. Create your squad or join one by owner username.
          </div>
        )}
      </div>
    </div>
  );
}


