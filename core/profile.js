const USERNAME_MAX_BASE_LENGTH = 18;

function sanitizeUsernameBase(name = '') {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return normalized ? normalized.slice(0, USERNAME_MAX_BASE_LENGTH) : 'finwise_user';
}

function hashUid(uid = '') {
  let hash = 0;
  for (let i = 0; i < uid.length; i += 1) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).padStart(7, '0');
}

// `attempt` lengthens the suffix when a username is already taken.
export function buildUsernameFromName(name, uid, attempt = 0) {
  const hash = hashUid(uid);
  const suffix = attempt === 0 ? hash.slice(-4) : `${hash.slice(-4)}${uid.slice(0, attempt + 1).toLowerCase().replace(/[^a-z0-9]/g, '0')}`;
  return `${sanitizeUsernameBase(name)}_${suffix}`;
}

export function normalizeUsername(value = '') {
  return String(value).trim().replace(/^@+/, '').toLowerCase();
}

// Points are awarded only on the server, for squad actions.
export const SQUAD_POINT_ACTIONS = Object.freeze({
  create: { key: 'create_squad', label: 'Created a squad', points: 50 },
  invite: { key: 'invite_member', label: 'Invited a member by username', points: 20 },
  join: { key: 'join_squad', label: 'Joined a squad by username', points: 30 },
});
