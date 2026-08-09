import { describe, it, expect } from 'vitest';
import { filterQuestions, sortQuestions } from '@/lib/utils/questionListUtils';
import type { Question, UserProfile } from '@/lib/types';

const author: UserProfile = {
  uid: 'u1',
  email: 'u1@vit.edu.in',
  displayName: 'Test User',
  photoURL: null,
};

function makeQuestion(overrides: Partial<Question> & { id: string }): Question {
  return {
    title: `Question ${overrides.id}`,
    content: 'content',
    tags: [],
    author,
    createdAt: '2026-01-01T00:00:00.000Z',
    upvotes: 0,
    downvotes: 0,
    communityId: 'all',
    views: 0,
    replyCount: 0,
    ...overrides,
  };
}

describe('sortQuestions', () => {
  it('activity-desc falls back to createdAt when lastActivityAt is absent', () => {
    const older = makeQuestion({ id: 'older', createdAt: '2026-01-01T00:00:00.000Z' });
    const newer = makeQuestion({ id: 'newer', createdAt: '2026-02-01T00:00:00.000Z' });

    const sorted = sortQuestions([older, newer], 'activity-desc');

    expect(sorted.map(q => q.id)).toEqual(['newer', 'older']);
  });

  it('an unknown sort key behaves like the default (activity-desc)', () => {
    const older = makeQuestion({ id: 'older', createdAt: '2026-01-01T00:00:00.000Z' });
    const newer = makeQuestion({ id: 'newer', createdAt: '2026-02-01T00:00:00.000Z' });

    const sortedUnknown = sortQuestions([older, newer], 'not-a-real-sort-key');
    const sortedDefault = sortQuestions([older, newer], 'activity-desc');

    expect(sortedUnknown.map(q => q.id)).toEqual(sortedDefault.map(q => q.id));
  });

  it('returns a new array and leaves the input unchanged (#40)', () => {
    const a = makeQuestion({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' });
    const b = makeQuestion({ id: 'b', createdAt: '2026-02-01T00:00:00.000Z' });
    // Ascending input order; sorting desc would reorder this array in
    // place if sortQuestions still mutated its argument.
    const input = [a, b];

    const result = sortQuestions(input, 'activity-desc');

    expect(result).not.toBe(input);
    expect(input).toEqual([a, b]);
  });
});

describe('filterQuestions', () => {
  it('filters by communityId, treating "all" as no filter', () => {
    const gdg = makeQuestion({ id: 'gdg-q', communityId: 'gdg' });
    const acm = makeQuestion({ id: 'acm-q', communityId: 'acm' });

    expect(filterQuestions([gdg, acm], { communityFilter: 'gdg' })).toEqual([gdg]);
    expect(filterQuestions([gdg, acm], { communityFilter: 'all' })).toEqual([gdg, acm]);
  });

  it('filters by a case-insensitive search term across title/content/tags', () => {
    const match = makeQuestion({ id: 'match', title: 'How to use React Hooks' });
    const noMatch = makeQuestion({ id: 'no-match', title: 'Arduino wiring question' });

    expect(filterQuestions([match, noMatch], { searchTerm: 'REACT' })).toEqual([match]);
  });

  it('never mutates the input array', () => {
    const a = makeQuestion({ id: 'a', communityId: 'gdg' });
    const b = makeQuestion({ id: 'b', communityId: 'acm' });
    const input = [a, b];

    filterQuestions(input, { communityFilter: 'gdg' });

    expect(input).toEqual([a, b]);
  });
});
