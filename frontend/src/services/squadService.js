import { api } from './backendApi';
import { SQUAD_POINT_ACTIONS as POINTS } from '../../../core/profile.js';

// Squad rules and point awards live on the server (api/_lib/squadStore.js).
// Point values are shared with the server so the UI shows what was actually awarded.
export const SQUAD_POINT_ACTIONS = Object.freeze({
  CREATE_SQUAD: POINTS.create,
  INVITE_MEMBER: POINTS.invite,
  JOIN_SQUAD: POINTS.join,
});

export function createOrOwnSquad() {
  return api.post('/squads', { action: 'create' });
}

export function inviteUserByUsername(_profile, username) {
  return api.post('/squads', { action: 'invite', username });
}

export function joinSquadByUsername(_profile, username) {
  return api.post('/squads', { action: 'join', username });
}

export async function getSquadForUser(profile) {
  if (!profile?.squadId) return null;
  const { squad } = await api.get('/squads');
  return squad;
}
