// Run: npx tsx scripts/check-serialize.ts
// Asserts serialize() turns Firestore Timestamps (at any depth) into ISO strings
// and leaves everything else as plain JSON, which React requires at the
// server->client boundary of every 'use server' read.
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase-admin/firestore';
import { serialize } from '../src/lib/serialize';

const t = Timestamp.fromDate(new Date('2026-01-02T03:04:05.000Z'));
const out = serialize({ id: 'q1', updatedAt: t, author: { createdAt: t, name: 'a' }, tags: ['x'], n: 1, nil: null, list: [{ at: t }] });
assert.equal(out.updatedAt, '2026-01-02T03:04:05.000Z');
assert.equal(out.author.createdAt, '2026-01-02T03:04:05.000Z');
assert.equal(out.list[0].at, '2026-01-02T03:04:05.000Z');
assert.deepEqual(JSON.parse(JSON.stringify(out)), out);
assert.deepEqual(out.tags, ['x']);
console.log('ok: serialize converts nested Timestamps to ISO strings');
