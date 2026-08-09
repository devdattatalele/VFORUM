// Exercises the deployed firestore.rules (currently a blanket
// `allow read, write: if false;`) against the emulator, at the real paths
// production code actually uses - not invented ones. The collections/paths
// below come from:
//   - src/lib/services/userService.ts   -> users, roleChanges
//   - src/lib/services/commentService.ts -> questions/{qid}/comments/{cid}
//   - src/lib/services/voteService.ts    -> votes/questions/{qid}/{uid}
//   - questions/events are the other two top-level collections the app
//     reads/writes; `comments` also exists as a top-level collection from
//     legacy production data (issue #55) even though no current code path
//     reads it there.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  initializeTestEnvironment,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterEach, afterAll } from 'vitest';
import { assertEmulator } from '../helpers/assertEmulator';

const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');
const UNAUTH_UID = null;
const SIGNED_IN_UID = 'student-1';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const projectId = assertEmulator();
  const [host, portStr] = process.env.FIRESTORE_EMULATOR_HOST!.split(':');

  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host,
      port: Number(portStr),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

function dbFor(uid: string | null) {
  return uid === UNAUTH_UID
    ? testEnv.unauthenticatedContext().firestore()
    : testEnv.authenticatedContext(uid).firestore();
}

// Top-level collections the app actually reads/writes, plus `comments` -
// legacy top-level data (issue #55) that no current code path reads but
// which must be just as denied as everything else under the wildcard rule.
const TOP_LEVEL_COLLECTIONS = ['questions', 'events', 'users', 'roleChanges', 'comments'] as const;

describe.each(TOP_LEVEL_COLLECTIONS)('top-level /%s', (collectionName) => {
  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies get (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).collection(collectionName).doc('doc-1').get());
  });

  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies set (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).collection(collectionName).doc('doc-1').set({ probe: true }));
  });
});

// This is the test that matters: default-deny must not be misread as
// "signed-in users can read". Every collection above is already checked
// against both an unauthenticated AND an authenticated (student-1) context,
// specifically so a future rules change that accidentally adds
// `if request.auth != null` for one collection gets caught here rather than
// only being noticed once it reaches production.

describe('subcollection /questions/{qid}/comments/{cid}', () => {
  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies get (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).doc('questions/q1/comments/c1').get());
  });

  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies set (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).doc('questions/q1/comments/c1').set({ content: 'probe' }));
  });
});

describe('4-segment path /votes/questions/{qid}/{uid} (voteService.ts)', () => {
  // voteService.ts writes to adminDb.doc(`votes/questions/${questionId}/${userId}`) -
  // a document reference four path segments deep. Nothing about the rules
  // library's path handling is 4-segment-specific, but this is worth
  // asserting explicitly rather than assuming, since the whole point of this
  // suite is to test the paths the app actually uses.
  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies get (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).doc('votes/questions/q1/student-1').get());
  });

  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies set (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).doc('votes/questions/q1/student-1').set({ voteType: 'up' }));
  });
});

describe('list vs get on /questions', () => {
  // `list` (collection-level queries) and `get` (single-document reads) are
  // separate request types under Firestore security rules - denying one
  // does not deny the other. The current rule denies both via the `read`
  // alias, but that's exactly the kind of thing a future edit could get
  // half-right (e.g. gating `get` but forgetting `list`), so both are
  // asserted independently rather than inferring one from the other.
  it.each([UNAUTH_UID, SIGNED_IN_UID])('denies list (auth=%s)', async (uid) => {
    await assertFails(dbFor(uid).collection('questions').get());
  });
});
