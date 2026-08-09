import { describe, it, expect } from 'vitest';
import { buildCommentTree } from '@/lib/utils/commentUtils';
import type { Comment, UserProfile } from '@/lib/types';

const author: UserProfile = {
  uid: 'u1',
  email: 'u1@vit.edu.in',
  displayName: 'Test User',
  photoURL: null,
};

function makeComment(overrides: Partial<Comment> & { id: string }): Comment {
  return {
    questionId: 'q1',
    parentId: null,
    content: `content for ${overrides.id}`,
    author,
    createdAt: '2026-01-01T00:00:00.000Z',
    upvotes: 0,
    downvotes: 0,
    ...overrides,
  };
}

describe('buildCommentTree', () => {
  it('keeps all-null parentId comments top-level, in input order', () => {
    const a = makeComment({ id: 'a', parentId: null });
    const b = makeComment({ id: 'b', parentId: null });
    const c = makeComment({ id: 'c', parentId: null });

    const tree = buildCommentTree([a, b, c]);

    expect(tree.map(node => node.id)).toEqual(['a', 'b', 'c']);
    tree.forEach(node => expect(node.replies).toEqual([]));
  });

  it('nests a child under its present parent and does not duplicate it top-level', () => {
    const parent = makeComment({ id: 'parent', parentId: null });
    const child = makeComment({ id: 'child', parentId: 'parent' });

    const tree = buildCommentTree([parent, child]);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('parent');
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe('child');
    // The child must not also appear as a top-level entry.
    expect(tree.some(node => node.id === 'child')).toBe(false);
  });

  it('promotes an orphan (parent filtered out) to top-level instead of dropping it', () => {
    const orphan = makeComment({ id: 'orphan', parentId: 'does-not-exist' });

    const tree = buildCommentTree([orphan]);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('orphan');
  });

  it('a parentId cycle terminates without duplicating any comment', () => {
    const a = makeComment({ id: 'a', parentId: 'b' });
    const b = makeComment({ id: 'b', parentId: 'a' });

    // The real risk with cyclic input is a recursive implementation
    // stack-overflowing or hanging. buildCommentTree is two flat forEach
    // passes with no recursion, so this must return synchronously.
    const tree = buildCommentTree([a, b]);

    // Both comments resolve to a valid (mutually circular) parent, so
    // neither is promoted to top-level - they end up referencing each
    // other via `replies` instead of appearing in the returned array. The
    // guarantee under test is that construction terminates and nothing
    // from a cycle is duplicated into the result.
    expect(tree).toEqual([]);
  });
});
