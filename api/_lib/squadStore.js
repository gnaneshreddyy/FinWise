import { getDb } from './mongo.js';
import { HttpError } from './http.js';
import { awardPoints, findUserByUsername, getUser, toPublicProfile } from './userStore.js';
import { SQUAD_POINT_ACTIONS, normalizeUsername } from '../../core/profile.js';

// squads: { _id: ownerUsername, ownerUid, memberUids[], memberUsernames[], invitedUsernames[], createdAt, updatedAt }
// All checks and point awards happen here, so clients can no longer grant themselves points.

async function requireUser(uid) {
  const user = await getUser(uid);
  if (!user) throw new HttpError(404, 'Profile not found. Reload the page and try again.');
  return user;
}

export async function getSquadFor(uid) {
  const db = await getDb();
  const user = await requireUser(uid);
  if (!user.squadId) return null;

  const squad = await db.collection('squads').findOne({ _id: user.squadId });
  if (!squad) return null;
  const members = await db.collection('users').find({ _id: { $in: squad.memberUids } }).toArray();
  return {
    squadId: squad._id,
    ownerUsername: squad.ownerUsername,
    invitedUsernames: squad.invitedUsernames || [],
    members: members.map((member) => {
      const pub = toPublicProfile(member);
      return { ...pub, name: pub.fullName || pub.username, points: pub.points.total, squadRole: pub.squadRole || 'member' };
    }),
  };
}

export async function createSquad(uid) {
  const db = await getDb();
  const owner = await requireUser(uid);
  const squadId = owner.username;
  if (owner.squadId && owner.squadId !== squadId) throw new HttpError(409, 'Leave your current squad before creating one.');

  const now = new Date();
  const { upsertedCount } = await db.collection('squads').updateOne(
    { _id: squadId, ownerUid: uid },
    {
      $setOnInsert: {
        ownerUid: uid,
        ownerUsername: squadId,
        memberUids: [uid],
        memberUsernames: [squadId],
        invitedUsernames: [],
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true }
  );
  await db.collection('users').updateOne({ _id: uid }, { $set: { squadId, squadRole: 'owner', updatedAt: now } });
  if (upsertedCount) await awardPoints(uid, SQUAD_POINT_ACTIONS.create, { squadId });
  return { squadId, created: Boolean(upsertedCount) };
}

export async function inviteToSquad(uid, rawUsername) {
  const db = await getDb();
  const owner = await requireUser(uid);
  const username = normalizeUsername(rawUsername);
  if (username === owner.username) throw new HttpError(400, 'You cannot invite yourself.');
  if (!(await findUserByUsername(username))) throw new HttpError(404, 'No user found with that username.');

  const squad = await db.collection('squads').findOne({ _id: owner.username, ownerUid: uid });
  if (!squad) throw new HttpError(400, 'Create your squad before sending invites.');

  const { modifiedCount } = await db.collection('squads').updateOne(
    { _id: squad._id, memberUsernames: { $ne: username }, invitedUsernames: { $ne: username } },
    { $push: { invitedUsernames: username }, $set: { updatedAt: new Date() } }
  );
  if (!modifiedCount) return { invited: false, reason: 'already-present' };
  await awardPoints(uid, SQUAD_POINT_ACTIONS.invite, { username });
  return { invited: true };
}

export async function joinSquad(uid, rawOwnerUsername) {
  const db = await getDb();
  const member = await requireUser(uid);
  const squadId = normalizeUsername(rawOwnerUsername);
  if (squadId === member.username) throw new HttpError(400, 'Use "Create squad" to own your own squad.');
  if (member.squadId && member.squadId !== squadId) throw new HttpError(409, 'Leave your current squad before joining another.');

  const squad = await db.collection('squads').findOne({ _id: squadId });
  if (!squad) throw new HttpError(404, 'No squad found for that username.');

  const { modifiedCount } = await db.collection('squads').updateOne(
    { _id: squadId, memberUids: { $ne: uid } },
    { $push: { memberUids: uid, memberUsernames: member.username }, $set: { updatedAt: new Date() } }
  );
  if (!modifiedCount) return { joined: false, reason: 'already-member' };

  await db.collection('users').updateOne({ _id: uid }, { $set: { squadId, squadRole: 'member', updatedAt: new Date() } });
  await awardPoints(uid, SQUAD_POINT_ACTIONS.join, { squadId });
  return { joined: true, squadId };
}
