import {
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  collection,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Single scoring model: points are awarded only for squad/community participation actions.
export const SQUAD_POINT_ACTIONS = Object.freeze({
  CREATE_SQUAD: { key: 'create_squad', label: 'Created a squad', points: 50 },
  INVITE_MEMBER: { key: 'invite_member', label: 'Invited a member by username', points: 20 },
  JOIN_SQUAD: { key: 'join_squad', label: 'Joined a squad by username', points: 30 },
});

function normalizeUsername(value = '') {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

function actionTimestamp() {
  return new Date().toISOString();
}

function emptyPointsState() {
  return {
    total: 0,
    actions: [],
  };
}

function profileWithPoints(profile = {}) {
  const points = profile.points && typeof profile.points === 'object' ? profile.points : emptyPointsState();
  return {
    ...profile,
    points: {
      total: Number(points.total || 0),
      actions: Array.isArray(points.actions) ? points.actions : [],
    },
  };
}

function buildActionEntry(action, metadata = {}) {
  return {
    key: action.key,
    label: action.label,
    points: action.points,
    createdAt: actionTimestamp(),
    metadata,
  };
}

function applyPoints(existingProfile, action, metadata = {}) {
  const current = profileWithPoints(existingProfile).points;
  return {
    total: current.total + action.points,
    actions: [buildActionEntry(action, metadata), ...current.actions].slice(0, 50),
  };
}

export async function createOrOwnSquad(ownerProfile) {
  if (!ownerProfile?.uid || !ownerProfile?.username) {
    throw new Error('Signed-in profile is missing username details.');
  }

  const ownerUsername = normalizeUsername(ownerProfile.username);
  const squadRef = doc(db, 'squads', ownerUsername);
  const ownerRef = doc(db, 'users', ownerProfile.uid);

  return runTransaction(db, async (transaction) => {
    const squadSnap = await transaction.get(squadRef);
    const ownerSnap = await transaction.get(ownerRef);
    if (!ownerSnap.exists()) {
      throw new Error('Owner profile does not exist.');
    }

    const ownerData = profileWithPoints(ownerSnap.data());
    const now = serverTimestamp();

    if (!squadSnap.exists()) {
      transaction.set(squadRef, {
        squadId: ownerUsername,
        ownerUid: ownerProfile.uid,
        ownerUsername,
        memberUids: [ownerProfile.uid],
        memberUsernames: [ownerUsername],
        invitedUsernames: [],
        createdAt: now,
        updatedAt: now,
      });

      transaction.update(ownerRef, {
        squadId: ownerUsername,
        squadRole: 'owner',
        updatedAt: now,
        points: applyPoints(ownerData, SQUAD_POINT_ACTIONS.CREATE_SQUAD, { squadId: ownerUsername }),
      });

      return { squadId: ownerUsername, created: true };
    }

    const squadData = squadSnap.data();
    if (squadData.ownerUid !== ownerProfile.uid) {
      throw new Error('This username is already associated with another owner.');
    }

    transaction.update(ownerRef, {
      squadId: ownerUsername,
      squadRole: 'owner',
      updatedAt: now,
    });

    return { squadId: ownerUsername, created: false };
  });
}

async function getUserByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const usersRef = collection(db, 'users');
  const snap = await getDocs(query(usersRef, where('username', '==', normalized)));
  if (snap.empty) return null;
  const match = snap.docs[0];
  return { uid: match.id, ...match.data() };
}

export async function inviteUserByUsername(ownerProfile, invitedUsernameRaw) {
  if (!ownerProfile?.uid || !ownerProfile?.username) {
    throw new Error('Signed-in profile is missing username details.');
  }

  const invitedUsername = normalizeUsername(invitedUsernameRaw);
  if (!invitedUsername) {
    throw new Error('Enter a valid username to invite.');
  }

  const ownerUsername = normalizeUsername(ownerProfile.username);
  if (ownerUsername === invitedUsername) {
    throw new Error('You cannot invite yourself.');
  }

  const invitee = await getUserByUsername(invitedUsername);
  if (!invitee) {
    throw new Error('No user found with that username.');
  }

  const squadRef = doc(db, 'squads', ownerUsername);
  const ownerRef = doc(db, 'users', ownerProfile.uid);
  const now = serverTimestamp();

  return runTransaction(db, async (transaction) => {
    const squadSnap = await transaction.get(squadRef);
    const ownerSnap = await transaction.get(ownerRef);
    if (!squadSnap.exists()) {
      throw new Error('Create your squad before sending invites.');
    }
    if (!ownerSnap.exists()) {
      throw new Error('Owner profile does not exist.');
    }

    const squadData = squadSnap.data();
    if (squadData.ownerUid !== ownerProfile.uid) {
      throw new Error('Only the squad owner can invite members.');
    }

    const isMember = (squadData.memberUsernames || []).includes(invitedUsername);
    const alreadyInvited = (squadData.invitedUsernames || []).includes(invitedUsername);
    if (isMember || alreadyInvited) {
      return { invited: false, reason: 'already-present' };
    }

    const ownerData = profileWithPoints(ownerSnap.data());
    transaction.update(squadRef, {
      invitedUsernames: arrayUnion(invitedUsername),
      updatedAt: now,
    });
    transaction.update(ownerRef, {
      points: applyPoints(ownerData, SQUAD_POINT_ACTIONS.INVITE_MEMBER, { username: invitedUsername }),
      updatedAt: now,
    });

    return { invited: true };
  });
}

export async function joinSquadByUsername(memberProfile, ownerUsernameRaw) {
  if (!memberProfile?.uid || !memberProfile?.username) {
    throw new Error('Signed-in profile is missing username details.');
  }

  const ownerUsername = normalizeUsername(ownerUsernameRaw);
  if (!ownerUsername) {
    throw new Error('Enter a valid squad owner username.');
  }

  const memberUsername = normalizeUsername(memberProfile.username);
  if (ownerUsername === memberUsername) {
    throw new Error('Use "Create/Own Squad" to own your own squad.');
  }

  const squadRef = doc(db, 'squads', ownerUsername);
  const memberRef = doc(db, 'users', memberProfile.uid);
  const now = serverTimestamp();

  return runTransaction(db, async (transaction) => {
    const squadSnap = await transaction.get(squadRef);
    const memberSnap = await transaction.get(memberRef);

    if (!squadSnap.exists()) {
      throw new Error('No squad found for that username.');
    }
    if (!memberSnap.exists()) {
      throw new Error('Your profile was not found.');
    }

    const memberData = profileWithPoints(memberSnap.data());
    const squadData = squadSnap.data();
    const existingMemberUsernames = squadData.memberUsernames || [];
    if (existingMemberUsernames.includes(memberUsername)) {
      return { joined: false, reason: 'already-member' };
    }

    if (memberData.squadId && memberData.squadId !== ownerUsername) {
      throw new Error('Leave your current squad before joining another.');
    }

    transaction.update(squadRef, {
      memberUids: arrayUnion(memberProfile.uid),
      memberUsernames: arrayUnion(memberUsername),
      updatedAt: now,
    });
    transaction.update(memberRef, {
      squadId: ownerUsername,
      squadRole: 'member',
      updatedAt: now,
      points: applyPoints(memberData, SQUAD_POINT_ACTIONS.JOIN_SQUAD, { squadId: ownerUsername }),
    });

    return { joined: true, squadId: ownerUsername };
  });
}

export async function getSquadForUser(profile) {
  if (!profile?.squadId) {
    return null;
  }

  const squadRef = doc(db, 'squads', profile.squadId);
  const squadSnap = await getDoc(squadRef);
  if (!squadSnap.exists()) return null;

  const squadData = squadSnap.data();
  const memberUids = Array.isArray(squadData.memberUids) ? squadData.memberUids : [];
  const memberProfiles = await Promise.all(
    memberUids.map(async (uid) => {
      const memberSnap = await getDoc(doc(db, 'users', uid));
      if (!memberSnap.exists()) return null;
      const data = memberSnap.data();
      return {
        uid,
        name: data.fullName || data.username || 'User',
        username: data.username || '',
        points: Number(data?.points?.total || 0),
        squadRole: data.squadRole || 'member',
      };
    })
  );

  return {
    squadId: squadData.squadId || profile.squadId,
    ownerUsername: squadData.ownerUsername,
    invitedUsernames: squadData.invitedUsernames || [],
    members: memberProfiles.filter(Boolean),
  };
}
